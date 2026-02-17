const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://almacenrefrielectricos-production.up.railway.app';

const catalogGrid = document.getElementById('catalogGrid');
const searchInput = document.getElementById('buscarProducto');
const categorySelect = document.getElementById('filtroCategoria');
const brandSelect = document.getElementById('filtroMarca');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');

let allProducts = [];

// Helper for secure WhatsApp number
const getWppNum = () => {
    const p1 = "57", p2 = "304", p3 = "670", p4 = "2677";
    return p1 + p2 + p3 + p4;
};

// UI Helpers
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-in forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        allProducts = await response.json();
        populateFilters();
        filterCards();
    } catch (error) {
        console.error('Error loading products:', error);
        resultsCount.textContent = 'Error al cargar productos. Intenta más tarde.';
    }
}

function populateFilters() {
    const categories = new Set();
    const brands = new Set();

    allProducts.forEach(p => {
        if (p.category) categories.add(p.category);
        if (p.brands) {
            // Split brands by space or comma and trim
            const bList = p.brands.split(/[ ,]+/).filter(Boolean);
            bList.forEach(b => brands.add(b.trim()));
        }
    });

    // Populate Categories
    const sortedCats = Array.from(categories).sort();
    categorySelect.innerHTML = '<option value="all">Todas</option>' +
        sortedCats.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('');

    // Populate Brands
    const sortedBrands = Array.from(brands).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    brandSelect.innerHTML = '<option value="all">Todas</option>' +
        sortedBrands.map(b => `<option value="${b.toLowerCase()}">${b}</option>`).join('');
}

function renderProduct(product) {
    return `
    <article class="catalog-card" data-id="${product.id}" data-price="${product.price}">
        <div class="catalog-image" onclick="openLightbox('${product.image_url}')" style="cursor: zoom-in;">
            <img src="${product.image_url}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="card-title">
            <i class="fas fa-box"></i>
            <h3>${product.name}</h3>
        </div>
        <p>Marcas: ${product.brands}</p>
        <div class="card-actions">
            <button class="btn btn-secondary btn-small" onclick='openModal(${JSON.stringify(product)})'>Ver opciones</button>
            <button class="btn btn-primary btn-small" onclick='addToCart(${JSON.stringify(product)})'>
                <i class="fas fa-plus"></i> Cotizar
            </button>
        </div>
    </article>
    `;
}

let currentPage = 1;
const productsPerPage = 12;

function filterCards() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const category = categorySelect.value;
    const brand = brandSelect.value;

    const filtered = allProducts.filter(product => {
        const searchText = (product.name + ' ' + (product.code || '') + ' ' + product.search_tags).toLowerCase();
        const matchesQuery = !query || searchText.includes(query);
        const matchesCategory = category === 'all' || product.category === category;
        const matchesBrand = brand === 'all' || product.brands.toLowerCase().includes(brand);
        return matchesQuery && matchesCategory && matchesBrand;
    });

    // Pagination Logic
    const totalProducts = filtered.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    catalogGrid.innerHTML = '';
    paginatedProducts.forEach(product => {
        catalogGrid.innerHTML += renderProduct(product);
    });

    resultsCount.textContent = `${totalProducts} productos disponibles`;
    noResults.style.display = totalProducts === 0 ? 'block' : 'none';

    // Update Pagination UI
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('paginationControls').style.display = totalProducts > 0 ? 'flex' : 'none';
}

function changePage(step) {
    currentPage += step;
    filterCards();
    document.getElementById('lista').scrollIntoView({ behavior: 'smooth' });
}

function quoteWhatsapp(productName) {
    const message = `Hola, estoy interesado en cotizar: ${productName}`;
    const url = `https://api.whatsapp.com/send?phone=${getWppNum()}&text=${encodeURIComponent(message)}`;
    window.location.href = url;
}

[searchInput, categorySelect, brandSelect].forEach(element => {
    if (!element) return;
    element.addEventListener('input', filterCards);
    element.addEventListener('change', filterCards);
});

loadProducts();

const modal = document.getElementById('productoModal');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalOptions = document.getElementById('modalOptions');
const closeButtons = document.querySelectorAll('[data-close]');

function openModal(product) {
    const title = product.name;
    const options = (product.options || '').split('|').filter(Boolean);

    modalTitle.textContent = title;
    modalPrice.textContent = ''; // Hidden for end user
    modalOptions.innerHTML = options.length
        ? options.map((option, index) => `
                    <label class="modal-option">
                        <input type="radio" name="opcion" ${index === 0 ? 'checked' : ''} value="${option}">
                        ${option}
                    </label>
                `).join('')
        : '<p class="modal-option">Consulta disponibilidad específica.</p>';

    // Store current product in modal for "Add to Quote" action
    modal.dataset.productId = product.id;
    modal.dataset.productName = product.name;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

// Event listeners for static buttons removed since we use dynamic rendering with onclick

closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
});

modal.addEventListener('click', event => {
    if (event.target === modal) {
        closeModal();
    }
});

// Cart Logic
let cart = [];
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountBadge = document.getElementById('cartCount');

function toggleCart() {
    cartSidebar.classList.toggle('open');
}

function addToCart(product, option = null) {
    const item = {
        id: product.id,
        name: product.name,
        price: product.price_text,
        price_raw: product.price, // Store raw DB price as fallback
        option: option || 'Estándar' // Can be e.g. "R134A ($22.000)"
    };
    cart.push(item);
    updateCartUI();

    // Visual feedback
    const btn = event.target.closest('button'); // Ensure we target the button even if icon clicked
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 1000);
    }

    if (!cartSidebar.classList.contains('open')) {
        // Optional: bounce the cart icon
    }
}

// Header Cart Dropdown Logic
function showCartDropdown() {
    if (cart.length > 0) {
        document.getElementById('cartDropdown').classList.add('show');
    }
}

function hideCartDropdown() {
    document.getElementById('cartDropdown').classList.remove('show');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    // Update all badges
    if (cartCountBadge) cartCountBadge.textContent = cart.length;
    const navBadge = document.getElementById('cartBadge');
    if (navBadge) {
        navBadge.textContent = cart.length;
        navBadge.style.transform = 'scale(1.2)';
        setTimeout(() => navBadge.style.transform = 'scale(1)', 300);
    }

    // Sidebar items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-basket" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <p>Tu carrito está vacío</p>
                    </div>`;
        document.getElementById('cartDropdownItems').innerHTML = '<p class="empty-msg">Tu carrito está vacío</p>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.option}</p>
                    </div>
                    <button class="cart-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

    // Dropdown items
    const dropdownItemsContainer = document.getElementById('cartDropdownItems');
    dropdownItemsContainer.innerHTML = cart.map((item) => `
        <div class="dropdown-item">
            <span>${item.name}</span>
            <small>${item.option ? item.option.split(' ')[0] : ''}</small>
        </div>
    `).join('');
}

async function sendBatchQuote() {
    if (cart.length === 0) {
        showToast('Agrega productos al carrito primero.', 'warning');
        return;
    }

    const name = document.getElementById('quoteName').value.trim();
    const contact = document.getElementById('quoteContact').value.trim();

    if (!name || !contact) {
        showToast('Por favor completa tu nombre y contacto para realizar la cotización.', 'warning');
        return;
    }

    const btn = document.querySelector('.cart-footer .btn-whatsapp');
    const originalText = btn.innerHTML;

    // Generate a quick random reference (4 chars)
    const ref = 'REF-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Prepare payload for backend
    let totalEstimated = 0;
    const items = cart.map(item => {
        let price = 0;
        const priceMatch = item.option ? item.option.match(/\$\s*([\d.]+)/) : null;
        if (priceMatch) {
            price = parseFloat(priceMatch[1].replace(/\./g, ''));
        }
        if (!price && item.price) {
            const basePriceMatch = item.price.match(/\$\s*([\d.]+)/);
            if (basePriceMatch) {
                price = parseFloat(basePriceMatch[1].replace(/\./g, ''));
            }
        }
        if (!price) {
            price = item.price_raw || 0;
        }
        totalEstimated += price;
        return {
            product_id: item.id,
            product_name: item.name,
            quantity: 1,
            option: item.option,
            price: price
        };
    });

    const quotationData = {
        customer_name: name,
        customer_contact: contact,
        items: items,
        total_estimated: totalEstimated,
        reference: ref
    };

    // 1. SAVE IN BACKGROUND (no await)
    // keepalive: true ensures the request finishes even if we redirect
    fetch(`${API_URL}/quotations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
        keepalive: true
    }).catch(err => console.error('Background save failed:', err));

    // 2. IMMEDIATE REDIRECT (The 1-Click experience)
    let message = `Hola, soy ${name}. Me gustaría cotizar estos productos (Ref: ${ref}):\n\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (${item.option})\n`;
    });
    message += `\nContacto: ${contact}\nQuedo atento a su respuesta. Gracias.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${getWppNum()}&text=${encodeURIComponent(message)}`;

    // Visual feedback
    btn.innerHTML = '<i class="fas fa-check"></i> Redirigiendo...';
    btn.disabled = true;

    // Clear UI but store reference for success toast if needed (optional)
    cart = [];
    updateCartUI();
    document.getElementById('quoteName').value = '';
    document.getElementById('quoteContact').value = '';

    // Redirect now
    window.location.href = whatsappUrl;
}

// Modal "Add" Action
document.querySelector('#productoModal .btn-primary').addEventListener('click', () => {
    // Get selected option
    const selectedOption = document.querySelector('input[name="opcion"]:checked')?.value;
    const productId = modal.dataset.productId;
    const productName = modal.dataset.productName;

    // Find product object (inefficient but works for small catalog)
    // Ideally we pass the full object to openModal and store it
    // Rescuing price from existing loaded products would be safer
    const product = allProducts.find(p => p.id == productId);

    if (product) {
        addToCart(product, selectedOption);
        closeModal();
        toggleCart(); // Open cart to show addition
    }
});

// Remove old "Cotizar" button from modal since we now rely on the batch quote
// OR change it to "Agregar y salir"
const modalActions = document.querySelector('.modal-actions');
// We render these buttons dynamically or just change their text in HTML?
// The HTML has:
// <button class="btn btn-primary btn-small" type="button">Agregar a cotización</button>
// <button class="btn btn-whatsapp btn-small" type="button"><i class="fab fa-whatsapp"></i> Cotizar</button>

// Let's hide the individual "Cotizar" button in CSS or JS since user wants bulk quote
// For now, let's just make the "Agregar" button work (listener added above)

function openLightbox(url) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    img.src = url;
    modal.style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightboxModal').style.display = 'none';
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (modal.classList.contains('open')) closeModal();
        if (cartSidebar.classList.contains('open')) toggleCart();
        closeLightbox();
    }
});
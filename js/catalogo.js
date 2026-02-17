const API_URL = 'https://almacenrefrielectricos-production.up.railway.app';
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
        filterCards();
    } catch (error) {
        console.error('Error loading products:', error);
        resultsCount.textContent = 'Error al cargar productos. Intenta más tarde.';
    }
}

function renderProduct(product) {
    return `
    <article class="catalog-card" data-id="${product.id}" data-price="${product.price}">
        <div class="catalog-image">
            <img src="${product.image_url}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="card-title">
            <i class="fas fa-box"></i>
            <h3>${product.name}</h3>
        </div>
        <p>Marcas: ${product.brands}</p>
        <div class="price">${product.price_text}</div>
        <div class="card-actions">
            <button class="btn btn-secondary btn-small" onclick='openModal(${JSON.stringify(product)})'>Ver opciones</button>
            <button class="btn btn-primary btn-small" onclick='addToCart(${JSON.stringify(product)})'>
                <i class="fas fa-plus"></i> Agregar
            </button>
        </div>
    </article>
    `;
}

function filterCards() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const category = categorySelect.value;
    const brand = brandSelect.value;
    let visible = 0;

    catalogGrid.innerHTML = '';

    const filtered = allProducts.filter(product => {
        const searchText = (product.name + ' ' + product.search_tags).toLowerCase();
        const matchesQuery = !query || searchText.includes(query);
        const matchesCategory = category === 'all' || product.category === category;
        const matchesBrand = brand === 'all' || product.brands.toLowerCase().includes(brand);
        return matchesQuery && matchesCategory && matchesBrand;
    });

    filtered.forEach(product => {
        catalogGrid.innerHTML += renderProduct(product);
    });

    visible = filtered.length;
    resultsCount.textContent = `${visible} productos disponibles`;
    noResults.style.display = visible === 0 ? 'block' : 'none';
}

function quoteWhatsapp(productName) {
    const message = `Hola, estoy interesado en cotizar: ${productName}`;
    window.open(`https://wa.me/${getWppNum()}?text=${encodeURIComponent(message)}`, '_blank');
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
    const price = product.price_text;
    const options = (product.options || '').split('|').filter(Boolean);

    modalTitle.textContent = title;
    modalPrice.textContent = price;
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

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    cartCountBadge.textContent = cart.length;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-basket" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <p>Tu carrito está vacío</p>
                    </div>`;
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

    // Prepare payload for backend
    let totalEstimated = 0;
    const items = cart.map(item => {
        let price = 0;

        // 1. Try to parse price from option string e.g. "3/8 ($8.500)"
        const priceMatch = item.option ? item.option.match(/\$\s*([\d.]+)/) : null;
        if (priceMatch) {
            price = parseFloat(priceMatch[1].replace(/\./g, ''));
        }

        // 2. Fallback to base product price text (cleaning 'Desde $20.000')
        if (!price && item.price) {
            const basePriceMatch = item.price.match(/\$\s*([\d.]+)/);
            if (basePriceMatch) {
                price = parseFloat(basePriceMatch[1].replace(/\./g, ''));
            }
        }

        // 3. Last resort: Raw price from DB
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
        total_estimated: totalEstimated
    };

    const btn = document.querySelector('.cart-footer .btn-whatsapp');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btn.disabled = true;

    try {
        // 1. Save to Backend
        const response = await fetch(`${API_URL}/quotations/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quotationData)
        });

        if (!response.ok) throw new Error('Error guardando cotización');

        const result = await response.json();
        console.log('Cotización guardada:', result);

        // 2. Open WhatsApp
        let message = `Hola, soy ${name}. Me gustaría cotizar los siguientes productos (Cotización #${result.id}):\n\n`;
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} (${item.option})\n`;
        });
        message += `\nContacto: ${contact}`;
        message += "\nQuedo atento a su respuesta. Gracias.";

        window.open(`https://wa.me/${getWppNum()}?text=${encodeURIComponent(message)}`, '_blank');

        // 3. Clear Cart
        cart = [];
        updateCartUI();
        document.getElementById('quoteName').value = '';
        document.getElementById('quoteContact').value = '';
        toggleCart();
        showToast('Cotización enviada exitosamente.');

    } catch (error) {
        console.error('Error:', error);
        showToast('Hubo un error al procesar la cotización. Intenta nuevamente.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
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

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (modal.classList.contains('open')) closeModal();
        // Close sidebar if open? 
        if (cartSidebar.classList.contains('open')) toggleCart();
    }
});
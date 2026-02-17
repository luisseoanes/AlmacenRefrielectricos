const API_URL = 'http://localhost:8000';

// Check Auth
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    const response = await fetch(url, options);
    if (response.status === 401) {
        logout();
    }
    return response;
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function switchView(viewId) {
    document.querySelectorAll('.section-view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (viewId === 'quotations') loadQuotations();
    if (viewId === 'sales') loadSales();
    if (viewId === 'products') loadProducts();
    if (viewId === 'dashboard') loadDashboardData();
}

// --- DASHBOARD ---
async function loadDashboardData() {
    try {
        const response = await fetchWithAuth(`${API_URL}/stats`);
        const stats = await response.json();

        document.getElementById('totalQuoted').textContent = stats.total_quoted.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        document.getElementById('totalPurchased').textContent = stats.total_purchased.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

        // Load products count (need to fetch separately or add to stats, for now separate)
        fetchProductsCount();

        // Load recent sales
        const qResponse = await fetchWithAuth(`${API_URL}/quotations/`);
        const quotations = await qResponse.json();

        const sales = quotations.filter(q => q.status === 'Purchased').slice(0, 5);
        const salesBody = document.querySelector('#recentSalesTable tbody');
        salesBody.innerHTML = sales.map(q => `
                    <tr>
                        <td>#${q.id}</td>
                        <td>${q.customer_name}</td>
                        <td>${q.total_estimated.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                        <td>${new Date(q.created_at).toLocaleDateString()}</td>
                        <td><span class="status-badge status-purchased">Completada</span></td>
                    </tr>
                `).join('');

    } catch (error) {
        console.error('Error loading stats', error);
    }
}

async function fetchProductsCount() {
    const response = await fetch(`${API_URL}/products/`);
    const products = await response.json();
    document.getElementById('totalProducts').textContent = products.length;
}

// --- QUOTATIONS ---
async function loadQuotations() {
    try {
        const response = await fetchWithAuth(`${API_URL}/quotations/`);
        const quotations = await response.json();

        const tbody = document.querySelector('#quotationsTable tbody');
        tbody.innerHTML = quotations.map(q => `
                    <tr>
                        <td>#${q.id}</td>
                        <td>${q.customer_name}</td>
                        <td>${q.customer_contact}</td>
                        <td>${q.total_estimated.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                        <td>${new Date(q.created_at).toLocaleDateString()}</td>
                        <td>
                            <span class="status-badge status-${q.status.toLowerCase()}">${q.status}</span>
                        </td>
                        <td>
                            ${q.status === 'Pending' ? `
                                <button class="btn-action bg-blue" title="Ver Productos" onclick='viewQuotationItems(${JSON.stringify(q).replace(/'/g, "&#39;")})'><i class="fas fa-eye"></i></button>
                                <button class="btn-action btn-edit" title="Editar Precio" onclick="editQuotationPrice(${q.id}, ${q.total_estimated})"><i class="fas fa-edit"></i></button>
                                <button class="btn-action btn-approve" title="Marcar como Comprado" onclick="updateStatus(${q.id}, 'Purchased')"><i class="fas fa-check"></i></button>
                                <button class="btn-action btn-cancel" title="Cancelar Cotización" onclick="updateStatus(${q.id}, 'Cancelled')"><i class="fas fa-times"></i></button>
                            ` : `
                                <button class="btn-action bg-blue" title="Ver Productos" onclick='viewQuotationItems(${JSON.stringify(q).replace(/'/g, "&#39;")})'><i class="fas fa-eye"></i></button>
                            `}
                        </td>
                    </tr>
                `).join('');
    } catch (error) {
        console.error('Error loading quotations', error);
    }
}

// --- SALES ---
async function loadSales() {
    try {
        const response = await fetchWithAuth(`${API_URL}/quotations/`);
        const quotations = await response.json();
        const sales = quotations.filter(q => q.status === 'Purchased');

        const tbody = document.querySelector('#salesTable tbody');
        tbody.innerHTML = sales.map(q => `
                    <tr>
                        <td>#${q.id}</td>
                        <td>${q.customer_name}</td>
                        <td>${q.customer_contact}</td>
                        <td>${q.total_estimated.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                        <td>${new Date(q.created_at).toLocaleDateString()}</td>
                        <td><span class="status-badge status-purchased">Completada</span></td>
                    </tr>
                `).join('');
    } catch (error) { console.error(error); }
}

async function updateStatus(id, status) {
    if (!confirm(`¿Marcar cotización #${id} como ${status}?`)) return;
    try {
        await fetchWithAuth(`${API_URL}/quotations/${id}/status?status=${status}`, { method: 'PUT' });
        // Reload current view context
        loadQuotations();
        loadSales(); // In case we switched
        loadDashboardData(); // Refresh global stats
    } catch (error) {
        console.error('Error updating status', error);
    }
}

function viewQuotationItems(quotation) {
    document.getElementById('modalQuoteId').textContent = quotation.id;
    const tbody = document.querySelector('#modalItemsTable tbody');

    let items = [];
    if (quotation.items) {
        // Handle if items is string or object (SQLite JSON sometimes returns string)
        items = typeof quotation.items === 'string' ? JSON.parse(quotation.items) : quotation.items;
    }

    // Store current items for editing
    window.currentQuoteItems = items;
    window.originalQuoteItems = JSON.parse(JSON.stringify(items)); // Deep copy for cancel

    renderEditItemsTable(items, false); // Render properly (read-only initially)

    document.getElementById('quotationDetailsModal').style.display = "block";

    // Reset edit state
    document.getElementById('editQuoteControls').style.display = 'none';
    document.getElementById('btnEnableEdit').style.display = 'inline-block';
    document.getElementById('btnSaveEdit').style.display = 'none';
    document.getElementById('btnCancelEdit').style.display = 'none';
    document.querySelectorAll('.edit-col').forEach(el => el.style.display = 'none');
}

function enableEditQuoteItems() {
    document.getElementById('editQuoteControls').style.display = 'block';
    document.getElementById('btnEnableEdit').style.display = 'none';
    document.getElementById('btnSaveEdit').style.display = 'inline-block';
    document.getElementById('btnCancelEdit').style.display = 'inline-block';

    renderEditItemsTable(window.currentQuoteItems, true);
}

function cancelEditQuoteItems() {
    // Revert items
    window.currentQuoteItems = JSON.parse(JSON.stringify(window.originalQuoteItems));

    document.getElementById('editQuoteControls').style.display = 'none';
    document.getElementById('btnEnableEdit').style.display = 'inline-block';
    document.getElementById('btnSaveEdit').style.display = 'none';
    document.getElementById('btnCancelEdit').style.display = 'none';

    renderEditItemsTable(window.currentQuoteItems, false);
}

function renderEditItemsTable(items, isEditable) {
    const tbody = document.querySelector('#modalItemsTable tbody');
    const headEditCol = document.querySelector('#modalItemsTable thead .edit-col');

    if (isEditable) {
        headEditCol.style.display = 'table-cell';
    } else {
        headEditCol.style.display = 'none';
    }

    tbody.innerHTML = items.map((item, index) => `
        <tr>
            <td>${item.product_name}</td>
            <td>
                ${isEditable ? `<input type="text" value="${item.option || ''}" onchange="updateQuoteItem(${index}, 'option', this.value)" style="width: 80px;">` : (item.option || '')}
            </td>
            <td>
                ${isEditable ? `<input type="number" value="${item.quantity}" min="1" onchange="updateQuoteItem(${index}, 'quantity', this.value)" style="width: 60px;">` : item.quantity}
            </td>
            <td>${(item.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
            <td class="edit-col" style="display: ${isEditable ? 'table-cell' : 'none'};">
                <button class="btn-action btn-delete" onclick="removeQuoteItem(${index})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function updateQuoteItem(index, field, value) {
    if (field === 'quantity') value = parseInt(value) || 1;
    window.currentQuoteItems[index][field] = value;
}

function removeQuoteItem(index) {
    window.currentQuoteItems.splice(index, 1);
    renderEditItemsTable(window.currentQuoteItems, true);
}

let searchTimeout;
async function searchProductsForQuote(query) {
    if (!query) {
        document.getElementById('quoteProductSuggestions').style.display = 'none';
        return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/products/`);
            const products = await response.json();

            // Filter locally (could be backend search for optimization)
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                (p.search_tags && p.search_tags.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 10);

            const suggestions = document.getElementById('quoteProductSuggestions');
            suggestions.innerHTML = filtered.map(p => `
                <div style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;" onclick='selectProductForQuote(${JSON.stringify(p)})'>
                    <strong>${p.name}</strong> - ${p.price_text}
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } catch (e) { console.error(e); }
    }, 300);
}

function selectProductForQuote(product) {
    // Add to current items
    const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        option: product.options ? product.options.split('|')[0] : '',
        price: product.price
    };

    window.currentQuoteItems.push(newItem);
    renderEditItemsTable(window.currentQuoteItems, true);

    // Clear search
    document.getElementById('quoteProductSearch').value = '';
    document.getElementById('quoteProductSuggestions').style.display = 'none';
}

async function saveQuoteItems() {
    const id = document.getElementById('modalQuoteId').textContent;
    try {
        const response = await fetchWithAuth(`${API_URL}/quotations/${id}/items`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentQuoteItems)
        });

        if (response.ok) {
            alert('Cotización actualizada correctamente');
            closeModal('quotationDetailsModal');
            loadQuotations(); // Refresh table
            loadDashboardData(); // Refresh stats
        } else {
            alert('Error al actualizar cotización');
        }
    } catch (error) {
        console.error('Error saving quote items', error);
        alert('Error de conexión');
    }
}


function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

async function editQuotationPrice(id, currentPrice) {
    const newPrice = prompt("Ingrese el nuevo valor total de la venta:", currentPrice);
    if (newPrice === null) return; // Cancelled

    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue < 0) {
        alert("Por favor ingrese un valor numérico válido.");
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/quotations/${id}/total?total=${priceValue}`, { method: 'PUT' });
        if (response.ok) {
            alert("Precio actualizado correctamente");
            loadQuotations();
            loadDashboardData(); // Refresh stats
        } else {
            const err = await response.json();
            alert("Error al actualizar: " + err.detail);
        }
    } catch (error) {
        console.error('Error updating price', error);
        alert("Error de conexión");
    }
}

// Window onclick to close modal
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// --- ANALYTICS ---
async function getAnalytics() {
    try {
        const response = await fetchWithAuth(`${API_URL}/stats`);
        const stats = await response.json();

        // Top Products
        const topList = document.getElementById('topProductsList');
        topList.innerHTML = stats.top_products.map(p => `
                    <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <span><i class="fas fa-box" style="margin-right:10px; color: #ccc;"></i> ${p.name}</span>
                        <span style="font-weight: bold; color: var(--primary-color); background: #e9f5ff; padding: 2px 8px; border-radius: 10px;">x${p.count}</span>
                    </li>
                `).join('');

        // Sales Chart
        renderSalesChart(stats.sales_history);

    } catch (error) {
        console.error('Error loading analytics', error);
    }
}

let chartInstance = null;
function renderSalesChart(history) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [{
                label: 'Ventas ($)',
                data: history.map(h => h.amount),
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// --- PRODUCTS ---
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        const products = await response.json();

        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = products.map(p => `
                    <tr>
                        <td>${p.id}</td>
                        <td><img src="${p.image_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'"></td>
                        <td>${p.name}</td>
                        <td>${p.price_text}</td>
                        <td>${p.category}</td>
                        <td>
                            <button class="btn-action btn-edit" title="Editar" onclick='editProduct(${JSON.stringify(p)})'><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-delete" title="Eliminar" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                 `).join('');
    } catch (e) { console.error(e); }
}

function toggleProductForm() {
    const form = document.getElementById('productFormCard');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveProduct() {
    const id = document.getElementById('prodId').value;
    const product = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value) || 0,
        price_text: document.getElementById('prodPriceText').value,
        image_url: document.getElementById('prodImage').value,
        brands: document.getElementById('prodBrands').value,
        search_tags: document.getElementById('prodTags').value,
        options: document.getElementById('prodOptions').value
    };

    try {
        let url = `${API_URL}/products/`;
        let method = 'POST';

        if (id) {
            url = `${API_URL}/products/${id}`;
            method = 'PUT';
        }

        const response = await fetchWithAuth(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            toggleProductForm();
            loadProducts();
            // Clear form
            document.getElementById('prodId').value = '';
            document.querySelectorAll('#productFormCard input, #productFormCard textarea').forEach(i => i.value = '');
            loadDashboardData(); // Update count
        } else {
            alert('Error al guardar');
        }
    } catch (e) { console.error(e); }
}

function editProduct(product) {
    document.getElementById('prodId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodPriceText').value = product.price_text;
    document.getElementById('prodImage').value = product.image_url;
    document.getElementById('prodBrands').value = product.brands;
    document.getElementById('prodTags').value = product.search_tags;
    document.getElementById('prodOptions').value = product.options;

    // Show form
    const form = document.getElementById('productFormCard');
    form.style.display = 'block';

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar producto?')) return;
    try {
        await fetchWithAuth(`${API_URL}/products/${id}`, { method: 'DELETE' });
        loadProducts();
        loadDashboardData();
    } catch (e) { console.error(e); }
}

// Init
loadDashboardData();
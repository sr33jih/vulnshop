// Admin page functionality

document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access required', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    loadStats();
    loadUsers();
});

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('userCount').textContent = data.users;
            document.getElementById('productCount').textContent = data.products;
            document.getElementById('orderCount').textContent = data.orders;
            document.getElementById('revenue').textContent = `$${data.revenue.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        // VULNERABILITY: Using query parameter to bypass weak authorization
        const response = await fetch(`${API_URL}/admin/users?admin=true`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const usersList = document.getElementById('usersList');

            let html = '<table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>';

            data.users.forEach(user => {
                html += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            usersList.innerHTML = html;
        } else {
            showNotification('Failed to load users', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
    }
}

// Load orders
async function loadAdminOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const ordersList = document.getElementById('ordersAdminList');

            let html = '<table><thead><tr><th>Order ID</th><th>User</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>';

            data.orders.forEach(order => {
                html += `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.username}</td>
                        <td>${order.email}</td>
                        <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>${order.status}</td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            ordersList.innerHTML = html;
        } else {
            showNotification('Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// Load products (admin view)
async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);

        if (response.ok) {
            const data = await response.json();
            const productsList = document.getElementById('productsAdminList');

            let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>';

            data.products.forEach(product => {
                html += `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>$${parseFloat(product.price).toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="editProduct(${product.id})">Edit</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            productsList.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Show admin section
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    if (section === 'users') {
        document.getElementById('usersSection').style.display = 'block';
        loadUsers();
    } else if (section === 'orders') {
        document.getElementById('ordersAdminSection').style.display = 'block';
        loadAdminOrders();
    } else if (section === 'products') {
        document.getElementById('productsAdminSection').style.display = 'block';
        loadAdminProducts();
    }
}

// Add product form
function showAddProductForm() {
    const name = prompt('Product Name:');
    const description = prompt('Description:');
    const price = prompt('Price:');
    const category = prompt('Category:');
    const stock = prompt('Stock:');

    if (name && price) {
        addProduct({ name, description, price, category, stock });
    }
}

// Add product
async function addProduct(productData) {
    try {
        // VULNERABILITY: Using weak admin key authorization
        const response = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-Admin-Key': 'admin123' // Weak secret
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showNotification('Product added successfully!', 'success');
            loadAdminProducts();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Failed to add product', 'error');
    }
}

// Edit product
function editProduct(productId) {
    const price = prompt('Enter new price:');
    if (price) {
        updateProduct(productId, { price });
    }
}

// Update product
async function updateProduct(productId, updates) {
    try {
        // VULNERABILITY: No authorization check on this endpoint
        const response = await fetch(`${API_URL}/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            showNotification('Product updated successfully!', 'success');
            loadAdminProducts();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update product', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Failed to update product', 'error');
    }
}

// API Base URL
const API_URL = 'http://localhost:3001/api';

// Auth State
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadProducts();
        setupFilters();
    }
    updateCartCount();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        currentUser = JSON.parse(user);
        authToken = token;
        updateUIForAuth();
    }
}

// Update UI based on auth state
function updateUIForAuth() {
    const authBtn = document.getElementById('authBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.getElementById('profileLink');
    const adminLink = document.getElementById('adminLink');

    if (authBtn) authBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (profileLink) profileLink.style.display = 'block';

    // Show admin link if user is admin
    if (currentUser && currentUser.role === 'admin' && adminLink) {
        adminLink.style.display = 'block';
    }
}

// Load products
async function loadProducts(search = '', category = '') {
    try {
        let url = `${API_URL}/products?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (category) url += `category=${encodeURIComponent(category)}`;

        const response = await fetch(url);
        const data = await response.json();

        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';

        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
        } else {
            productsGrid.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">No products found</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            <button class="btn btn-primary" onclick="addToCart(${product.id})" style="width: 100%;">
                Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Setup filters
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const category = categoryFilter ? categoryFilter.value : '';
            loadProducts(e.target.value, category);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const search = searchInput ? searchInput.value : '';
            loadProducts(search, e.target.value);
        });
    }
}

// Add to cart
async function addToCart(productId) {
    if (!authToken) {
        showNotification('Please login to add items to cart', 'error');
        showAuthModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        if (response.ok) {
            showNotification('Item added to cart!', 'success');
            updateCartCount();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to add item', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add item to cart', 'error');
    }
}

// Update cart count
async function updateCartCount() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = data.items ? data.items.length : 0;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Show cart modal
document.getElementById('cartLink')?.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!authToken) {
        showNotification('Please login to view cart', 'error');
        showAuthModal();
        return;
    }

    await loadCart();
    document.getElementById('cartModal').style.display = 'block';
});

// Load cart
async function loadCart() {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');

            cartItems.innerHTML = '';

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image_url}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${parseFloat(item.price).toFixed(2)} x ${item.quantity}</p>
                            <button class="btn btn-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.85rem;" onclick="removeFromCart(${item.id})">Remove</button>
                        </div>
                        <div style="font-weight: 600;">
                            $${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                    `;
                    cartItems.appendChild(cartItem);
                });
                cartTotal.textContent = parseFloat(data.total).toFixed(2);
            } else {
                cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray);">Your cart is empty</p>';
                cartTotal.textContent = '0.00';
            }
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Failed to load cart', 'error');
    }
}

// Remove from cart
async function removeFromCart(itemId) {
    try {
        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showNotification('Item removed from cart', 'success');
            loadCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Failed to remove item', 'error');
    }
}

// Close cart modal
function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

// Checkout
async function checkout() {
    if (!currentUser || !currentUser.address) {
        showNotification('Please update your profile with a shipping address first', 'error');
        window.location.href = 'profile.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                shipping_address: currentUser.address
            })
        });

        if (response.ok) {
            showNotification('Order placed successfully!', 'success');
            closeCartModal();
            updateCartCount();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Failed to place order', 'error');
    }
}

// Show auth modal
function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Show login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Show register form
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Login
async function login(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            authToken = data.token;
            currentUser = data.user;

            showNotification('Login successful!', 'success');
            closeAuthModal();
            updateUIForAuth();
            updateCartCount();

            form.reset();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showNotification('Login failed', 'error');
    }
}

// Register
async function register(event) {
    event.preventDefault();
    const form = event.target;

    const userData = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        first_name: form.first_name.value,
        last_name: form.last_name.value
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            showLogin();
            form.reset();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error registering:', error);
        showNotification('Registration failed', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;

    showNotification('Logged out successfully', 'success');
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modals on outside click
window.onclick = function (event) {
    const cartModal = document.getElementById('cartModal');
    const authModal = document.getElementById('authModal');

    if (event.target === cartModal) {
        closeCartModal();
    }
    if (event.target === authModal) {
        closeAuthModal();
    }
}

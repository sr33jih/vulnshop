// Profile page functionality

document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    loadProfile();
    loadOrders();
});

// Load user profile
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;

            // Populate form
            document.getElementById('username').value = user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('first_name').value = user.first_name || '';
            document.getElementById('last_name').value = user.last_name || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

// Update profile
async function updateProfile(event) {
    event.preventDefault();
    const form = event.target;

    const updatedData = {
        email: form.email.value,
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        phone: form.phone.value,
        address: form.address.value
    };

    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            currentUser = data.user;
            showNotification('Profile updated successfully!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = '';

            if (data.orders && data.orders.length > 0) {
                data.orders.forEach(order => {
                    const orderCard = document.createElement('div');
                    orderCard.className = 'order-card';
                    orderCard.style.cssText = `
                        background: white;
                        padding: 1.5rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        border: 2px solid var(--border);
                    `;

                    orderCard.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <div>
                                <strong>Order #${order.id}</strong>
                                <p style="color: var(--gray); font-size: 0.9rem;">${new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span style="background: var(--primary-color); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem;">
                                    ${order.status}
                                </span>
                                <p style="font-size: 1.2rem; font-weight: 600; margin-top: 0.5rem;">$${parseFloat(order.total_amount).toFixed(2)}</p>
                            </div>
                        </div>
                        <button class="btn btn-secondary" onclick="viewOrder(${order.id})" style="padding: 0.4rem 1rem; font-size: 0.9rem;">View Details</button>
                    `;

                    ordersList.appendChild(orderCard);
                });
            } else {
                ordersList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">No orders yet</p>';
            }
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// View order details
async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Order #${data.order.id}\nStatus: ${data.order.status}\nTotal: $${data.order.total_amount}\nItems: ${data.items.length}`);
        }
    } catch (error) {
        console.error('Error loading order:', error);
        showNotification('Failed to load order details', 'error');
    }
}

// Show section
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    if (section === 'profile') {
        document.getElementById('profileSection').style.display = 'block';
        event.target.classList.add('active');
    } else if (section === 'orders') {
        document.getElementById('ordersSection').style.display = 'block';
        event.target.classList.add('active');
    }
}

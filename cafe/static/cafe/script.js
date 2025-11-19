// Cart data structure (persisted in localStorage)
let cart = {};

// DOM elements (cached for performance)
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Safe localStorage operations with error handling
function getCartFromStorage() {
    try {
        const stored = localStorage.getItem('cafeCart');
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        return {};
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('cafeCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

// Format price with currency
function formatPrice(price) {
    return `${parseFloat(price).toFixed(2)} ₽`;
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update cart display and localStorage
function updateCartDisplay() {
    if (!cartItemsContainer || !cartTotalElement) return;
    
    // Use requestAnimationFrame for smooth DOM updates
    requestAnimationFrame(() => {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;
        
        if (Object.keys(cart).length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        } else {
            Object.keys(cart).forEach(id => {
                const item = cart[id];
                if (!item || !item.quantity) return;
                
                total += item.price * item.quantity;
                itemCount += item.quantity;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span class="cart-item-name">${escapeHtml(item.name)}</span>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" data-action="decrease" data-id="${id}" type="button" aria-label="Уменьшить">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-id="${id}" type="button" aria-label="Увеличить">+</button>
                    </div>
                    <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        
        cartTotalElement.textContent = `Итого: ${formatPrice(total)}`;
        saveCartToStorage();
        updateMenuQuantities();
    });
}

// Update quantity displays in menu items
function updateMenuQuantities() {
    Object.keys(cart).forEach(id => {
        const quantityElement = document.querySelector(`.quantity[data-item-id="${id}"]`);
        if (quantityElement && cart[id]) {
            quantityElement.textContent = cart[id].quantity;
        }
    });
    
    // Reset quantities for items not in cart
    document.querySelectorAll('.quantity[data-item-id]').forEach(element => {
        const id = element.getAttribute('data-item-id');
        if (!cart[id] || cart[id].quantity === 0) {
            element.textContent = '0';
        }
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add item to cart
function addToCart(id, name, price) {
    if (!id || !name || !price) {
        console.error('Invalid item data:', { id, name, price });
        return;
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
        console.error('Invalid price:', price);
        return;
    }
    
    if (cart[id]) {
        cart[id].quantity += 1;
    } else {
        cart[id] = { name, price: priceNum, quantity: 1 };
    }
    updateCartDisplay();
}

// Remove item from cart (if quantity reaches 0)
function removeFromCart(id) {
    if (!cart[id]) return;
    
    cart[id].quantity -= 1;
    if (cart[id].quantity <= 0) {
        delete cart[id];
    }
    updateCartDisplay();
}

// Checkout function
function checkout() {
    if (Object.keys(cart).length === 0) {
        alert('Ваша корзина пуста!');
        return;
    }
    
    // Prepare order data for Django backend
    const orderData = {
        items: cart,
        total: Object.keys(cart).reduce((sum, id) => {
            return sum + (cart[id].price * cart[id].quantity);
        }, 0)
    };
    
    // TODO: Replace with actual Django view integration
    // Example: fetch('/api/orders/create/', { method: 'POST', body: JSON.stringify(orderData) })
    console.log('Order data:', orderData);
    alert('Переход к оформлению заказа...');
}

// Consolidated event delegation for all click events
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Handle menu item quantity buttons (plus/minus)
    if (target.classList.contains('quantity-btn')) {
        const menuItem = target.closest('.menu-item');
        if (menuItem) {
            const id = menuItem.getAttribute('data-item-id');
            const name = menuItem.getAttribute('data-item-name');
            const price = menuItem.getAttribute('data-item-price');
            
            if (!id || !name || !price) {
                console.error('Missing data attributes on menu item');
                return;
            }
            
            if (target.classList.contains('plus')) {
                addToCart(id, name, price);
            } else if (target.classList.contains('minus')) {
                removeFromCart(id);
            }
            return;
        }
        
        // Handle cart quantity buttons
        const action = target.getAttribute('data-action');
        const id = target.getAttribute('data-id');
        
        if (action && id) {
            if (action === 'increase') {
                if (cart[id]) {
                    cart[id].quantity += 1;
                    updateCartDisplay();
                }
            } else if (action === 'decrease') {
                removeFromCart(id);
            }
            return;
        }
    }
    
    // Handle checkout button
    if (target.id === 'checkout-btn' || target.closest('#checkout-btn')) {
        checkout();
    }
});

// Category filtering (if category items exist)
document.addEventListener('click', (e) => {
    const categoryItem = e.target.closest('.category-item');
    if (categoryItem) {
        const category = categoryItem.getAttribute('data-category');
        if (!category) return;
        
        // Update active tab
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        categoryItem.classList.add('active');
        
        // Filter menu items by category
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
});

// Initialize cart on page load
function initCart() {
    cart = getCartFromStorage();
    updateCartDisplay();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

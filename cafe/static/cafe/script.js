let cart = {};

document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для кнопок +/-
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemElement = this.closest('.menu-item');
            const itemId = itemElement.dataset.itemId;
            cart[itemId] = (cart[itemId] || 0) + 1;
            updateCartDisplay();
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemElement = this.closest('.menu-item');
            const itemId = itemElement.dataset.itemId;
            if (cart[itemId] > 0) {
                cart[itemId]--;
                if (cart[itemId] === 0) delete cart[itemId];
            }
            updateCartDisplay();
        });
    });
});

function updateCartDisplay() {
    document.querySelector('#cart-total').textContent = 
        `Итого: ${calculateTotal()} ₽`;
}

function calculateTotal() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0) * 10;
}

function checkout() {
    alert('Функция оформления заказа будет реализована позже');
}
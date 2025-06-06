import { BASE_URL } from "./config.js";
const cartContainer = document.getElementById('cartContainer');
const totalAmount = document.getElementById('totalAmount');
const cart = JSON.parse(localStorage.getItem('cart')) || [];

const PAYSTACK_PUBLIC_KEY = 'pk_test_880290b3b4b2d6b87c16bc990d08340e9c05e6d0'; 


function renderCart() {
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    totalAmount.textContent = '';
    return;
  }

  cartContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <p><strong>${item.name}</strong> - ₦${item.price} x 
      <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)" /></p>
      <button onclick="removeItem(${index})">Remove</button>
      <hr/>
    `;
    cartContainer.appendChild(div);
  });

  totalAmount.textContent = `Total: ₦${total.toLocaleString()}`;
}

function checkout() {
  const email = localStorage.getItem('userEmail'); // Or prompt user to enter it
  const token = localStorage.getItem('token');
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if(!token){
    alert('Session expired. Please login again.');
    window.location.href = 'login.html';
    return;
  }

  if (!token || !email) {
    alert('You must be logged in and registered to checkout.');
    return window.location.href = 'login.html';
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: totalAmount * 100, // In kobo (e.g. ₦1000 = 100000)
    currency: 'NGN',
    ref: 'SC_' + Math.floor(Math.random() * 1000000000),
    callback: function (response) {
      // ✅ Payment successful — now place order
      fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart, ref: response.reference })
      })
        .then(res => res.json())
        .then(data => {
          if (data.order) {
            alert('Payment successful & order placed!');
            localStorage.removeItem('cart');
            window.location.href = 'orders.html';
          } else {
            alert('Order failed after payment.');
          }
        })
        .catch(err => {
          console.error('Order error:', err);
          alert('Something went wrong after payment.');
        });
    },
    onClose: function () {
      alert('Payment window closed.');
    }
  });

  handler.openIframe();
}
window.checkout = checkout;


function updateQuantity(index, qty) {
  cart[index].quantity = parseInt(qty);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}
window.updateQuantity = updateQuantity;

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}
window.removeItem = removeItem;

function goToProducts() {
  window.location.href = 'products.html';
}
window.goToProducts = goToProducts;

function goToDashboard() {
  window.location.href = 'dashboard.html';
}
window.goToDashboard = goToDashboard;

const toggle = document.getElementById('darkModeToggle');
if (toggle) {
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    toggle.checked = true;
  }
}

renderCart();

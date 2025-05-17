const cartContainer = document.getElementById('cartContainer');
const totalAmount = document.getElementById('totalAmount');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must be logged in to place an order.');
    return window.location.href = 'login.html';
  }

  fetch('http://localhost:8000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ items: cart })
  })
    .then(res => res.json())
    .then(data => {
      if (data.order) {
        alert('Order placed successfully!');
        localStorage.removeItem('cart');
        window.location.href = 'products.html';
      } else {
        alert(data.message || 'Checkout failed.');
      }
    })
    .catch(err => {
      console.error('Checkout Error:', err);
      alert('Error placing order.');
    });
}


function updateQuantity(index, qty) {
  cart[index].quantity = parseInt(qty);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function goToProducts() {
  window.location.href = 'products.html';
}

renderCart();

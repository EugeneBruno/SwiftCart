import { BASE_URL } from "./config.js";
const productId = localStorage.getItem('productId');
const container = document.getElementById('productDetails');

if (!productId) {
  container.innerHTML = '<p>Product ID missing. Go back to product list.</p>';
} else {
  fetch(`${BASE_URL}/api/products/${productId}`)
    .then(res => res.json())
    .then(data => {
      if (data.product) {
        const p = data.product;
        container.innerHTML = container.innerHTML = `
          <img src="${p.imageUrl || 'https://via.placeholder.com/200'}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <p><strong>₦${p.price.toLocaleString()}</strong></p>
          <p>${p.description}</p>
          <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">Add to Cart</button>
        `;
      } else {
        container.innerHTML = '<p>Product not found.</p>';
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p>Error loading product details.</p>';
    });
}

function addToCart(id, name, price) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${name} added to cart!`);
}
window.addToCart = addToCart;

function goToCart() {
  window.location.href = 'cart.html';
}
window.goToCart = goToCart;

function goBack() {
  window.location.href = 'products.html';
}
window.goBack = goBack;
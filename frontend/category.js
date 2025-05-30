// frontend/category.js
import { BASE_URL } from './config.js';

const title = document.getElementById('categoryTitle');
const container = document.getElementById('categoryProducts');
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

const categoryName = localStorage.getItem('selectedCategory');

if (!categoryName) {
  title.textContent = 'No Category Selected';
  container.innerHTML = '<p>Go back and choose a category.</p>';
} else {
  title.textContent = categoryName;

  fetch(`${BASE_URL}/api/products`)
    .then(res => res.json())
    .then(data => {
      const filtered = (data.products || []).filter(
        p => (p.category || '').toLowerCase() === categoryName.toLowerCase()
      );

      if (filtered.length === 0) {
        container.innerHTML = '<p>No products found in this category.</p>';
        return;
      }

      container.innerHTML = '';
      filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" />
          <h4>${product.name}</h4>
          <p>₦${product.price.toLocaleString()}</p>
          <button onclick="viewProduct(${product.id})">View</button>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error loading category:', err);
      container.innerHTML = '<p>Error loading products.</p>';
    });
}

window.viewProduct = function (productId) {
  localStorage.setItem('productId', productId);
  window.location.href = 'product-details.html';
};

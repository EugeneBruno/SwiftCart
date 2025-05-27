import { BASE_URL } from "./config.js";
const categoryName = localStorage.getItem('selectedCategory');
const title = document.getElementById('categoryTitle');
const container = document.getElementById('categoryProducts');

if (!categoryName) {
  title.textContent = 'Category not selected';
  container.innerHTML = '<p>Go back and select a category.</p>';
} else {
  title.textContent = categoryName;

  fetch(`${BASE_URL}/api/products`)
    .then(res => res.json())
    .then(data => {
      const filtered = (data.products || []).filter(p => p.category === categoryName);

      if (filtered.length === 0) {
        container.innerHTML = '<p>No products in this category.</p>';
      } else {
        renderCategoryProducts(filtered);
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p>Error loading products.</p>';
    });
}

function renderCategoryProducts(products) {
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'product-list';

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.imageUrl || 'https://via.placeholder.com/150'}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>₦${p.price.toLocaleString()}</p>
      <button onclick="viewProduct(${p.id})">View</button>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function viewProduct(productId) {
  localStorage.setItem('productId', productId);
  window.location.href = 'product-details.html';
}
window.viewProduct = viewProduct;

function goBack() {
  window.location.href = 'products.html';
}

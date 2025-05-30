// frontend/products.js
import { BASE_URL } from "./config.js";
const container = document.getElementById('productsContainer');
const searchInput = document.getElementById('searchInput');
const ordersBtn = document.getElementById('myOrdersBtn');
const homeBtn = document.getElementById('HomeBtn');
const toggle = document.getElementById('darkModeToggle');

let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleSearch, 300);
});


let allProducts = [];

if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

if (homeBtn) {
  homeBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

if (ordersBtn) {
  ordersBtn.addEventListener('click', () => {
    window.location.href = 'orders.html';
  });
}

if (toggle) {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

async function fetchProducts() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    allProducts = data.products || [];
    renderProductsGrouped(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    container.innerHTML = '<p>Error loading products.</p>';
  }
}

function renderProductsGrouped(products) {
  container.innerHTML = '';

  const grouped = {};
  products.forEach(product => {
    const category = product.category || 'Uncategorized';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(product);
  });

  for (const category in grouped) {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.innerHTML = `<h3 class="category-title">${category}</h3>`;

    const grid = document.createElement('div');
    grid.className = 'product-row';

    grouped[category].slice(0, 5).forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" />
        <h4>${product.name}</h4>
        <p>₦${product.price.toLocaleString()}</p>
        <button onclick="viewProduct(${product.id})">View</button>
      `;
      grid.appendChild(card);
    });

    if (grouped[category].length > 5) {
      const seeMore = document.createElement('div');
      seeMore.className = 'product-card see-more';
      seeMore.innerHTML = `
        <div class="see-more-inner">
          <p>See more →</p>
        </div>
      `;
      seeMore.onclick = () => goToCategory(category);
      grid.appendChild(seeMore);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }
}

function viewProduct(productId) {
  localStorage.setItem('productId', productId);
  window.location.href = 'product-details.html';
}
window.viewProduct = viewProduct;

function goToCategory(categoryName) {
  localStorage.setItem('selectedCategory', categoryName);
  window.location.href = 'category.html';
}
window.goToCategory = goToCategory;

function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    renderProductsGrouped(allProducts);
    return;
  }

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  renderProductsGrouped(filtered);
}

fetchProducts();

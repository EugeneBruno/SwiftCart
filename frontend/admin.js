import { BASE_URL } from './config.js';

const token = localStorage.getItem('token');
if (!token) {
  alert('You must be logged in.');
  window.location.href = 'login.html';
}

const form = document.getElementById('productForm');
const productList = document.getElementById('productList');
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const price = parseFloat(document.getElementById('price').value);
  const category = document.getElementById('category').value.trim();
  const imageUrl = document.getElementById('imageUrl').value.trim();
  const description = document.getElementById('description').value.trim();

  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, price, category, imageUrl, description })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Product added!');
      form.reset();
      fetchProducts();
    } else {
      alert(data.message || 'Failed to add product.');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

async function fetchProducts() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();

    productList.innerHTML = '';
    data.products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" />
        <h4>${product.name}</h4>
        <p>₦${product.price.toLocaleString()}</p>
        <button onclick="deleteProduct(${product.id})">Delete</button>
      `;
      productList.appendChild(div);
    });
  } catch (err) {
    productList.innerHTML = '<p>Error loading products.</p>';
  }
}

window.deleteProduct = async function (id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      alert('Deleted successfully!');
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.message || 'Delete failed');
    }
  } catch (err) {
    alert('Error deleting product.');
  }
};

fetchProducts();

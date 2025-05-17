// frontend/products.js
const container = document.getElementById('productsContainer');

async function fetchProducts() {
  try {
    const res = await fetch('http://localhost:8000/api/products');
    const data = await res.json();

    if (Array.isArray(data.products)) {
      container.innerHTML = '';

      data.products.forEach(product => {
        const div = document.createElement('div');
        div.classList.add('product-card');
        div.innerHTML = `
          <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>₦${product.price.toLocaleString()}</p>
          <button onclick="viewProduct(${product.id})">View</button>
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = '<p>No products found.</p>';
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    container.innerHTML = '<p>Error loading products.</p>';
  }
}

function viewProduct(productId) {
  localStorage.setItem('productId', productId);
  window.location.href = 'product-details.html';
}

fetchProducts();

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

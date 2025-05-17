// frontend/dashboard.js
const content = document.getElementById('content');
const logoutBtn = document.getElementById('logout');
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

fetch('http://localhost:8000/api/protected', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((res) => res.json())
  .then((data) => {
    if (data.user) {
      content.textContent = `You are logged in as user ID: ${data.user.id}`;
    } else {
      throw new Error('Not authorized');
    }
  })
  .catch((err) => {
    console.error(err);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// dashboard.js
document.getElementById('goToProducts').addEventListener('click', () => {
  window.location.href = 'products.html';
});

document.getElementById('goToOrders').addEventListener('click', () => {
  window.location.href = 'orders.html';
});
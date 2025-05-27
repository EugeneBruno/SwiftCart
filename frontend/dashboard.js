// frontend/dashboard.js
const content = document.getElementById('content');
const logoutBtn = document.getElementById('logout');
const token = localStorage.getItem('token');
const isAdmin = localStorage.getItem('isAdmin') === 'true';

window.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username');
  const welcomeEl = document.getElementById('welcomeText');
  if (username && welcomeEl) {
    welcomeEl.textContent = `Welcome, ${username}`;
  }
});


document.getElementById('goToProducts').addEventListener('click', () => {
  window.location.href = 'products.html';
});

document.getElementById('goToOrders').addEventListener('click', () => {
  window.location.href = 'orders.html';
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

if (isAdmin) {
  document.getElementById('goToAdmin').style.display = 'inline-block';
  document.getElementById('goToAdmin').addEventListener('click', () => {
    window.location.href = 'admin.html';
  });
}

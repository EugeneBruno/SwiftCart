// frontend/login.js
const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token); // Save JWT
      message.textContent = 'Login successful. Redirecting...';
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      message.textContent = data.message || 'Login failed.';
    }
  } catch (err) {
    message.textContent = 'Server error. Try again later.';
  }
});

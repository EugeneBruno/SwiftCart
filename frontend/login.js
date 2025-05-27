// frontend/login.js
import { BASE_URL } from "./config.js";
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const identifier = document.getElementById('identifier').value.trim(); // supports email or username
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    if (res.status === 404) {
      message.textContent = 'Email or Username not registered. Redirecting to register page...';
      localStorage.setItem('registeredEmail', identifier);
      setTimeout(() => {
        window.location.href = 'register.html';
      }, 2000);
      return;
    }

    if (!res.ok) {
      message.textContent = data.message || 'Login failed.';
      return;
    }

    // ✅ Store login info
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    localStorage.setItem('isAdmin', data.user.isAdmin);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userEmail', data.user.email)

    message.textContent = 'Login successful! Redirecting...';
    setTimeout(() => {
      window.location.href = data.user.isAdmin ? 'admin.html' : 'dashboard.html';
    }, 1500);
  } catch (err) {
    console.error('Login error:', err);
    message.textContent = 'Server error. Please try again.';
  }
});


document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');

  const isVisible = passwordInput.type === 'text';
  passwordInput.type = isVisible ? 'password' : 'text';
  toggleBtn.textContent = isVisible ? '🙉' : '🙈';
});
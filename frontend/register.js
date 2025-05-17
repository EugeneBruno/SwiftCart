// frontend/register.js
const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('registeredEmail', email); // Save for OTP page
      window.location.href = 'verify.html';
    } else {
      message.textContent = data.message || 'Registration failed.';
    }
  } catch (err) {
    message.textContent = 'Server error. Please try again later.';
  }
});

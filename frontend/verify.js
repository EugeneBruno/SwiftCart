// frontend/verify.js
const form = document.getElementById('verifyForm');
const message = document.getElementById('message');
const email = localStorage.getItem('registeredEmail'); // email saved from register step

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const otp = document.getElementById('otp').value.trim();

  try {
    const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      message.textContent = 'Verification successful. Redirecting to login...';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      message.textContent = data.message || 'Verification failed.';
    }
  } catch (err) {
    message.textContent = 'Server error. Try again later.';
  }
});

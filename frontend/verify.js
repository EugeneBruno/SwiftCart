// frontend/verify.js
import { BASE_URL }  from './config.js'
const form = document.getElementById('verifyForm');
const message = document.getElementById('message');
const email = localStorage.getItem('registeredEmail');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const otp = document.getElementById('otp').value.trim();

  if (!email || !otp) {
    message.textContent = 'Email and OTP are required.';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      message.style.color = 'green';
      message.textContent = 'Verification successful! Redirecting...';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      message.textContent = data.message || 'Verification failed.';
    }
  } catch (err) {
    message.textContent = 'Server error. Try again later.';
  }
});

// Optional resend logic
document.getElementById('resendBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!email) return alert('Email missing. Please register again.');

  const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  alert(data.message || 'OTP resend attempted.');
});

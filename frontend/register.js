// frontend/register.js
import { BASE_URL }  from './config.js'
const form = document.getElementById('registerForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const matchMsg = document.getElementById('passwordMatchMessage');

confirmPassword.addEventListener('input', () => {
  if (password.value !== confirmPassword.value) {
    matchMsg.textContent = "Passwords do not match";
  } else {
    matchMsg.textContent = "";
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (password.value !== confirmPassword.value) {
    alert('Passwords must match');
    return;
  }

  if (!document.getElementById('terms').checked) {
    alert('You must accept the Terms and Conditions');
    return;
  }

  const userData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    username: document.getElementById('username').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    email: document.getElementById('email').value,
    password: password.value
  };

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('registeredEmail', userData.email)
      alert('Registration successful! Please check your email for the OTP.');
      window.location.href = 'verify.html';
    } else {
      alert(data.message || 'Registration failed.');
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  }
});

function toggleVisibility(inputId, toggleIcon) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    toggleIcon.textContent = '🙈';
  } else {
    input.type = 'password';
    toggleIcon.textContent = '🙉';
  }
}

window.toggleVisibility = toggleVisibility;
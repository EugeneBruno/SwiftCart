import { BASE_URL } from "./config.js";

const productId = localStorage.getItem("productId");
const token = localStorage.getItem("token");
const email = localStorage.getItem("userEmail");
const container = document.getElementById("productDetails");
const reviewForm = document.getElementById("reviewForm");
const ratingInput = document.getElementById("rating");
const reviewMessage = document.getElementById("reviewMessage");
const commentInput = document.getElementById("comment");
const reviewNotice = document.getElementById("reviewNotice");
const reviewsContainer = document.getElementById("reviewsContainer");

// 🔄 Render product
if (!productId) {
  container.innerHTML = "<p>Product ID not found. Return to products.</p>";
} else {
  fetch(`${BASE_URL}/api/products/${productId}`)
    .then(res => res.json())
    .then(data => {
      if (data.product) {
        const p = data.product;
        container.innerHTML = `
          <div class="product-detail-box">
            <img src="${p.imageUrl || 'https://via.placeholder.com/200'}" alt="${p.name}" />
            <h3>${p.name}</h3>
            <p><strong>₦${p.price.toLocaleString()}</strong></p>
            <p>${p.description}</p>
            <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">Add to Cart</button>
          </div>
        `;
      } else {
        container.innerHTML = "<p>Product not found.</p>";
      }
    })
    .catch(err => {
      console.error("Error:", err);
      container.innerHTML = "<p>Failed to load product details.</p>";
    });
}

// 🧾 Check if user ordered the product
if (token) {
  fetch(`${BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const hasOrdered = data.orders?.some(order =>
        order.items.some(item => item.product.id == productId)
      );

      if (hasOrdered) {
        reviewForm.style.display = 'block';
        reviewNotice.style.display = 'none';
      }
    })
    .catch(err => console.error("Order check error:", err));
}

// ⭐ Handle star rating UI
document.querySelectorAll("#starRating .star").forEach(star => {
  star.addEventListener("click", () => {
    const value = star.dataset.value;
    ratingInput.value = value;

    document.querySelectorAll("#starRating .star").forEach(s => {
      s.innerHTML = s.dataset.value <= value ? "&#9733;" : "&#9734;";
    });
  });
});

// ✍🏽 Handle review submission
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rating = parseInt(ratingInput.value);
  const comment = commentInput.value;

  if (!rating || !comment) {
    reviewMessage.textContent = "All fields are required.";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment })
    });

    const data = await res.json();
    if (res.ok) {
      reviewMessage.style.color = "green";
      reviewMessage.textContent = "Review submitted!";
      commentInput.value = "";
      ratingInput.value = "";
      fetchReviews(); // Reload
    } else {
      reviewMessage.textContent = data.message || "Review failed.";
    }
  } catch (err) {
    reviewMessage.textContent = "Server error. Try again.";
  }
});

// 📦 Add to cart
function addToCart(id, name, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, name, price, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart!`);
}
window.addToCart = addToCart;
window.goToCart = () => window.location.href = "cart.html";

// 🌙 Dark mode
const toggle = document.getElementById("darkModeToggle");
if (toggle) {
  toggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.checked = true;
  }
}

// 🧾 Load reviews
function fetchReviews() {
  fetch(`${BASE_URL}/api/products/${productId}/reviews`)
    .then(res => res.json())
    .then(data => {
      reviewsContainer.innerHTML = `
        <p><strong>Average Rating:</strong> ${data.averageRating?.toFixed(1)} ⭐</p>
        ${data.reviews.map(r => `
          <div class="review-box">
            <strong>@${r.user.username}</strong> - ${"★".repeat(r.rating)}<br/>
            <span>${r.comment}</span>
          </div>
        `).join("")}
      `;
    })
    .catch(err => {
      console.error("Review fetch error:", err);
      reviewsContainer.innerHTML = "<p>Failed to load reviews.</p>";
    });
}
fetchReviews();
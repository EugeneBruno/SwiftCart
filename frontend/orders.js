const container = document.getElementById('ordersContainer');
const token = localStorage.getItem('token');

if (!token) {
  container.innerHTML = '<p>You must be logged in to view orders.</p>';
} else {
  fetch('http://localhost:8000/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.orders || data.orders.length === 0) {
        container.innerHTML = '<p>You have no orders yet.</p>';
        return;
      }

      container.innerHTML = '';
      data.orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';

        const items = order.items.map(item => 
          `<li>${item.product.name} × ${item.quantity}</li>`
        ).join('');

        div.innerHTML = `
          <h4>Order #${order.id}</h4>
          <ul>${items}</ul>
          <p>Placed on: ${new Date(order.createdAt).toLocaleString()}</p>
          <hr/>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error('Fetch orders error:', err);
      container.innerHTML = '<p>Error loading orders.</p>';
    });
}

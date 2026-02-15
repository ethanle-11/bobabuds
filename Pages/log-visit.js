// HARDCODED USER ID FOR DEMO
const USER_ID = 'JohnChoi';

// Get shop info from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const spotName = urlParams.get('spot_name');
const spotId = urlParams.get('spot_id');

// If no shop info, redirect back to search
if (!spotName) {
  alert('Please select a boba shop from the search page.');
  window.location.href = '../index.html';
}

// Display shop name
document.getElementById('shopName').textContent = spotName;

// Handle form submission
document.getElementById('logVisitForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const visitData = {
    user_id: USER_ID,
    spot_id: spotId || null,
    spot_name: spotName,
    spent: parseFloat(document.getElementById('spent').value),
    rating: parseInt(document.getElementById('rating').value),
    notes: document.getElementById('notes').value.trim() || null,
    visit_date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD
  };

  try {
    const response = await fetch('http://localhost:5500/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });

    if (!response.ok) {
      throw new Error('Failed to log visit');
    }

    // Show success message
    showSuccessMessage();

  } catch (error) {
    console.error('Error logging visit:', error);
    alert('Failed to log visit. Please make sure the backend is running!');
  }
});

function showSuccessMessage() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  // Create success message
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <h2>✓ Visit Logged Successfully!</h2>
    <p>Your visit to <strong>${spotName}</strong> has been recorded.</p>
    <p>Redirecting to home page...</p>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(successDiv);

  // Redirect after 2 seconds
  setTimeout(() => {
    window.location.href = '../index.html';
  }, 2000);
}
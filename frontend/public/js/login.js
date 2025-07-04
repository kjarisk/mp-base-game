// Sci-fi themed guest names shared with the backend
import GUEST_NAMES from '../../../shared/guestNames.js';

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      document.getElementById(targetTab + 'Tab').classList.add('active');
    });
  });
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;
  try {
    await postJSON('/login', { username, password });
    window.location.href = '/lobby.html';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;
  try {
    await postJSON('/register', { username, password });
    await postJSON('/login', { username, password });
    window.location.href = '/lobby.html';
  } catch (err) {
    alert('Registration failed: ' + err.message);
  }
});

// Guest button handler
document.getElementById('guestBtn').addEventListener('click', async () => {
  try {
    // Get available guest name from server
    const response = await fetch('/api/guest-name');
    const data = await response.json();
    
    if (data.success) {
      // Use the assigned guest name
      await postJSON('/guest', { username: data.guestName });
      window.location.href = '/lobby.html';
    } else {
      alert('Unable to get guest name. Please try again.');
    }
  } catch (err) {
    alert('Unable to continue as guest: ' + err.message);
  }
});

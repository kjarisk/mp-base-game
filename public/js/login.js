async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;
  try {
    await postJSON('/login', { username, password });
    window.location.href = '/lobby.html';
  } catch (err) {
    alert('Login failed');
  }
});

document.getElementById('guestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('guestname').value.trim();
  if (!username) return;
  try {
    await postJSON('/guest', { username });
    window.location.href = '/lobby.html';
  } catch (err) {
    alert('Unable to continue as guest');
  }
});

// register new user and log in directly
const regForm = document.getElementById('registerForm');
if (regForm) {
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    try {
      await postJSON('/register', { username, password });
      await postJSON('/login', { username, password });
      window.location.href = '/lobby.html';
    } catch (err) {
      alert('Registration failed');
    }
  });
}

// Guest name pool - sci-fi themed names
const GUEST_NAMES = [
  'Nebula', 'Orion', 'Vega', 'Sirius', 'Altair', 'Rigel', 'Polaris', 'Castor', 'Pollux', 'Andromeda',
  'Galaxy', 'Cosmos', 'Stellar', 'Nova', 'Comet', 'Meteor', 'Asteroid', 'Quasar', 'Pulsar', 'Neutron',
  'Phoenix', 'Dragon', 'Falcon', 'Eagle', 'Hawk', 'Raven', 'Wolf', 'Tiger', 'Lion', 'Panther',
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
  'Cipher', 'Matrix', 'Vector', 'Pixel', 'Binary', 'Quantum', 'Photon', 'Electron', 'Proton', 'Neutron',
  'Titan', 'Atlas', 'Hermes', 'Apollo', 'Artemis', 'Athena', 'Zeus', 'Poseidon', 'Hades', 'Ares',
  'Crimson', 'Azure', 'Violet', 'Emerald', 'Golden', 'Silver', 'Platinum', 'Diamond', 'Ruby', 'Sapphire',
  'Storm', 'Thunder', 'Lightning', 'Blizzard', 'Tornado', 'Hurricane', 'Cyclone', 'Typhoon', 'Monsoon', 'Gale',
  'Shadow', 'Ghost', 'Phantom', 'Specter', 'Wraith', 'Spirit', 'Soul', 'Echo', 'Mirage', 'Illusion',
  'Blade', 'Sword', 'Spear', 'Arrow', 'Shield', 'Armor', 'Helmet', 'Gauntlet', 'Boot', 'Cloak',
  'Fire', 'Ice', 'Earth', 'Air', 'Water', 'Metal', 'Wood', 'Light', 'Dark', 'Void',
  'Hunter', 'Ranger', 'Scout', 'Warrior', 'Knight', 'Paladin', 'Rogue', 'Assassin', 'Mage', 'Wizard',
  'Ace', 'Chief', 'Major', 'Captain', 'Admiral', 'General', 'Marshal', 'Commander', 'Leader', 'Boss',
  'Cyber', 'Tech', 'Data', 'Code', 'Hack', 'Link', 'Node', 'Grid', 'Net', 'Web',
  'Star', 'Moon', 'Sun', 'Earth', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
  'Apex', 'Prime', 'Ultra', 'Super', 'Mega', 'Giga', 'Tera', 'Peta', 'Exa', 'Zetta',
  'Frost', 'Flame', 'Spark', 'Bolt', 'Charge', 'Surge', 'Pulse', 'Wave', 'Beam', 'Ray',
  'Viper', 'Cobra', 'Python', 'Boa', 'Mamba', 'Adder', 'Asp', 'Krait', 'Taipan', 'Coral',
  'Laser', 'Plasma', 'Fusion', 'Fission', 'Atomic', 'Nuclear', 'Particle', 'Molecule', 'Atom', 'Ion',
  'Turbo', 'Nitro', 'Boost', 'Rush', 'Speed', 'Swift', 'Flash', 'Dash', 'Zoom', 'Blur'
];

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

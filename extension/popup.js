// Constants
const API_BASE_URL = 'http://localhost:3000'; // Change to your production URL in production
const AUTH_SESSION_URL = `${API_BASE_URL}/api/auth/session`;
const SAVE_URL = `${API_BASE_URL}/api/trpc/link.save`;

// DOM Elements
const saveBtn = document.getElementById('save-btn');
const loginBtn = document.getElementById('login-btn');
const loginContainer = document.getElementById('login-container');
const saveContainer = document.getElementById('save-container');
const statusEl = document.getElementById('status');

// Show status message
function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'status error' : 'status success';
  statusEl.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// Check if user is logged in
async function checkAuthStatus() {
  try {
    const response = await fetch(AUTH_SESSION_URL, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.user) {
        // User is logged in
        loginContainer.style.display = 'none';
        saveContainer.style.display = 'block';
        return { isAuthenticated: true, token: data.token };
      }
    }
    
    // User is not logged in
    loginContainer.style.display = 'block';
    saveContainer.style.display = 'none';
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error checking auth status:', error);
    showStatus('Could not connect to KNotion', true);
    return { isAuthenticated: false };
  }
}

// Save current tab URL
async function saveCurrentTab(token) {
  // Get current tab URL
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  if (!currentTab || !currentTab.url) {
    showStatus('No active tab found', true);
    return;
  }
  
  try {
    // Prepare the payload for tRPC
    const payload = {
      json: {
        url: currentTab.url,
      }
    };
    
    // Send request to save the link
    const response = await fetch(`${SAVE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      showStatus('Page saved successfully! ✓');
    } else {
      const data = await response.json();
      showStatus(`Error: ${data.message || 'Failed to save link'}`, true);
    }
  } catch (error) {
    console.error('Error saving link:', error);
    showStatus('Failed to save link', true);
  }
}

// Open login page
function openLoginPage() {
  chrome.tabs.create({ url: `${API_BASE_URL}/api/auth/signin` });
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  const { isAuthenticated, token } = await checkAuthStatus();
  
  saveBtn.addEventListener('click', async () => {
    const { isAuthenticated, token } = await checkAuthStatus();
    if (isAuthenticated) {
      saveCurrentTab(token);
    } else {
      showStatus('Please log in to KNotion first', true);
    }
  });
  
  loginBtn.addEventListener('click', openLoginPage);
}); 
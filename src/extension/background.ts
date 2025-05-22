import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { firebaseConfig } from '../lib/firebase';

// Initialize Firebase in background script
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Listen for auth messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INIT_AUTH' && message.token) {
    signInWithCustomToken(auth, message.token)
      .then(() => {
        console.log('Background: Successfully initialized auth');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Background: Auth initialization error:', error);
        sendResponse({ success: false, error });
      });
    return true; // Keep the message channel open for async response
  }
});

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // Broadcast auth state to all extension views
    chrome.runtime.sendMessage({ type: 'AUTH_STATE_CHANGED', user });
  }
});

// Handle token refresh
auth.onIdTokenChanged(async (user) => {
  if (user) {
    const token = await user.getIdToken();
    chrome.storage.local.set({ authToken: token });
  }
}); 
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';

// Initialize Firebase (you'll need to add your config)
const firebaseConfig = {
  apiKey: "AIzaSyBPkqFWUUdwGUuZCgzVFe_vEd2qAYS_Xtc",
  authDomain: "knotion-4a576.firebaseapp.com",
  projectId: "knotion-4a576",
  storageBucket: "knotion-4a576.appspot.com",
  messagingSenderId: "1015423575467",
  appId: "1:1015423575467:web:c0c0c0c0c0c0c0c0c0c0c0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class PopupManager {
  private authSection: HTMLElement;
  private contentSection: HTMLElement;
  private loginButton: HTMLElement;
  private authStatus: HTMLElement;
  private highlightsList: HTMLElement;

  constructor() {
    this.authSection = document.getElementById('auth-section')!;
    this.contentSection = document.getElementById('content-section')!;
    this.loginButton = document.getElementById('login-button')!;
    this.authStatus = document.getElementById('auth-status')!;
    this.highlightsList = document.getElementById('highlights-list')!;

    this.setupAuthListeners();
    this.setupEventListeners();
  }

  private setupAuthListeners(): void {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.handleSignedInState(user);
      } else {
        this.handleSignedOutState();
      }
    });
  }

  private setupEventListeners(): void {
    this.loginButton.addEventListener('click', async () => {
      try {
        const token = await this.getGoogleAuthToken();
        if (!token) {
          throw new Error('No auth token received');
        }
        
        // Get ID token from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user info');
        }
        
        const userInfo = await response.json();
        const credential = GoogleAuthProvider.credential(userInfo.sub, token);
        await signInWithCredential(auth, credential);
      } catch (error) {
        console.error('Sign in error:', error instanceof Error ? error.message : error);
        // Display error to user
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
        this.showError(errorMessage);
      }
    });

    // Query active tab when popup opens
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        this.loadHighlights(tabs[0].url);
      }
    });
  }

  private async getGoogleAuthToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const manifest = chrome.runtime.getManifest();
      const clientId = manifest.oauth2.client_id;
      
      chrome.identity.getAuthToken({ 
        interactive: true,
        client_id: clientId
      }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message || 'Failed to get auth token'));
          return;
        }
        
        if (!token) {
          console.error('No token received from Chrome Identity API');
          reject(new Error('No auth token received'));
          return;
        }
        
        console.log('Successfully got auth token');
        resolve(token);
      });
    });
  }

  private handleSignedInState(user: any): void {
    this.authSection.style.display = 'none';
    this.contentSection.style.display = 'block';
    
    const signOutButton = document.createElement('button');
    signOutButton.textContent = 'Sign Out';
    signOutButton.className = 'danger-button';
    signOutButton.onclick = () => this.handleSignOut();
    
    this.authStatus.innerHTML = '';
    this.authStatus.appendChild(signOutButton);
  }

  private async handleSignOut(): Promise<void> {
    try {
      // Revoke the token
      const token = await this.getGoogleAuthToken();
      if (token) {
        await new Promise<void>((resolve, reject) => {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  private handleSignedOutState(): void {
    this.authSection.style.display = 'block';
    this.contentSection.style.display = 'none';
    this.authStatus.innerHTML = '';
  }

  private async loadHighlights(url: string): Promise<void> {
    if (!auth.currentUser) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PAGE_HIGHLIGHTS',
        url
      });

      if (response.success) {
        this.renderHighlights(response.highlights);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  }

  private renderHighlights(highlights: any[]): void {
    this.highlightsList.innerHTML = '';

    if (highlights.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.textContent = 'No highlights yet. Select text on the page to create highlights.';
      emptyState.style.textAlign = 'center';
      emptyState.style.color = '#666';
      emptyState.style.padding = '20px';
      this.highlightsList.appendChild(emptyState);
      return;
    }

    highlights.forEach(highlight => {
      const highlightElement = document.createElement('div');
      highlightElement.className = 'highlight-item';

      const textElement = document.createElement('p');
      textElement.className = 'highlight-text';
      textElement.textContent = highlight.text;

      const actionsElement = document.createElement('div');
      actionsElement.className = 'highlight-actions';

      const deleteButton = document.createElement('button');
      deleteButton.className = 'danger-button';
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = () => this.deleteHighlight(highlight.id);

      actionsElement.appendChild(deleteButton);
      highlightElement.appendChild(textElement);
      highlightElement.appendChild(actionsElement);
      this.highlightsList.appendChild(highlightElement);
    });
  }

  private async deleteHighlight(highlightId: string): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DELETE_HIGHLIGHT',
        highlightId
      });

      if (response.success) {
        // Refresh highlights list
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            this.loadHighlights(tabs[0].url);
          }
        });

        // Remove highlight from page
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id!, {
              type: 'REMOVE_HIGHLIGHT',
              highlightId
            });
          }
        });
      }
    } catch (error) {
      console.error('Error deleting highlight:', error);
    }
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = message;

    // Remove any existing error message
    const existingError = this.authSection.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    this.authSection.appendChild(errorDiv);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 
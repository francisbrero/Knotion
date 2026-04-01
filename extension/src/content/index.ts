import { SelectionService } from '../lib/selectionService';
import { HighlightManager, Highlight } from '../lib/highlightManager';
import '../styles/highlight.css';

interface SerializedHighlight {
  text: string;
  range: string;
  className: string;
}

// Initialize services
const selectionService = SelectionService.getInstance();
const highlightManager = HighlightManager.getInstance();

// Create root element for React components
const root = document.createElement('div');
root.id = 'knotion-root';
document.body.appendChild(root);

// Listen for extension toggle
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_KNOTION') {
    if (!message.enabled) {
      // Remove all highlights
      document.querySelectorAll('.knotion-highlight').forEach((el) => {
        const id = el.getAttribute('data-highlight-id');
        if (id) highlightManager.removeHighlight(id);
      });
      
      // Remove root element
      root.remove();
    } else {
      // Re-add root element
      document.body.appendChild(root);
      
      // Re-initialize highlights from storage
      chrome.storage.local.get(['highlights'], (result) => {
        if (result.highlights) {
          result.highlights.forEach((highlight: any) => {
            highlightManager.deserializeHighlight(highlight);
          });
        }
      });
    }
  }
});

class ContentScript {
  private highlightManager: HighlightManager;
  private overlayElement: HTMLDivElement | null = null;

  constructor() {
    this.highlightManager = HighlightManager.getInstance();
    this.initializeOverlay();
    this.setupListeners();
  }

  private initializeOverlay(): void {
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'knotion-overlay';
    this.overlayElement.style.display = 'none';
    document.body.appendChild(this.overlayElement);
  }

  private setupListeners(): void {
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'CREATE_HIGHLIGHT':
          const highlight = this.highlightManager.createHighlight();
          if (highlight) {
            this.saveHighlight(highlight);
          }
          sendResponse({ success: true, highlight });
          break;
          
        case 'REMOVE_HIGHLIGHT':
          this.highlightManager.removeHighlight(message.highlightId);
          sendResponse({ success: true });
          break;
          
        case 'GET_SELECTION':
          const selection = window.getSelection();
          const selectionText = selection?.toString() ?? '';
          sendResponse({ 
            text: selectionText,
            hasSelection: selectionText.length > 0
          });
          break;
      }
    });
  }

  private handleMouseUp(event: MouseEvent): void {
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      if (this.overlayElement) {
        this.overlayElement.style.display = 'none';
      }
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText && this.overlayElement && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const { bottom = 0, left = 0 } = rect;
      
      this.overlayElement.style.top = `${window.scrollY + bottom + 5}px`;
      this.overlayElement.style.left = `${window.scrollX + left}px`;
      this.overlayElement.style.display = 'block';
      
      // Clear previous content
      this.overlayElement.innerHTML = '';
      
      // Add highlight button
      const highlightButton = document.createElement('button');
      highlightButton.textContent = 'Highlight';
      highlightButton.onclick = () => {
        const highlight = this.highlightManager.createHighlight();
        if (highlight && this.overlayElement) {
          this.saveHighlight(highlight);
          this.overlayElement.style.display = 'none';
        }
      };
      
      this.overlayElement.appendChild(highlightButton);
    }
  }

  private async saveHighlight(highlight: Highlight): Promise<void> {
    try {
      // Send highlight to background script for storage
      await chrome.runtime.sendMessage({
        type: 'SAVE_HIGHLIGHT',
        highlight: {
          ...highlight,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to save highlight:', error);
    }
  }
}

// Initialize content script
new ContentScript(); 
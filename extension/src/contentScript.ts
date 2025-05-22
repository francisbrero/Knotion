// Constants
const API_BASE_URL = 'http://localhost:3000'; // Change to production URL as needed
const COMMENT_API_URL = `${API_BASE_URL}/api/trpc/comment.create`;
const LINK_BY_URL_API_URL = `${API_BASE_URL}/api/trpc/links.getByUrl`;

// State
let authToken: string | null = null;

// Types
interface CommentData {
  linkId: string;
  text: string;
  rangeStart: number;
  rangeEnd: number;
  rangeSelector: string;
  parentId?: string;
}

interface SerializedRange {
  startOffset: number;
  endOffset: number;
  startContainer: string;
  endContainer: string;
  commonAncestor: string;
}

// Utility functions for range serialization
function serializeRange(range: Range): SerializedRange {
  return {
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    startContainer: getXPath(range.startContainer),
    endContainer: getXPath(range.endContainer),
    commonAncestor: getXPath(range.commonAncestorContainer)
  };
}

function deserializeRange(serialized: SerializedRange): Range | null {
  try {
    const startContainer = getElementByXPath(serialized.startContainer);
    const endContainer = getElementByXPath(serialized.endContainer);
    
    if (!startContainer || !endContainer) return null;
    
    const range = document.createRange();
    range.setStart(startContainer, serialized.startOffset);
    range.setEnd(endContainer, serialized.endOffset);
    
    return range;
  } catch (error) {
    console.error('Error deserializing range:', error);
    return null;
  }
}

function getXPath(node: Node): string {
  if (node.nodeType === Node.DOCUMENT_NODE) {
    return "/";
  }
  
  if (node.parentNode === null) {
    return "";
  }

  const siblings = node.parentNode.childNodes;
  let position = 1;
  
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === node) {
      const nodeName = node.nodeName.toLowerCase();
      return getXPath(node.parentNode) + '/' + nodeName + '[' + position + ']';
    }
    
    if (sibling.nodeName === node.nodeName) {
      position++;
    }
  }
  
  return "";
}

function getElementByXPath(xpath: string): Node | null {
  try {
    return document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  } catch (e) {
    console.error('Error evaluating XPath:', e);
    return null;
  }
}

// Initialize
async function initialize() {
  // Get auth token from storage
  chrome.storage.local.get(['knotion_auth_token'], (result) => {
    authToken = result.knotion_auth_token;
  });

  // Add event listener for text selection
  document.addEventListener('mouseup', handleTextSelection);
  
  // Load and highlight existing comments
  await loadHighlights();
}

// Handle text selection
function handleTextSelection(event: MouseEvent) {
  const selection = window.getSelection();
  
  // Remove existing toolbar if any
  removeCommentToolbar();
  
  // Check if there's a valid selection
  if (!selection || selection.toString().trim().length === 0) {
    return;
  }
  
  // Create and show the comment toolbar
  const range = selection.getRangeAt(0);
  createCommentToolbar(range, event);
}

// Create comment toolbar
function createCommentToolbar(range: Range, event: MouseEvent) {
  const toolbar = document.createElement('div');
  toolbar.id = 'knotion-comment-toolbar';
  toolbar.className = 'knotion-toolbar';
  
  const commentBtn = document.createElement('button');
  commentBtn.textContent = 'Comment';
  commentBtn.addEventListener('click', () => {
    openCommentDialog(range);
  });
  
  toolbar.appendChild(commentBtn);
  
  // Position the toolbar near the selection
  const rangeRect = range.getBoundingClientRect();
  toolbar.style.position = 'absolute';
  toolbar.style.left = `${rangeRect.right}px`;
  toolbar.style.top = `${window.scrollY + rangeRect.top - 30}px`;
  
  document.body.appendChild(toolbar);
  
  // Close toolbar when clicking outside
  document.addEventListener('mousedown', handleOutsideClick);
}

// Handle clicks outside the toolbar
function handleOutsideClick(event: MouseEvent) {
  const toolbar = document.getElementById('knotion-comment-toolbar');
  const commentDialog = document.getElementById('knotion-comment-dialog');
  
  if (toolbar && !toolbar.contains(event.target as Node) && 
      commentDialog && !commentDialog.contains(event.target as Node)) {
    removeCommentToolbar();
    document.removeEventListener('mousedown', handleOutsideClick);
  }
}

// Remove comment toolbar
function removeCommentToolbar() {
  const toolbar = document.getElementById('knotion-comment-toolbar');
  if (toolbar) {
    toolbar.remove();
  }
}

// Open comment dialog
function openCommentDialog(range: Range) {
  // Remove toolbar
  removeCommentToolbar();
  
  // Create dialog container using shadow DOM for isolation
  const dialogContainer = document.createElement('div');
  dialogContainer.id = 'knotion-comment-container';
  document.body.appendChild(dialogContainer);
  
  // Create shadow root
  const shadow = dialogContainer.attachShadow({ mode: 'open' });
  
  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    .knotion-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      width: 300px;
    }
    
    .knotion-dialog textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
    }
    
    .knotion-dialog-buttons {
      display: flex;
      justify-content: flex-end;
    }
    
    .knotion-dialog-buttons button {
      margin-left: 8px;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .knotion-dialog-buttons button.cancel {
      background: #f1f1f1;
    }
    
    .knotion-dialog-buttons button.submit {
      background: #0070f3;
      color: white;
    }
  `;
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.id = 'knotion-comment-dialog';
  dialog.className = 'knotion-dialog';
  
  // Dialog content
  dialog.innerHTML = `
    <h3>Add Comment</h3>
    <textarea placeholder="Enter your comment here..."></textarea>
    <div class="knotion-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="submit">Save</button>
    </div>
  `;
  
  // Append style and dialog to shadow root
  shadow.appendChild(style);
  shadow.appendChild(dialog);
  
  // Get elements
  const textarea = shadow.querySelector('textarea');
  const cancelBtn = shadow.querySelector('.cancel');
  const submitBtn = shadow.querySelector('.submit');
  
  // Add event listeners
  cancelBtn?.addEventListener('click', () => {
    dialogContainer.remove();
  });
  
  submitBtn?.addEventListener('click', async () => {
    if (textarea && textarea.value.trim()) {
      // Serialize the range for storage
      const serializedRange = serializeRange(range);
      
      // Save comment
      await saveComment({
        text: textarea.value,
        range: serializedRange
      });
      
      // Close dialog
      dialogContainer.remove();
      
      // Highlight the selection
      highlightRange(range, textarea.value);
    }
  });
}

// Save comment to the server
async function saveComment({ text, range }: { text: string, range: SerializedRange }) {
  if (!authToken) {
    showNotification('Please log in to KNotion to save comments', 'error');
    return;
  }
  
  try {
    // First, get linkId by URL
    const linkResponse = await fetch(LINK_BY_URL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        json: {
          url: window.location.href
        }
      })
    });
    
    if (!linkResponse.ok) {
      showNotification('This page is not saved in KNotion yet', 'error');
      return;
    }
    
    const linkData = await linkResponse.json();
    const linkId = linkData.result.data.id;
    
    // Then save the comment
    const commentData: CommentData = {
      linkId,
      text,
      rangeStart: range.startOffset,
      rangeEnd: range.endOffset,
      rangeSelector: JSON.stringify(range)
    };
    
    const response = await fetch(COMMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        json: commentData
      })
    });
    
    if (response.ok) {
      showNotification('Comment saved successfully!', 'success');
    } else {
      showNotification('Failed to save comment', 'error');
    }
  } catch (error) {
    console.error('Error saving comment:', error);
    showNotification('An error occurred while saving your comment', 'error');
  }
}

// Show notification
function showNotification(message: string, type: 'success' | 'error') {
  const notification = document.createElement('div');
  notification.className = `knotion-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Load and highlight existing comments
async function loadHighlights() {
  if (!authToken) return;
  
  try {
    // Get linkId by URL
    const linkResponse = await fetch(LINK_BY_URL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        json: {
          url: window.location.href
        }
      })
    });
    
    if (!linkResponse.ok) return;
    
    const linkData = await linkResponse.json();
    const linkId = linkData.result.data.id;
    
    // Get comments for this link
    const commentsResponse = await fetch(`${API_BASE_URL}/api/trpc/comment.getByLinkId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        json: {
          linkId
        }
      })
    });
    
    if (!commentsResponse.ok) return;
    
    const commentsData = await commentsResponse.json();
    const comments = commentsData.result.data;
    
    // Highlight each comment's range
    comments.forEach((comment: any) => {
      try {
        const rangeSelector = JSON.parse(comment.rangeSelector);
        const range = deserializeRange(rangeSelector);
        
        if (range) {
          highlightRange(range, comment.text);
        }
      } catch (error) {
        console.error('Error highlighting comment:', error);
      }
    });
  } catch (error) {
    console.error('Error loading highlights:', error);
  }
}

// Highlight a range of text
function highlightRange(range: Range, text: string) {
  const mark = document.createElement('mark');
  mark.className = 'knotion-highlight';
  mark.setAttribute('data-comment', text);
  mark.style.backgroundColor = 'rgba(255, 230, 0, 0.3)';
  mark.style.cursor = 'pointer';
  
  // Add event listener to show comment on hover
  mark.addEventListener('mouseover', (event) => {
    const comment = mark.getAttribute('data-comment');
    if (comment) {
      showCommentTooltip(comment, event);
    }
  });
  
  mark.addEventListener('mouseout', () => {
    hideCommentTooltip();
  });
  
  try {
    range.surroundContents(mark);
  } catch (error) {
    console.error('Error highlighting range:', error);
  }
}

// Show comment tooltip
function showCommentTooltip(text: string, event: MouseEvent) {
  const tooltip = document.createElement('div');
  tooltip.id = 'knotion-tooltip';
  tooltip.className = 'knotion-tooltip';
  tooltip.textContent = text;
  tooltip.style.position = 'absolute';
  tooltip.style.left = `${event.pageX}px`;
  tooltip.style.top = `${event.pageY - 30}px`;
  tooltip.style.backgroundColor = 'black';
  tooltip.style.color = 'white';
  tooltip.style.padding = '5px 10px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.zIndex = '10000';
  
  document.body.appendChild(tooltip);
}

// Hide comment tooltip
function hideCommentTooltip() {
  const tooltip = document.getElementById('knotion-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Run initialization
initialize(); 
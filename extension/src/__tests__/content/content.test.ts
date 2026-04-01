import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Content Script', () => {
  let container: HTMLElement;
  let overlayElement: HTMLElement | null;

  beforeEach(async () => {
    // Mock chrome.runtime
    (global as any).chrome = {
      runtime: {
        onMessage: {
          addListener: vi.fn()
        },
        sendMessage: vi.fn()
      }
    };

    // Set up test container
    container = document.createElement('div');
    container.innerHTML = `
      <p>This is a test paragraph that we can select text from.</p>
      <p>This is another paragraph with more content.</p>
    `;
    document.body.appendChild(container);

    // Import content script
    await import('../../content/index');

    // Get overlay element
    overlayElement = document.querySelector('.knotion-overlay');
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    if (overlayElement) {
      document.body.removeChild(overlayElement);
    }
    vi.clearAllMocks();
  });

  it('should create overlay element on initialization', () => {
    expect(overlayElement).not.toBeNull();
    expect(overlayElement?.className).toBe('knotion-overlay');
    expect(overlayElement?.style.display).toBe('none');
  });

  it('should show overlay when text is selected', () => {
    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Trigger mouseup event
    const mouseupEvent = new MouseEvent('mouseup');
    document.dispatchEvent(mouseupEvent);

    // Check if overlay is shown
    expect(overlayElement?.style.display).toBe('block');
  });

  it('should hide overlay when selection is cleared', () => {
    // First show the overlay
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Trigger mouseup event
    document.dispatchEvent(new MouseEvent('mouseup'));

    // Clear selection
    selection?.removeAllRanges();

    // Trigger mouseup event again
    document.dispatchEvent(new MouseEvent('mouseup'));

    // Check if overlay is hidden
    expect(overlayElement?.style.display).toBe('none');
  });

  it('should create highlight when highlight button is clicked', () => {
    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Trigger mouseup event to show overlay
    document.dispatchEvent(new MouseEvent('mouseup'));

    // Find and click highlight button
    const highlightButton = overlayElement?.querySelector('button');
    expect(highlightButton).not.toBeNull();
    highlightButton?.click();

    // Check if highlight was created
    const highlight = document.querySelector('.knotion-highlight');
    expect(highlight).not.toBeNull();

    // Check if message was sent to background script
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SAVE_HIGHLIGHT',
        highlight: expect.objectContaining({
          text: expect.any(String),
          url: expect.any(String)
        })
      })
    );
  });
}); 
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighlightManager } from '../../lib/highlightManager';

describe('HighlightManager', () => {
  let highlightManager: HighlightManager;
  let container: HTMLElement;

  beforeEach(() => {
    // Set up a test container
    container = document.createElement('div');
    container.innerHTML = `
      <p>This is a test paragraph with some text that we can highlight.</p>
      <p>This is another paragraph with different content.</p>
    `;
    document.body.appendChild(container);
    
    highlightManager = HighlightManager.getInstance();
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  it('should create a highlight from selected text', () => {
    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Create highlight
    const highlight = highlightManager.createHighlight();
    
    expect(highlight).not.toBeNull();
    expect(highlight?.text).toBe('test parag');
    expect(highlight?.id).toBeDefined();
    expect(highlight?.containerSelector).toContain('p');
  });

  it('should remove an existing highlight', () => {
    // Create a highlight first
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const highlight = highlightManager.createHighlight();
    if (!highlight) throw new Error('Failed to create highlight');

    // Check if highlight exists
    const highlightElement = document.querySelector(`[data-highlight-id="${highlight.id}"]`);
    expect(highlightElement).not.toBeNull();

    // Remove highlight
    highlightManager.removeHighlight(highlight.id);

    // Check if highlight was removed
    const removedHighlight = document.querySelector(`[data-highlight-id="${highlight.id}"]`);
    expect(removedHighlight).toBeNull();
  });

  it('should deserialize a previously created highlight', () => {
    // Create and serialize a highlight
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const originalHighlight = highlightManager.createHighlight();
    if (!originalHighlight) throw new Error('Failed to create highlight');

    // Remove the highlight
    highlightManager.removeHighlight(originalHighlight.id);

    // Deserialize the highlight
    const success = highlightManager.deserializeHighlight(originalHighlight);
    expect(success).toBe(true);

    // Check if highlight was recreated
    const recreatedHighlight = document.querySelector(`[data-highlight-id="${originalHighlight.id}"]`);
    expect(recreatedHighlight).not.toBeNull();
  });
}); 
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SelectionService } from '../../lib/selectionService';
import * as rangy from 'rangy';

describe('SelectionService', () => {
  let selectionService: SelectionService;
  let container: HTMLElement;

  beforeEach(() => {
    // Set up a test container
    container = document.createElement('div');
    container.innerHTML = `
      <p>This is a test paragraph with some text that we can select.</p>
      <p>This is another paragraph with different content.</p>
    `;
    document.body.appendChild(container);
    
    selectionService = SelectionService.getInstance();
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it('should detect text selection', () => {
    const eventSpy = vi.fn();
    document.addEventListener('knotion-selection', eventSpy);

    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = rangy.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Simulate mouseup event
    container.dispatchEvent(new MouseEvent('mouseup'));

    expect(eventSpy).toHaveBeenCalled();
    const event = eventSpy.mock.calls[0][0] as CustomEvent;
    expect(event.detail.text).toBe('test parag');
  });

  it('should get current selection', () => {
    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = rangy.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const currentSelection = selectionService.getCurrentSelection();
    expect(currentSelection).not.toBeNull();
    expect(currentSelection?.text).toBe('test parag');
  });

  it('should clear selection', () => {
    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = rangy.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    selectionService.clearSelection();
    expect(selection.isCollapsed).toBe(true);
  });

  it('should create highlight from selection', () => {
    // Create a selection
    const range = document.createRange();
    const firstParagraph = container.querySelector('p');
    if (!firstParagraph) throw new Error('Test setup failed');
    
    range.setStart(firstParagraph.firstChild!, 10);
    range.setEnd(firstParagraph.firstChild!, 20);
    
    const selection = rangy.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const highlight = selectionService.createHighlightFromSelection();
    expect(highlight).not.toBeNull();
    expect(highlight?.text).toBe('test parag');
  });
}); 
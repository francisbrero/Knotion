import React, { useState, useEffect } from 'react';
import { Highlight } from '../../lib/highlightManager';

interface HighlightOverlayProps {
  highlight: Highlight;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  highlight,
  onDelete,
  onEdit,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const highlightEl = document.querySelector(`[data-highlight-id="${highlight.id}"]`);
    if (!highlightEl) return;

    const updatePosition = () => {
      const rect = highlightEl.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 40, // Position above highlight
        left: rect.left + window.scrollX,
      });
    };

    const showOverlay = () => {
      setIsVisible(true);
      updatePosition();
    };

    const hideOverlay = (e: MouseEvent) => {
      const target = e.relatedTarget as HTMLElement;
      if (!target?.closest('.highlight-overlay')) {
        setIsVisible(false);
      }
    };

    highlightEl.addEventListener('mouseenter', () => showOverlay());
    highlightEl.addEventListener('mouseleave', (e) => hideOverlay(e as MouseEvent));
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      highlightEl.removeEventListener('mouseenter', () => showOverlay());
      highlightEl.removeEventListener('mouseleave', (e) => hideOverlay(e as MouseEvent));
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [highlight.id]);

  if (!isVisible) return null;

  return (
    <div
      className="highlight-overlay fixed z-50 bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={() => onEdit(highlight.id)}
        className="p-1 hover:bg-gray-100 rounded"
        title="Edit highlight"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        onClick={() => onDelete(highlight.id)}
        className="p-1 hover:bg-gray-100 rounded text-red-600"
        title="Delete highlight"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}; 
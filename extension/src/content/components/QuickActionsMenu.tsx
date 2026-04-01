import React, { useEffect, useState } from 'react';
import { SelectionService } from '../../lib/selectionService';

interface QuickActionsMenuProps {
  onHighlight: () => void;
  onShare: () => void;
  onCopy: () => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  onHighlight,
  onShare,
  onCopy,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleSelection = (event: CustomEvent) => {
      const { rect } = event.detail;
      
      // Position the menu above the selection
      setPosition({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + (rect.width / 2),
      });
      
      setIsVisible(true);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.quick-actions-menu')) {
        setIsVisible(false);
      }
    };

    document.addEventListener('knotion-selection', handleSelection as EventListener);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('knotion-selection', handleSelection as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="quick-actions-menu fixed z-50 bg-white shadow-lg rounded-lg p-1 flex items-center space-x-1 transform -translate-x-1/2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={() => {
          onHighlight();
          setIsVisible(false);
        }}
        className="p-2 hover:bg-yellow-50 rounded-lg group"
        title="Highlight"
      >
        <svg className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
          <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
        </svg>
      </button>

      <button
        onClick={() => {
          onShare();
          setIsVisible(false);
        }}
        className="p-2 hover:bg-blue-50 rounded-lg group"
        title="Share"
      >
        <svg className="w-4 h-4 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      <button
        onClick={() => {
          onCopy();
          setIsVisible(false);
        }}
        className="p-2 hover:bg-gray-50 rounded-lg group"
        title="Copy"
      >
        <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      </button>
    </div>
  );
}; 
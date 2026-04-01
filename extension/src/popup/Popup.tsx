import React, { useEffect, useState } from 'react';
import '../styles/highlight.css';

interface HighlightStats {
  total: number;
  today: number;
}

export const Popup: React.FC = () => {
  const [stats, setStats] = useState<HighlightStats>({ total: 0, today: 0 });
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Load stats from storage
    chrome.storage.local.get(['highlightStats', 'knotionEnabled'], (result) => {
      if (result.highlightStats) {
        setStats(result.highlightStats);
      }
      setIsEnabled(result.knotionEnabled ?? true);
    });
  }, []);

  const toggleExtension = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    chrome.storage.local.set({ knotionEnabled: newState });
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, { 
          type: 'TOGGLE_KNOTION',
          enabled: newState 
        });
      }
    });
  };

  return (
    <div className="w-64 p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">KNotion</h1>
        <button
          onClick={toggleExtension}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
            isEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Today's Highlights</p>
          <p className="text-2xl font-bold text-gray-800">{stats.today}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Highlights</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Dashboard
        </button>
      </div>
    </div>
  );
}; 
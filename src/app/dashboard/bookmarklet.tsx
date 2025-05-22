"use client";

import React from "react";

export function Bookmarklet() {
  // The bookmarklet JavaScript code
  const bookmarkletCode = `
    javascript:(function(){
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      window.open(
        '${window.location.origin}/dashboard/add?url=' + url + '&title=' + title,
        '_blank',
        'width=600,height=700'
      );
    })();
  `.trim();

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Save Links from Anywhere</h2>
      <p className="mb-4">
        Drag this button to your bookmarks bar to quickly save links while browsing:
      </p>
      <div className="mb-4">
        <a
          href={bookmarkletCode}
          className="inline-block rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          onClick={(e) => e.preventDefault()}
          draggable="true"
        >
          Save to KNotion
        </a>
      </div>
      <div className="text-sm text-gray-600">
        <p>Instructions:</p>
        <ol className="ml-4 list-decimal">
          <li>Drag the button above to your browser&apos;s bookmarks toolbar</li>
          <li>While browsing, click the bookmark to save the current page</li>
          <li>Add tags and save the link in the popup window</li>
        </ol>
      </div>
    </div>
  );
} 
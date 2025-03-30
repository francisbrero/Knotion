# KNotion PRD

## **High-Level Product Description:**

This product is a personal and collaborative knowledge management tool designed to empower users to efficiently save, organize, annotate, and discuss online content. It combines the functionality of a powerful bookmarking system with collaborative discussion threads and shared collections, creating a central hub for personal research and team knowledge sharing.

**Key Benefits:**

- **Centralized Knowledge Repository:** Users can easily save and organize valuable online resources, eliminating the clutter of scattered bookmarks and notes.
- **Enhanced Information Retrieval:** Robust search and tagging features enable users to quickly find the information they need.
- **Collaborative Learning and Discussion:** Integrated discussion threads allow for real-time collaboration and knowledge sharing on any web page.
- **Team Knowledge Sharing:** Shared collections facilitate collaborative research and project management, enabling teams to build and share collective knowledge.
- **Personalization and Customization:** Users can tailor the tool to their specific needs through customizable folders, tags, and annotation tools.

**In simpler terms:**

It's like a super-powered bookmarking tool that lets you not only save links but also add notes, highlight important parts, and have conversations about those links with yourself or your team, all in one place. It helps you keep track of what you find online and work with others to learn and build knowledge together.

## **1. Introduction**

- **1.1 Purpose:** This document outlines the requirements for a personal tool to collect, organize, annotate, share, and discuss online links and associated content.
- **1.2 Goals:**
    - Provide a central repository for valuable online resources.
    - Enable efficient retrieval of saved information.
    - Facilitate personal knowledge organization.
    - Allow for personal annotating and note taking of web pages.
    - Enable collaborative discussion and knowledge sharing.
- **1.3 Target User:** Individuals and teams seeking to manage, organize, and discuss online research, learning materials, and general web discoveries.

## **2. Features**

- **2.1 Link Saving:**
    - Browser extension for one-click saving of web page URLs.
    - Manual URL input option.
    - Automatic capture of page title and description.
    - Ability to add custom tags/labels to links.
- **2.2 Link Organization:**
    - Creation of customizable folders or collections.
    - Tag-based filtering and sorting.
    - Search functionality for titles, descriptions, tags, and within saved page content (if possible).
- **2.3 Annotation and Note-Taking:**
    - Ability to add personal notes to saved links.
    - Highlighting and annotation directly on saved web pages (stored locally, or through a service like hypothes.is if you want to integrate a service).
    - Saving of local snapshots of web pages, or full webpage archives.
- **2.4 Search and Retrieval:**
    - Full-text search of saved link metadata and content (if snapshots are saved).
    - Filtering by tags, folders, and date.
    - Display of search results with relevant snippets.
- **2.5 Data Management:**
    - Import/export functionality for bookmarks (e.g., HTML, JSON).
    - Local storage of data with optional cloud backup (for future consideration).
    - Option to save webpage snapshots locally.
- **2.6 Collaborative Discussion Threads:**
    - Ability to create and embed discussion threads on any publicly accessible web page.
    - Threaded comments with replies and mentions.
    - Real-time updates to comments and discussions.
    - User authentication and authorization for thread participation.
    - Option to make discussions private or public (within user's network).
    - Notifications for new comments and replies.
    - Ability to pin certain comments to the top of a thread.
- **2.7 Shared Collections (Libraries):**
    - Ability to create shared collections of links with other users.
    - Permission controls for viewing, commenting, and editing shared collections.
    - Activity feed for shared collections, showing recent additions and discussions.
    - Ability to follow other users collections.

## **3. User Stories**

- **As a user,** I want to save a web page with a single click so I can quickly capture interesting content.
- **As a user,** I want to add tags to my saved links so I can easily categorize and find them later.
- **As a user,** I want to create folders or collections to organize my links by topic or project.
- **As a user,** I want to add personal notes to a saved link so I can record my thoughts and insights.
- **As a user,** I want to search for saved links by title, description, tags, or content so I can quickly find what I need.
- **As a user,** I want to filter my saved links by tags or folders so I can narrow down my search.
- **As a user,** I want to import my existing browser bookmarks so I can consolidate my links in one place.
- **As a user,** I want to export my saved links so I can back them up or share them.
- **As a user,** I want to highlight sections of saved web pages and add annotations so I can remember key information.
- **As a user,** I want to save a local snapshot of a webpage, so the information is available even if the original page changes or disappears.
- **As a user,** I want to create a discussion thread on a web page so I can gather feedback and insights from others.
- **As a user,** I want to reply to comments in a discussion thread so I can participate in the conversation.
- **As a user,** I want to mention other users in a discussion thread so I can notify them of relevant comments.
- **As a user,** I want to receive notifications when someone comments on a thread I'm following so I can stay up-to-date.
- **As a user,** I want to create shared collections of links with my team so we can collaborate on research and projects.
- **As a user,** I want to control who can view and comment on my shared collections so I can manage access.
- **As a user,** I want to follow other users collections, so I can see what interesting content they are saving.
- **As a user,** I want to pin important comments to the top of a thread, so that they are easily visible.

## **4. Technical Requirements**

- **4.1 Browser Extension:**
    - Compatible with major browsers (Chrome, Firefox, Edge).
    - JavaScript for DOM manipulation and API calls.
- **4.2 Backend (Required for Collaboration):**
    - Real-time communication framework (e.g., WebSockets) for discussion threads.
    - Database for storing user profiles, discussion threads, comments, and collections (e.g., Firebase).
    - API for user authentication, thread management, comment handling, and collection management.
    - A system for tracking user permissions for collections, and discussions.
- **4.3 Frontend:**
    - HTML, CSS, and JavaScript for user interface.
    - Framework (e.g., React.js) for complex UI interactions.
- **4.4 Storage:**
    - Cloud storage for web page snapshots (Firebase).
    - Synchronized database for metadata (Firebase).
    - Cloud storage and synchronization for data backup and access across devices (Firebase)

## **5. User Interface (UI) Considerations**

**5.1. Chrome Extension (Saving & Quick Interaction):**

- **1.1 Saving Flow:**
    - **One-Click Save:** A prominent icon in the browser toolbar enables instant saving of the current page.
    - **Save Dialog:** Upon clicking, a small, non-intrusive dialog box appears.
        - Displays the page title and automatically generated description.
        - Provides a text field for adding tags/labels.
        - Offers a quick "Add Notes" option.
        - Includes a "Save to Collection" dropdown to select a folder or shared collection.
        - A "Start Discussion" button to immediately create a thread on the page.
    - **Visual Feedback:** Clear visual cues (e.g., a checkmark or confirmation message) to indicate successful saving.
- **1.2 Quick Access:**
    - **Popup Interface:** Clicking the extension icon opens a small popup window.
        - Displays recently saved links.
        - Provides a quick search bar.
        - Allows quick access to saved collections.
        - Displays recent notifications from discussions.
- **1.3 Discussion Thread Integration (On Page):**
    - **Thread Indicator:** A subtle icon or indicator on the page signals the presence of a discussion thread.
    - **Thread Overlay/Sidebar:** Clicking the indicator opens a collapsible overlay or sidebar displaying the discussion thread.
    - **Contextual Comments:** Comments are displayed in a threaded format, with clear user avatars and timestamps.
    - Easy to see unread comments.

**5.2. Master Content Database (Pocket-Inspired UI):**

- **2.1 Main View (List/Grid):**
    - **Clean and Minimalist Design:** Prioritize a clutter-free layout with ample white space.
    - **List/Grid Toggle:** Allow users to switch between list and grid views.
    - **Item Cards:** Each saved link is represented as a card or list item.
        - Displays the page title, description, and thumbnail (if available).
        - Shows tags/labels and collection names.
        - Includes a "Read" or "Visit" button.
        - Displays an indicator if there are discussion threads on the link.
        - Displays if the page has local annotations.
- **2.2 Navigation and Filtering:**
    - **Sidebar Navigation:** A left-hand sidebar provides access to:
        - "My Links" (all saved links).
        - Collections (folders and shared collections).
        - Tags (list of all tags).
        - Search bar.
        - Notifications.
    - **Filtering and Sorting:** Options to filter by tags, collections, and date; sort by relevance, date, or title.
- **2.3 Reading/Viewing Experience:**
    - **Clean Reader View (Optional):** If possible, offer a clean reader view to strip away distractions from saved pages.
    - Ability to view local snapshot of the webpage.
    - **Note-Taking and Annotation Panel:** A sidebar or overlay for viewing and editing notes and annotations.
    - **Discussion Thread Panel:** A sidebar or overlay for viewing and participating in discussions.
- **2.4 Collection Management:**
    - **Collection Creation/Editing:** Intuitive interface for creating and managing collections.
    - **Permission Settings:** Clear controls for managing access to shared collections.
    - **Activity Feed:** Display recent activity within shared collections.
- **2.5 Search:**
    - A prominent search bar at the top of the interface.
    - Search results that display relevant snippets.
    - Ability to filter search results.
- **2.6 Inbox:**
    - A complete inbox notification system where users can see when someone commented on a document, shared content, or started discussions. The implementation includes a dropdown in the navbar showing recent notifications with unread indicators, and a full inbox page to manage all notifications.

**Key UI Principles:**

- **Consistency:** Maintain a consistent design language across the extension and the web app.
- **Efficiency:** Prioritize quick and easy access to core features.
- **Clarity:** Use clear and concise language and visual cues.
- **Customization:** Allow users to customize the UI to their preferences.
- **Accessibility:** Design for accessibility, ensuring that the UI is usable by everyone.

**Live Prototype:** https://learn-huddle.lovable.app/

---

## ✅ **MVP Scope**

The MVP focuses on three core pillars:

1. **In-page commenting** via Chrome extension.
2. **Cloud storage** and basic organization (tags, collections).
3. **Collaboration** via invite-only threads.

### In Scope for MVP:

- Chrome extension that lets users highlight and comment on any webpage.
- Store comments and highlights in Firebase.
- Store metadata about text range (startOffset, endOffset, containerSelector) and fallback logic.
- Allow adding tags and assigning saved links to collections (at save time only).
- Invite-only collaboration on discussion threads.
- Basic reply functionality in threads.
- Basic inbox to show when someone has commented.
- Google SSO-based login.

### Deferred to Post-MVP:

- Reader view.
- Page snapshots.
- Real-time notifications.
- Editing/deleting/pinning comments.
- Public threads.
- Full tag and collection management in the extension.
- Offline support.
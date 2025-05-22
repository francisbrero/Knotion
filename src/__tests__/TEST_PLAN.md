# Test Plan

## 1. Authentication Tests
Located in: `src/__tests__/auth/`

### 1.1 Google SSO Flow
- Test successful Google sign-in flow
- Test sign-in error handling
- Test sign-out flow
- Test persistence of auth state

### 1.2 Auth State Management
- Test auth state initialization
- Test auth state updates
- Test auth state persistence across page reloads
- Test auth state cleanup on logout

## 2. Extension Tests
Located in: `src/__tests__/extension/`

### 2.1 Extension Setup
- Test extension loading
- Test background script initialization
- Test content script injection
- Test manifest configuration
- Test hot reload functionality

### 2.2 Text Selection & Highlighting
Located in: `src/__tests__/highlighting/`

- Test text selection mechanics
- Test highlight creation and removal
- Test highlight serialization/deserialization
- Test highlight persistence
- Test highlight styling
- Test highlight interaction (hover, click)
- Test multiple highlights on same page

## Test Implementation Strategy

1. Setup Phase:
   - Initialize test environment for each component
   - Mock browser APIs where needed
   - Set up test data fixtures

2. Execution Phase:
   - Use Jest for unit testing
   - Use React Testing Library for component testing
   - Use Playwright for E2E testing of extension
   - Implement proper cleanup after each test

3. Assertions:
   - Use explicit assertions for each test case
   - Test both positive and negative scenarios
   - Verify proper error messages and states 
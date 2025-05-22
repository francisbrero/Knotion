# Knotion
Personal tool to collect, organize, annotate, share, and discuss online links and associated content.

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded file as `serviceAccount.json` in the project root

### Development Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/knotion.git
   cd knotion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Code Quality Tools

#### ESLint
ESLint is configured with TypeScript and React best practices.

- Run linting:
  ```bash
  npm run lint
  ```

- Fix auto-fixable issues:
  ```bash
  npm run lint:fix
  ```

#### Prettier
Prettier is set up for consistent code formatting.

- Format code:
  ```bash
  npm run format
  ```

- VS Code Setup:
  1. Install the Prettier extension
  2. Enable "Format on Save"
  3. Set Prettier as default formatter

### Testing

Vitest and React Testing Library are configured for testing. Run tests with:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### GitHub Actions Setup

1. Create `.github/workflows` directory:
   ```bash
   mkdir -p .github/workflows
   ```

2. Create CI workflow file `.github/workflows/ci.yml`:
   ```yaml
   name: CI

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
       - uses: actions/checkout@v4
       
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'
           
       - name: Install dependencies
         run: npm ci
         
       - name: Lint
         run: npm run lint
         
       - name: Type check
         run: tsc --noEmit
         
       - name: Test
         run: npm run test:coverage
         
       - name: Build
         run: npm run build

   ```

3. Create CD workflow file `.github/workflows/cd.yml`:
   ```yaml
   name: CD

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v4
       
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'
           
       - name: Install dependencies
         run: npm ci
         
       - name: Build
         run: npm run build
         
       - name: Deploy to Firebase
         uses: FirebaseExtended/action-hosting-deploy@v0
         with:
           repoToken: '${{ secrets.GITHUB_TOKEN }}'
           firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
           channelId: live
   ```

4. Add Firebase service account secret:
   - Go to GitHub repository settings > Secrets and variables > Actions
   - Create a new secret `FIREBASE_SERVICE_ACCOUNT`
   - Copy the entire content of your `serviceAccount.json` as the secret value

### VS Code Recommended Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Vitest Runner
- Firebase Rules

### Project Structure
```
knotion/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── src/
│   ├── components/
│   ├── services/
│   │   └── firebase/
│   ├── hooks/
│   ├── utils/
│   └── setupTests.ts
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── serviceAccount.json (gitignored)
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier

Get your serviceAccount.json from firebase and put it in the root of the project.

### Firebase Hosting Setup
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set build directory to `build`
   - Configure as a single-page app: Yes
   - Set up GitHub Action deploys: Yes

4. Manual deployment (if needed):
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

Note: The project is configured to automatically deploy to Firebase Hosting when changes are pushed to the main branch.

### Chrome Extension Setup

1. Navigate to the extension directory:
   ```bash
   cd extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development build with hot reload:
   ```bash
   npm run dev
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `extension/dist` directory

5. Set up Google OAuth for the extension:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select your existing Firebase project
   - Enable the Google Sign-In API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Select "Chrome Extension" as application type
   - Add your extension ID (found in chrome://extensions/ after loading the extension)
   - Add the OAuth 2.0 scopes:
     - https://www.googleapis.com/auth/userinfo.email
     - https://www.googleapis.com/auth/userinfo.profile
   - Copy the generated client ID and update it in `extension/public/manifest.json`


The extension should now be active in Chrome. You can:
- Click the extension icon in the toolbar to see stats and toggle the extension
- Select text on any webpage to see the quick actions menu
- Create highlights and hover over them to see the highlight overlay
- Enable/disable the extension using the toggle in the popup

#### Extension Features
- Text selection and highlighting
- Quick actions menu for selected text
- Highlight overlay with edit/delete actions
- Stats tracking in the popup
- Enable/disable toggle
- Persistence of highlights

#### Extension Development
The extension is built with:
- React for UI components
- TypeScript for type safety
- Tailwind CSS for styling
- Rangy for text selection and highlighting
- Chrome Extension Manifest V3


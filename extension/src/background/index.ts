import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import serviceAccount from '../../../serviceAccount.json';

// Initialize Firebase with web config
const firebaseConfig = {
  apiKey: "AIzaSyBPkqFWUUdwGUuZCgzVFe_vEd2qAYS_Xtc",
  authDomain: "knotion-4a576.firebaseapp.com",
  projectId: serviceAccount.project_id,
  storageBucket: "knotion-4a576.appspot.com",
  messagingSenderId: "1015423575467",
  appId: "1:1015423575467:web:c0c0c0c0c0c0c0c0c0c0c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default values
  chrome.storage.local.set({
    knotionEnabled: true,
    highlightStats: {
      total: 0,
      today: 0
    },
    highlights: []
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_STATS') {
    chrome.storage.local.get(['highlightStats'], (result) => {
      const stats = result.highlightStats || { total: 0, today: 0 };
      const newStats = {
        total: stats.total + 1,
        today: stats.today + 1
      };
      chrome.storage.local.set({ highlightStats: newStats });
    });
  }
});

// Handle saving highlights to Firestore
async function handleSaveHighlight(highlight: any) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const highlightData = {
      ...highlight,
      userId: user.uid,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'highlights'), highlightData);
    return { success: true, highlightId: docRef.id };
  } catch (error) {
    console.error('Error saving highlight:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Handle deleting highlights from Firestore
async function handleDeleteHighlight(highlightId: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    await deleteDoc(doc(db, 'highlights', highlightId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Handle fetching highlights for a specific page
async function handleGetPageHighlights(url: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const highlightsQuery = query(
      collection(db, 'highlights'),
      where('userId', '==', user.uid),
      where('url', '==', url)
    );

    const querySnapshot = await getDocs(highlightsQuery);
    const highlights = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, highlights };
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
}); 
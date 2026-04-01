import React from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthChange } from '../../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if there's a stored auth token in chrome.storage
    chrome.storage.local.get(['authToken'], (result) => {
      if (result.authToken) {
        // Initialize Firebase with stored token if exists
        // This helps with auth persistence in the extension
        chrome.runtime.sendMessage({ type: 'INIT_AUTH', token: result.authToken });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (user) {
        // Store auth token when user signs in
        user.getIdToken().then((token) => {
          chrome.storage.local.set({ authToken: token });
        });
      } else {
        // Remove token when user signs out
        chrome.storage.local.remove(['authToken']);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      chrome.storage.local.remove(['authToken']);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 
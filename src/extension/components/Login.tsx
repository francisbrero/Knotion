import React from 'react';
import { useAuth } from '../auth/useAuth';

export const Login: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Sign in error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-xl font-semibold mb-4">Welcome to KNotion</h1>
      <button
        onClick={handleSignIn}
        className="flex items-center px-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <img
          src="google-icon.png"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        Sign in with Google
      </button>
      {error && (
        <div className="mt-4 text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}; 
import React from 'react';
import { useAuth } from '../auth/useAuth';

export const Login: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn();
    } catch (err) {
      // Error is handled by AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to KNotion
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your personal knowledge management tool
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <button
              onClick={handleSignIn}
              disabled={loading || isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (loading || isLoading) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {loading || isLoading ? (
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
              ) : (
                'Sign in with Google'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-sm text-center text-red-600">
              {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
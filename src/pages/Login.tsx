import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Footer from '../components/Footer';

export default function Login() {
  const { login, signUp, error: authError, clearError, isLoading, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (isForgotPassword) {
      handleForgotPassword();
      return;
    }

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      setLocalError(error.message || 'Authentication failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setLocalError(null);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to send reset email');
    }
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <img src="/favicon.PNG" alt="BookRec Logo" className="w-[240px] h-[240px] rounded-3xl" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-text">
              {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}
            </h2>
            <p className="mt-2 text-text-light">
              {isForgotPassword ? 'Enter your email to receive a reset link' : 'Discover your next favorite read'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            {resetEmailSent && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center">
                Password reset email sent! Please check your inbox.
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full px-3 py-3 border rounded-lg focus:ring-1 focus:ring-accent focus:outline-none pt-6"
                  placeholder=" "
                  disabled={isLoading}
                />
                <label className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
                  Email address
                </label>
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              {!isForgotPassword && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer w-full px-3 py-3 border rounded-lg focus:ring-1 focus:ring-accent focus:outline-none pt-6"
                    placeholder=" "
                    disabled={isLoading}
                  />
                  <label className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In'))}
              </button>
            </div>
          </form>

          <div className="text-center space-y-2">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError(null);
                  clearError();
                }}
                className="text-accent hover:text-accent-dark"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(!isForgotPassword);
                setLocalError(null);
                clearError();
                setResetEmailSent(false);
              }}
              className="block mx-auto text-accent hover:text-accent-dark"
            >
              {isForgotPassword ? 'Back to login' : 'Forgot your password?'}
            </button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>
    </div>
  );
}
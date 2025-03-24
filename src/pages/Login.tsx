import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
              <label className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none transition-all duration-200 peer-focus:text-xs peer-focus:top-3.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-3.5">
                Email
              </label>
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light" size={20} />
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
                <label className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none transition-all duration-200 peer-focus:text-xs peer-focus:top-3.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-3.5">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {!isForgotPassword ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setPassword('');
                    clearError();
                    setResetEmailSent(false);
                  }}
                  className="text-accent hover:text-accent-dark text-sm"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmail('');
                    setPassword('');
                    clearError();
                  }}
                  className="text-accent hover:text-accent-dark text-sm"
                  disabled={isLoading}
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  clearError();
                  setResetEmailSent(false);
                }}
                className="text-accent hover:text-accent-dark text-sm"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-accent text-white rounded-lg hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In'))}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, signUp, error: authError, clearError, isLoading, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

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

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img src="/favicon.PNG" alt="BookRec Logo" className="w-[240px] h-[240px] rounded-3xl" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-text-light">
            Discover your next favorite read
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
              {error}
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
          </div>

          <button
            type="submit"
            className="button w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                clearError();
              }}
              className="text-accent hover:underline"
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-text-light">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
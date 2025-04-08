import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, signUp, error: authError, clearError, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors when switching modes
  useEffect(() => {
    setLocalError(null);
    clearError();
  }, [isSignUp]);

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate password strength
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };
  
  const handleAuth = async () => {
    try {
      setLocalError(null);
      clearError();

      // Input validation
      if (!email || !password) {
        setLocalError('Please enter both email and password');
        return;
      }

      if (!isValidEmail(email)) {
        setLocalError('Please enter a valid email address');
        return;
      }

      if (!isValidPassword(password)) {
        setLocalError('Password must be at least 6 characters long');
        return;
      }

      // Attempt authentication
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }

      // Clear form
      setEmail('');
      setPassword('');
      
      // Navigate to main app
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      setLocalError(error.message || 'Authentication failed');
    }
  };
  
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  const error = localError || authError;
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <BookOpen className="w-16 h-16 text-accent mb-4" />
          <h1 className="text-3xl font-bold text-text mb-2">Book Tinder</h1>
          <p className="text-textLight">Discover your next favorite read</p>
        </div>
        
        {/* Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-text text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textLight" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textLight" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textLight hover:text-text"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              isSignUp ? 'Sign Up' : 'Login'
            )}
          </button>

          {/* Toggle Auth Mode */}
          <button
            onClick={toggleAuthMode}
            className="w-full text-sm text-textLight hover:text-text"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8'
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, signUp, error: authError, clearError, isLoading, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

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
      router.replace('/(tabs)');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['rgba(167, 93, 93, 0.1)', 'transparent']}
          style={styles.gradient}
        />

        <View style={styles.header}>
          <BookOpen size={60} color={THEME.accent} />
          <Text style={styles.title}>Book Tinder</Text>
          <Text style={styles.subtitle}>Discover your next favorite read</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Mail size={20} color={THEME.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={THEME.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
              autoComplete="email"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color={THEME.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={THEME.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={20} color={THEME.textLight} />
              ) : (
                <Eye size={20} color={THEME.textLight} />
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity 
              onPress={toggleAuthMode}
              disabled={isLoading}
            >
              <Text style={styles.switchButton}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textLight,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: THEME.text,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  authButton: {
    backgroundColor: THEME.accent,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: THEME.textLight,
    fontSize: 14,
  },
  switchButton: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: THEME.textLight,
    fontSize: 12,
    textAlign: 'center',
  },
});
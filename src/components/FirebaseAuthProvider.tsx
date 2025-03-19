import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !isAuthenticated) {
        // Update auth store if Firebase has a user but store doesn't
        useAuthStore.setState({ 
          user: firebaseUser,
          isAuthenticated: true,
          isLoading: false
        });
      } else if (!firebaseUser && isAuthenticated) {
        // Update auth store if Firebase has no user but store thinks we're authenticated
        useAuthStore.setState({ 
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user: authUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
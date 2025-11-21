
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../services/supabase';
import { useToast } from '../components/Toast';

interface AuthContextType {
  user: User | null;
  userName: string | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateSubscription: (status: 'free' | 'pro') => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchUserProfile = async (userId: string, email: string, metaName?: string) => {
    try {
        // Fetch additional profile data (subscription status)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { 
            console.error('Error fetching profile:', error);
        }

        const subscriptionStatus = data?.subscription_status || 'free';

        setUser({
            id: userId,
            email: email,
            subscriptionStatus: subscriptionStatus as 'free' | 'pro',
        });
        
        // Set display name from metadata or email
        setUserName(metaName || email.split('@')[0]);

    } catch (error) {
        console.error('Profile fetch error:', error);
        // Fallback
        setUser({ id: userId, email, subscriptionStatus: 'free' });
        setUserName(metaName || email.split('@')[0]);
    }
  };

  useEffect(() => {
    // Check active session
    const initSession = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.warn("Session check error:", error.message);
                throw error;
            }

            if (data?.session?.user) {
                await fetchUserProfile(
                    data.session.user.id, 
                    data.session.user.email || '', 
                    data.session.user.user_metadata?.full_name
                );
            }
        } catch (error) {
            console.error("Auth initialization failed (Offline or Invalid Config):", error);
            // Ensure we don't leave the app in a loading state indefinitely
        } finally {
            setLoading(false);
        }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            await fetchUserProfile(
                session.user.id, 
                session.user.email || '',
                session.user.user_metadata?.full_name
            );
        } else {
            setUser(null);
            setUserName(null);
        }
        setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password?: string, name?: string) => {
      if (!password) {
          addToast('Senha é obrigatória para cadastro.', 'error');
          return;
      }
      
      // We include emailRedirectTo to help with email confirmation flows if enabled on Supabase
      const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: {
                  full_name: name,
              },
              emailRedirectTo: window.location.origin
          }
      });
      
      if (error) throw error;
      addToast('Cadastro realizado! Verifique seu e-mail para confirmar a conta.', 'success');
  };

  const login = async (email: string, password?: string) => {
    if (!password) {
        addToast('Por favor, insira a senha.', 'error');
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserName(null);
    localStorage.removeItem('user'); 
  };

  const resetPassword = async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      addToast('Email de redefinição enviado! Verifique sua caixa de entrada.', 'success');
  };

  const updateSubscription = async (status: 'free' | 'pro') => {
      if (!user) return;
      
      // Optimistic update locally
      setUser(prev => prev ? ({ ...prev, subscriptionStatus: status }) : null);

      // Update in Supabase
      try {
          const { error } = await supabase
            .from('profiles')
            .update({ subscription_status: status })
            .eq('id', user.id);
            
          if (error) throw error;
      } catch (err) {
          console.error('Failed to update subscription remotely', err);
          // We don't show an error toast here to keep the experience smooth, 
          // assuming the optimistic update is enough for the session.
      }
  };

  return (
    <AuthContext.Provider value={{ user, userName, login, signup, logout, resetPassword, updateSubscription, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

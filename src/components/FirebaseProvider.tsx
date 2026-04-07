import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { UserProfile, OperationType, FirestoreErrorInfo } from '../types';
import { Mail, RefreshCcw, LogOut, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
});

export const useFirebase = () => useContext(FirebaseContext);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserProfile;
          setProfile(data);
          
          // Sync verification status if needed
          if (user.emailVerified && !data.isVerified) {
            updateDoc(userDocRef, { isVerified: true }).catch(err => {
              console.error('Error updating verification status:', err);
            });
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        setLoading(false);
      });

      return () => unsubscribeProfile();
    }
  }, [user, isAuthReady]);

  const handleReload = async () => {
    if (!user) return;
    setCheckingVerification(true);
    try {
      await user.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      if (updatedUser?.emailVerified) {
        const userDocRef = doc(db, 'users', updatedUser.uid);
        await updateDoc(userDocRef, { isVerified: true });
      }
    } catch (error) {
      console.error('Error reloading user:', error);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResend = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      alert('Verification email resent!');
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  if (user && !user.emailVerified && isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-orange-400 p-6 text-white text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm space-y-8 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto border border-white/30">
            <Mail className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Verify your email</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              We've sent a link to <span className="font-bold">{user.email}</span>. 
              Please verify your email to access Jolie Connect.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleReload}
              disabled={checkingVerification}
              className="w-full bg-white text-rose-600 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {checkingVerification ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                'I have verified'
              )}
            </button>

            <button
              onClick={handleResend}
              className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-white/20 transition-all active:scale-95"
            >
              Resend Email
            </button>

            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-2 mx-auto text-sm font-bold underline opacity-70 hover:opacity-100 transition-opacity pt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `Firebase Error: ${parsed.error}`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

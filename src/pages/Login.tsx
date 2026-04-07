import React, { useState } from 'react';
import { auth, signInWithGoogle, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Heart, MessageCircle, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-orange-400 p-6 text-white text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm space-y-6"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Check your email</h2>
            <p className="opacity-90">
              We've sent a verification link to <span className="font-bold">{email}</span>. 
              Please verify your email to continue.
            </p>
          </div>
          <button
            onClick={() => setVerificationSent(false)}
            className="text-sm font-bold underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-orange-400 p-6 text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 text-center w-full max-w-sm"
      >
        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
          <Heart className="w-10 h-10 fill-white" />
        </div>
        
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Jolie</h1>
          <p className="text-sm font-medium opacity-90 leading-tight">
            Connect locally, chat on WhatsApp.
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="w-full space-y-3 pt-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 focus:bg-white/20 focus:ring-2 focus:ring-white/50 transition-all placeholder:text-rose-100 outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 focus:bg-white/20 focus:ring-2 focus:ring-white/50 transition-all placeholder:text-rose-100 outline-none"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-100 bg-rose-900/30 py-2 px-4 rounded-xl border border-rose-500/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-rose-600 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full opacity-60">
          <div className="h-px bg-white flex-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">OR</span>
          <div className="h-px bg-white flex-1" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm font-bold underline opacity-80 hover:opacity-100 transition-opacity"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        
        <p className="text-[10px] opacity-70 px-4 uppercase font-bold tracking-tighter">
          By continuing, you agree to our Terms & Privacy.
        </p>

        <div className="flex items-center gap-2 mt-4 opacity-80">
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">WhatsApp Integrated</span>
        </div>
      </motion.div>
    </div>
  );
};

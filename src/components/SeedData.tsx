import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';
import { Database, Sparkles, Loader2 } from 'lucide-react';

const SAMPLE_USERS = [
  {
    uid: 'sample_1',
    displayName: 'Sarah Namono',
    age: 24,
    gender: 'female',
    location: 'Kampala, Central',
    bio: 'Art lover, coffee enthusiast, and weekend hiker. Looking for someone to explore the city with! 🎨☕',
    whatsappNumber: '+256700000001',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    isPremium: true,
    isVerified: true,
    verificationStatus: 'verified'
  },
  {
    uid: 'sample_2',
    displayName: 'David Okello',
    age: 28,
    gender: 'male',
    location: 'Entebbe, Wakiso',
    bio: 'Tech entrepreneur by day, amateur chef by night. I make the best luwombo in town! 👨‍🍳💻',
    whatsappNumber: '+256700000002',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    isPremium: false,
    isVerified: true,
    verificationStatus: 'verified'
  },
  {
    uid: 'sample_3',
    displayName: 'Aisha Nabirye',
    age: 22,
    gender: 'female',
    location: 'Jinja, Eastern',
    bio: 'Student at MUK. Love music, dancing, and meeting new people. Let\'s connect! 💃🎵',
    whatsappNumber: '+256700000003',
    photoURL: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800&auto=format&fit=crop',
    isPremium: true,
    isVerified: false,
    verificationStatus: 'none'
  },
  {
    uid: 'sample_4',
    displayName: 'Brian Musoke',
    age: 30,
    gender: 'male',
    location: 'Mbarara, Western',
    bio: 'Traveler, photographer, and nature lover. Always looking for the next adventure. 📸🌍',
    whatsappNumber: '+256700000004',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    isPremium: false,
    isVerified: true,
    verificationStatus: 'verified'
  },
  {
    uid: 'sample_5',
    displayName: 'Grace Akello',
    age: 26,
    gender: 'female',
    location: 'Gulu, Northern',
    bio: 'Fashion designer and part-time model. I love bold colors and creative minds. ✨👗',
    whatsappNumber: '+256700000005',
    photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    isPremium: false,
    isVerified: false,
    verificationStatus: 'pending'
  }
];

export const SeedData: React.FC = () => {
  const { user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.email === 'bossokee313@gmail.com';

  if (!isAdmin) return null;

  const seed = async () => {
    setLoading(true);
    try {
      for (const sampleUser of SAMPLE_USERS) {
        const userDocRef = doc(db, 'users', sampleUser.uid);
        await setDoc(userDocRef, {
          ...sampleUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      alert('Database seeded with sample profiles!');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Failed to seed data. Check console for errors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-3xl bg-rose-50 border border-rose-100 space-y-4">
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-rose-500" />
        <h3 className="font-bold text-gray-900">Developer Tools</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Populate the app with realistic sample profiles to test the discovery feed. This is only visible to you.
      </p>
      <button
        onClick={seed}
        disabled={loading}
        className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Seeding...' : 'Seed Sample Profiles'}
      </button>
    </div>
  );
};

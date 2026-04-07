import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserProfile, Match, OperationType } from '../types';
import { useFirebase, handleFirestoreError } from '../components/FirebaseProvider';
import { MessageCircle, Heart, UserX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Matches: React.FC = () => {
  const { user } = useFirebase();
  const [matches, setMatches] = useState<(Match & { otherUser: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
      try {
        const matchesData = await Promise.all(
          snapshot.docs.map(async (d) => {
            const match = { id: d.id, ...d.data() } as Match;
            const otherUid = match.users.find((uid) => uid !== user.uid);
            
            if (!otherUid) return null;

            const userDoc = await getDoc(doc(db, 'users', otherUid));
            if (!userDoc.exists()) return null;

            return {
              ...match,
              otherUser: { uid: userDoc.id, ...userDoc.data() } as UserProfile,
            };
          })
        );

        setMatches(matchesData.filter((m): m is (Match & { otherUser: UserProfile }) => m !== null));
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'matches');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 px-6 pt-12 pb-24">
      <header className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
          <Heart className="text-white w-5 h-5 fill-current" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-rose-600">Your Matches</h1>
      </header>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <UserX className="text-gray-300 w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">No matches yet</h3>
            <p className="text-gray-500 text-sm">Keep discovering and liking people to find a match!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 relative group"
              >
                <div className="aspect-square relative">
                  <img
                    src={match.otherUser.photoURL || `https://picsum.photos/seed/${match.otherUser.uid}/400/400`}
                    alt={match.otherUser.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-bold text-sm truncate">{match.otherUser.displayName}</p>
                    <p className="text-[10px] opacity-80">{match.otherUser.location}</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${match.otherUser.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent("Hey! We matched on Jolie Connect 😊")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

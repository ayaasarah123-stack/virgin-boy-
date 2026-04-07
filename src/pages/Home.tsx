import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, limit, addDoc, serverTimestamp, deleteDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserProfile, OperationType, Match } from '../types';
import { useFirebase, handleFirestoreError } from '../components/FirebaseProvider';
import { UserCard } from '../components/UserCard';
import { Filter, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Home: React.FC = () => {
  const { user } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [likedUids, setLikedUids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'male' | 'female'>('all');
  const [showMatchModal, setShowMatchModal] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;

    const usersQuery = filter === 'all' 
      ? query(collection(db, 'users'), limit(50))
      : query(collection(db, 'users'), where('gender', '==', filter), limit(50));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({ ...doc.data() } as UserProfile))
        .filter(u => u.uid !== user.uid); // Exclude self
      
      // Sort premium users to top
      usersData.sort((a, b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0));
      
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const likesQuery = query(collection(db, 'likes'), where('fromUid', '==', user.uid));
    const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
      const liked = new Set(snapshot.docs.map(doc => doc.data().toUid));
      setLikedUids(liked);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'likes');
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLikes();
    };
  }, [user, filter]);

  const handleLike = async (targetUid: string) => {
    if (!user) return;

    try {
      if (likedUids.has(targetUid)) {
        // Unlike (find and delete)
        const q = query(collection(db, 'likes'), where('fromUid', '==', user.uid), where('toUid', '==', targetUid));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          await deleteDoc(d.ref);
        });
      } else {
        // Like
        await addDoc(collection(db, 'likes'), {
          fromUid: user.uid,
          toUid: targetUid,
          createdAt: serverTimestamp(),
        });

        // Check for mutual match
        const reverseLikeQuery = query(
          collection(db, 'likes'),
          where('fromUid', '==', targetUid),
          where('toUid', '==', user.uid)
        );
        const reverseLikeSnapshot = await getDocs(reverseLikeQuery);

        if (!reverseLikeSnapshot.empty) {
          // It's a match!
          await addDoc(collection(db, 'matches'), {
            users: [user.uid, targetUid],
            createdAt: serverTimestamp(),
          });
          
          // Find the user object to show in modal
          const matchedUser = users.find(u => u.uid === targetUid);
          if (matchedUser) {
            setShowMatchModal(matchedUser);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'likes');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 px-6 pt-12">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Heart className="text-white w-5 h-5 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-rose-600">Discover</h1>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {(['all', 'male', 'female'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="text-gray-300 w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">No matches found</h3>
            <p className="text-gray-500 text-sm">Try changing your filters or check back later!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          <AnimatePresence mode="popLayout">
            {users.map((u) => (
              <UserCard
                key={u.uid}
                user={u}
                onLike={handleLike}
                isLiked={likedUids.has(u.uid)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-[3rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="flex justify-center -space-x-4">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl">
                  <img src={user?.photoURL || ''} className="w-full h-full object-cover" alt="You" />
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl relative z-10">
                  <img src={showMatchModal.photoURL || ''} className="w-full h-full object-cover" alt="Match" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-rose-500">
                  <Sparkles className="w-6 h-6 fill-current" />
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic">It's a Match!</h2>
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
                <p className="text-gray-500 font-medium">
                  You and <span className="text-gray-900 font-bold">{showMatchModal.displayName}</span> liked each other.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://wa.me/${showMatchModal.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent("Hey! We matched on Jolie Connect 😊")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Say Hi on WhatsApp
                </a>
                <button
                  onClick={() => setShowMatchModal(null)}
                  className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                >
                  Keep Discovering
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

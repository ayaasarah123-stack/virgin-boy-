import React from 'react';
import { UserProfile } from '../types';
import { Heart, MessageCircle, MapPin, Sparkles, Check, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from './FirebaseProvider';

interface UserCardProps {
  user: UserProfile;
  onLike: (uid: string) => void;
  isLiked: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onLike, isLiked }) => {
  const { user: currentUser } = useFirebase();
  const [showBio, setShowBio] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);
  const whatsappUrl = `https://wa.me/${user.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent("Hi, I saw your profile on Jolie Connect 😊")}`;

  const handleReport = async () => {
    if (!currentUser) return;
    const reason = window.prompt("Why are you reporting this user? (e.g. Fake profile, Harassment, Inappropriate content)");
    if (!reason) return;

    setReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reporterUid: currentUser.uid,
        reportedUid: user.uid,
        reason,
        createdAt: serverTimestamp(),
      });
      alert("Thank you for your report. Our team will investigate this profile.");
    } catch (error) {
      console.error("Error reporting user:", error);
    } finally {
      setReporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 group"
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={user.photoURL || `https://picsum.photos/seed/${user.uid}/600/800`}
          alt={user.displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {user.isPremium && (
          <div className="absolute top-4 left-4 bg-amber-400 text-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-wider">Premium</span>
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={handleReport}
            disabled={reporting}
            className="bg-black/20 backdrop-blur-md text-white/80 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-90"
            title="Report User"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowBio(!showBio)}
            className={cn(
              "bg-black/20 backdrop-blur-md text-white/80 p-2 rounded-full transition-all active:scale-90",
              showBio && "bg-rose-500 text-white"
            )}
            title="Show Bio"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showBio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-x-6 bottom-24 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white text-sm leading-relaxed"
            >
              <p className="font-medium italic opacity-90">
                {user.bio || "No bio provided."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-2xl font-black tracking-tight">{user.displayName}</h3>
            <span className="text-xl font-medium opacity-90">{user.age}</span>
            {user.isVerified && (
              <div className="bg-blue-500 text-white p-0.5 rounded-full shadow-sm">
                <Check className="w-3 h-3 stroke-[4]" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium opacity-80">
            <MapPin className="w-4 h-4" />
            <span>{user.location}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex gap-3">
        <button
          onClick={() => onLike(user.uid)}
          className={cn(
            "flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
            isLiked 
              ? "bg-rose-100 text-rose-600 border-2 border-rose-200" 
              : "bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600"
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          {isLiked ? 'Liked' : 'Like'}
        </button>
        
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </motion.div>
  );
};

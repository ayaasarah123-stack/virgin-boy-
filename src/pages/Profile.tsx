import React, { useState, useEffect } from 'react';
import { useFirebase, handleFirestoreError } from '../components/FirebaseProvider';
import { db, logout, storage } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile, OperationType } from '../types';
import { Camera, MapPin, Phone, User, LogOut, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Profile: React.FC = () => {
  const { user, profile } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    age: 18,
    gender: 'male',
    location: '',
    bio: '',
    whatsappNumber: '',
    photoURL: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else if (user) {
      setFormData(prev => ({ ...prev, displayName: user.displayName || '', photoURL: user.photoURL || '' }));
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let finalPhotoURL = formData.photoURL;

      // Upload profile photo if a new one was selected
      if (profilePhotoFile) {
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, profilePhotoFile);
        finalPhotoURL = await getDownloadURL(snapshot.ref);
      }

      const userDocRef = doc(db, 'users', user.uid);
      const data = {
        ...formData,
        photoURL: finalPhotoURL,
        age: Number(formData.age) || 18,
        uid: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: profile?.createdAt || serverTimestamp(),
      };
      await setDoc(userDocRef, data, { merge: true });
      alert('Profile saved successfully!');
      setProfilePhotoFile(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        alert("File is too large. Please select a photo under 2MB.");
        return;
      }
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateProgress = () => {
    const fields = [
      formData.displayName,
      formData.age,
      formData.gender,
      formData.location,
      formData.bio,
      formData.whatsappNumber,
      formData.photoURL || profilePhotoPreview
    ];
    const filledFields = fields.filter(field => {
      if (typeof field === 'number') return field > 0;
      return field && field.toString().trim().length > 0;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-24">
      <header className="px-6 pt-12 pb-6 bg-gradient-to-b from-rose-50 to-white">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-rose-600">My Profile</h1>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img
              src={profilePhotoPreview || formData.photoURL || `https://picsum.photos/seed/${user?.uid}/400/400`}
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <label className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-xl shadow-lg border-2 border-white cursor-pointer hover:bg-rose-600 transition-colors">
            <Camera className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
          </label>
        </div>

        <div className="px-2 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Profile Completion</span>
            <span className="text-sm font-black text-rose-600">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-rose-500"
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-gray-400 font-medium">
            {progress < 100 ? "Complete your profile to get more matches!" : "Your profile is looking great!"}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Age</label>
              <input
                type="number"
                required
                min="18"
                max="100"
                value={isNaN(formData.age as number) ? '' : formData.age}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, age: isNaN(val) ? '' as any : val });
                }}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Gender</label>
              <select
                required
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                required
                value={formData.whatsappNumber}
                onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="+256 700 000 000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-rose-500 transition-all min-h-[120px]"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95",
            loading && "opacity-70 cursor-not-allowed"
          )}
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

import React from 'react';
import { Sparkles, Check, Zap, Crown, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { SeedData } from '../components/SeedData';

export const Premium: React.FC = () => {
  const benefits = [
    { title: 'Top of the List', description: 'Your profile appears first in discovery.', icon: Zap },
    { title: 'Boosted Visibility', description: 'Get up to 10x more profile views.', icon: Crown },
    { title: 'Premium Badge', description: 'Stand out with an exclusive profile badge.', icon: Sparkles },
    { title: 'Priority Support', description: 'Direct access to our help team.', icon: MessageCircle },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white px-6 pt-12 pb-24">
      <header className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-amber-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100"
        >
          <Sparkles className="w-10 h-10 text-white fill-current" />
        </motion.div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900 mb-2">Go Premium</h1>
        <p className="text-gray-500 font-medium">Connect faster, stand out more.</p>
      </header>

      <div className="space-y-6 mb-12">
        {benefits.map((benefit, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <benefit.icon className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{benefit.title}</h3>
              <p className="text-sm text-gray-500 leading-tight">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-amber-200">
        <div className="text-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Limited Offer</span>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className="text-4xl font-black">10,000</span>
            <span className="text-xl font-bold opacity-90">UGX</span>
            <span className="text-sm font-medium opacity-70 ml-1">/ month</span>
          </div>
        </div>

        <button
          onClick={() => alert("To upgrade, please send 10,000 UGX to +256 700 000 000 via Mobile Money with your name as reference. Your account will be activated within 24 hours.")}
          className="w-full bg-white text-amber-600 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-amber-50 transition-all active:scale-95"
        >
          Upgrade Now
        </button>
        
        <p className="text-[10px] text-center mt-4 opacity-70 font-medium">
          Manual verification required. No automatic billing.
        </p>
      </div>

      <SeedData />
    </div>
  );
};

import { useState } from 'react';
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc, serverTimestamp, updateDoc } from '../lib/firebase';
import { motion } from 'motion/react';
import { Smartphone, LogIn, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: user.email === 'souzagames8080@gmail.com' ? 'admin' : 'user',
          status: 'active',
          plan: user.email === 'souzagames8080@gmail.com' ? 'pro' : 'free',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', user.uid), newUser);
      } else if (user.email === 'souzagames8080@gmail.com') {
        // Ensure the owner is always admin even if doc existed
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'admin',
          plan: 'pro'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#064e3b] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="p-10 text-center bg-gradient-to-b from-emerald-50 to-white">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200">
              <Smartphone className="text-white w-10 h-10" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Turbo<span className="text-emerald-500">Zap</span></h1>
          <p className="text-slate-500 mt-3 font-medium uppercase text-[10px] tracking-widest font-black">Disparos em Massa Profissionais</p>
        </div>

        <div className="p-10 space-y-6">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center mb-4">
            <p className="text-emerald-800 text-sm font-bold">ACESSO EXCLUSIVO WHATSAPP</p>
            <p className="text-emerald-600 text-xs">Conecte via QR Code e comece a vender.</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-slate-800 font-bold rounded-2xl transition-all flex items-center justify-center gap-4 shadow-sm hover:shadow-xl group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                <span className="text-lg">Entrar com o Google</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Painel 100% focado em <br />
            <span className="text-emerald-600">Automação de WhatsApp</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

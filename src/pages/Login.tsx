import { useState } from 'react';
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc, serverTimestamp, updateDoc } from '../lib/firebase';
import { motion } from 'motion/react';
import { Zap, LogIn, Facebook, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2" />
      <div className="absolute inset-0 bg-emerald-600/5 blur-[120px] rounded-full -translate-x-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] rounded-[3rem] shadow-2xl p-1 pb-1 flex flex-col border border-white/5"
      >
        <div className="bg-[#1a1a1a] p-12 rounded-[2.8rem] text-center space-y-8">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 group relative overflow-hidden">
               <Zap className="text-white w-12 h-12 fill-white relative z-10" />
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Social<br/><span className="text-blue-500">Turbo Pro</span></h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] italic leading-tight">Painel de Automação Facebook</p>
          </div>

          <div className="space-y-4 pt-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-6 bg-white hover:bg-blue-50 text-slate-900 font-black rounded-3xl transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                  <span className="text-lg italic uppercase tracking-tighter">Entrar com o Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3 justify-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic pt-4">
               <ShieldCheck size={14} className="text-blue-600" /> Sistema Seguro & Verificado
            </div>
          </div>
        </div>

        <div className="p-8 text-center bg-[#111] rounded-b-[2.8rem]">
           <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.25em] leading-relaxed">
             Conecte via Extensão Master <br />
             Para captura instantânea de perfis
           </p>
        </div>
      </motion.div>
    </div>
  );
}

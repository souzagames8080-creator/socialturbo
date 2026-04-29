/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, db, doc, onSnapshot, updateDoc } from './lib/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import FacebookGroups from './pages/FacebookGroups';
import FacebookJoin from './pages/FacebookJoin';
import ExtensionInfo from './pages/ExtensionInfo';
import ProPlan from './pages/ProPlan';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import { UserProfile } from './types';
import { AlertOctagon, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as UserProfile;
        
        // Auto promote owner if needed without requiring logout
        if (user.email === 'souzagames8080@gmail.com' && (data.role !== 'admin' || data.plan !== 'pro' || data.status === 'blocked')) {
           updateDoc(docSnapshot.ref, { 
             role: 'admin', 
             plan: 'pro',
             status: 'active',
             expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year for owner
           });
        }
        
        setProfile(data);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-black italic text-3xl animate-pulse">
        SOCIALTURBO...
      </div>
    );
  }

  // Se estiver logado mas bloqueado
  if (user && profile?.status === 'blocked') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">ACESSO SUSPENSO</h2>
          <p className="text-slate-500 mb-8 font-medium">Sua mensalidade venceu ou sua conta foi desativada pelo administrador. Entre em contato para regularizar.</p>
          <button 
            onClick={() => auth.signOut()}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        <Route element={user ? <Layout profile={profile} /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/facebook-groups" element={<FacebookGroups />} />
          <Route path="/facebook-join" element={<FacebookJoin />} />
          <Route path="/extension" element={<ExtensionInfo />} />
          <Route path="/pro" element={<ProPlan />} />
          <Route path="/history" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin Only Route */}
          {profile?.role === 'admin' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

import { Outlet, Link, useLocation } from 'react-router-dom';
import { auth, signOut } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Smartphone,
  Shield,
  MessageSquare,
  Plus,
  Zap,
  Download
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface LayoutProps {
  profile: UserProfile | null;
}

export default function Layout({ profile }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => signOut(auth);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { path: '/facebook-groups', icon: Users, label: 'Postar nos Grupos' },
    { path: '/facebook-join', icon: Plus, label: 'Entrar nos Grupos' },
    { path: '/extension', icon: Download, label: 'Instalar Extensão' },
    { path: '/pro', icon: Zap, label: 'Plano Pro' },
    { path: '/history', icon: History, label: 'Relatórios' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Shield, label: 'Painel Admin' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-40">
        <div className="p-8 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-100">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="font-black text-slate-800 text-xl italic tracking-tighter uppercase">Social<span className="text-blue-600">Turbo</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm",
                location.pathname === item.path
                   ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100" 
                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-4 shrink-0 bg-white">
          {profile && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-xl shadow-sm" />
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-800 truncate">{profile.displayName}</p>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest truncate">{profile.plan === 'pro' ? 'PRO VIP' : 'FREE'}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm uppercase italic tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-0 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="font-black text-slate-800 uppercase italic tracking-tighter">Social<span className="text-blue-600">Turbo</span></span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet context={{ profile }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 md:hidden flex flex-col font-sans"
            >
              {/* Mobile Sidebar Content */}
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white w-6 h-6 fill-white" />
                  </div>
                  <span className="font-black text-slate-800 text-lg uppercase tracking-tight italic tracking-tighter">Social<span className="text-blue-600">Turbo</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold",
                      location.pathname === item.path
                        ? "bg-blue-50 text-blue-600 border border-blue-100" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-slate-500 font-bold hover:text-red-500 uppercase italic tracking-widest text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Sair do Sistema
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

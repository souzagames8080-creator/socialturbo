import { useState, useEffect } from 'react';
import { db, collection, getDocs, doc, updateDoc, query, orderBy } from '../lib/firebase';
import { UserProfile } from '../types';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Shield, 
  ShieldAlert, 
  Calendar, 
  CreditCard,
  Trash2,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserProfile);
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        status: newStatus,
        updatedAt: new Date()
      });
      setUsers(users.map(u => u.uid === user.uid ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert("Erro ao alterar status do usuário");
    }
  };

  const changePlan = async (user: UserProfile, plan: 'free' | 'basic' | 'pro') => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        plan,
        updatedAt: new Date()
      });
      setUsers(users.map(u => u.uid === user.uid ? { ...u, plan } : u));
    } catch (error) {
      alert("Erro ao alterar plano do usuário");
    }
  };

  const extendSubscription = async (user: UserProfile, days: number) => {
    const currentExpiry = user.expiresAt ? (user.expiresAt.toDate ? user.expiresAt.toDate() : new Date(user.expiresAt)) : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        expiresAt: newExpiry,
        updatedAt: new Date()
      });
      setUsers(users.map(u => u.uid === user.uid ? { ...u, expiresAt: newExpiry } : u));
    } catch (error) {
      alert("Erro ao estender assinatura");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'Nunca';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic italic">GERENCIAR <span className="text-blue-600">CLIENTES</span></h2>
          <p className="text-slate-500 font-medium">Controle de assinaturas e status dos usuários</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 text-sm shadow-sm"
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw className={cn("w-5 h-5 text-slate-600", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      <div id="users-table-container" className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="admin-users-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expira em</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                            <Users className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user.displayName || 'Usuário'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-600 font-medium">{user.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span 
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border",
                        user.status === 'active' 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                      )}
                    >
                      {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={user.plan}
                      onChange={(e) => changePlan(user, e.target.value as any)}
                      className={cn(
                        "text-[10px] font-black uppercase px-2 py-1 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none",
                        user.plan === 'pro' ? "bg-purple-50 text-purple-600 border-purple-100" :
                        user.plan === 'basic' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Premium</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-bold text-slate-600 italic">{formatDate(user.expiresAt)}</span>
                       <button 
                        onClick={() => extendSubscription(user, 30)}
                        className="p-1 hover:bg-emerald-50 text-emerald-500 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Adicionar 30 dias"
                       >
                         <CreditCard className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={cn(
                          "p-2 rounded-xl transition-all shadow-sm border",
                          user.status === 'active'
                            ? "bg-white text-red-500 border-red-100 hover:bg-red-50"
                            : "bg-white text-emerald-500 border-emerald-100 hover:bg-emerald-50"
                        )}
                        title={user.status === 'active' ? 'Bloquear Cliente' : 'Ativar Cliente'}
                      >
                        {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && !loading && (
            <div className="p-20 text-center text-slate-400 uppercase font-black tracking-widest opacity-20">
               Nenhum cliente encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

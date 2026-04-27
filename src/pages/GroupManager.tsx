import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search,
  Upload,
  Download,
  AlertCircle,
  X
} from 'lucide-react';
import { auth, db, collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from '../lib/firebase';
import { FBGroup } from '../types';
import { cn } from '../lib/utils';

export default function GroupManager() {
  const [groups, setGroups] = useState<FBGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupsText, setNewGroupsText] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, `users/${auth.currentUser.uid}/groups`));
      const snapshot = await getDocs(q);
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FBGroup));
      setGroups(fetchedGroups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroups = async () => {
    if (!newGroupsText.trim()) return;
    const lines = newGroupsText.split('\n');
    setLoading(true);
    
    try {
      for (const line of lines) {
        const [id, ...rest] = line.trim().split('|');
        if (id) {
          await addDoc(collection(db, `users/${auth.currentUser?.uid}/groups`), {
            userId: auth.currentUser?.uid,
            fbGroupId: id,
            name: rest.join('|') || `Grupo ${id}`,
            createdAt: serverTimestamp(),
          });
        }
      }
      setNewGroupsText('');
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      alert('Erro ao adicionar grupos');
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Deseja realmente excluir este grupo?')) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/groups`, id));
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Grupos de Divulgação</h2>
          <p className="text-slate-500">Importe e gerencie seus grupos para o Facebook Turbo</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 transition-all"
          >
            <Plus className="w-5 h-5" />
            Importar Grupos
          </button>
          <button onClick={fetchGroups} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <RefreshCw className={cn("w-5 h-5 text-slate-600", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <button className="flex items-center gap-1 hover:text-orange-500">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button className="flex items-center gap-1 hover:text-orange-500">
              <Upload className="w-4 h-4" /> Importar JSON
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Grupo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID do Facebook</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Membros</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-[10px]">
                        {group.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] inline-block">{group.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{group.fbGroupId}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {group.memberCount ? group.memberCount.toLocaleString() : '---'}
                  </td>
                  <td className="px-6 py-4 text-right overflow-hidden whitespace-nowrap">
                    <button 
                      onClick={() => deleteGroup(group.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhum grupo encontrado. Clique em "Importar Grupos" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Import */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Importação em Massa</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Formato: <strong>ID_DO_GRUPO | NOME_OPCIONAL</strong> (Um por linha)
                  <br />
                  Exemplo: 123456789 | Grupo das Melhores Vendas
                </p>
              </div>
              <textarea 
                value={newGroupsText}
                onChange={(e) => setNewGroupsText(e.target.value)}
                placeholder="1000000001 | Grupo 1&#10;1000000002 | Grupo 2"
                className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm leading-relaxed"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddGroups}
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:bg-slate-300"
                >
                  {loading ? 'Adicionando...' : 'Importar Agora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

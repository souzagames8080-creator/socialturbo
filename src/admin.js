import { 
    auth, db, 
    signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut,
    collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDocs, getDoc, setDoc, writeBatch 
} from "./firebase.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const tableBody = document.getElementById('admin-table-body');

const statArrecadado = document.getElementById('stat-arrecadado');
const statPagos = document.getElementById('stat-pagos');
const statReservados = document.getElementById('stat-reservados');
const statDisponiveis = document.getElementById('stat-disponiveis');

let RIFA_TOTAL = 100;
let RIFA_VALOR = 20.00;
let paidParticipants = [];

const generatePdfBtn = document.getElementById('generate-pdf-btn');
const resetRifaBtn = document.getElementById('reset-rifa-btn');
const configForm = document.getElementById('config-form');
const cfgNome = document.getElementById('cfg-nome');
const cfgValor = document.getElementById('cfg-valor');
const cfgTotal = document.getElementById('cfg-total');
const cfgDesc = document.getElementById('cfg-desc');
const cfgLogo = document.getElementById('cfg-logo');
const cfgFlyer = document.getElementById('cfg-flyer');
const cfgCor = document.getElementById('cfg-cor');
const cfgCorText = document.getElementById('cfg-cor-text');
const cfgWhatsapp = document.getElementById('cfg-whatsapp');
const cfgMetodo = document.getElementById('cfg-metodo');
const cfgDataSorteio = document.getElementById('cfg-data-sorteio');
const cfgPremio1 = document.getElementById('cfg-premio1');
const cfgPremio2 = document.getElementById('cfg-premio2');
const cfgPremio3 = document.getElementById('cfg-premio3');
const cfgGanhador1 = document.getElementById('cfg-ganhador1');
const cfgGanhador2 = document.getElementById('cfg-ganhador2');
const cfgGanhador3 = document.getElementById('cfg-ganhador3');
const cfgSlug = document.getElementById('cfg-slug');
const cfgGrupo = document.getElementById('cfg-grupo');
const cfgSuporte = document.getElementById('cfg-suporte');
const cfgShowLive = document.getElementById('cfg-show-live');
const cfgLiveUrl = document.getElementById('cfg-live-url');
const liveUrlContainer = document.getElementById('live-url-container');

// Multi-Rifa Globals
let CURRENT_RIFA_ID = null;
const rifasListContainer = document.getElementById('rifas-list-container');
const rifasGrid = document.getElementById('rifas-grid');
const manageRifaContainer = document.getElementById('manage-rifa-container');
const editingRifaNameDisplay = document.getElementById('editing-rifa-name');
const editingRifaSlugDisplay = document.getElementById('editing-rifa-slug-display');

// Toggle live URL container
cfgShowLive.onchange = () => {
    liveUrlContainer.classList.toggle('hidden', !cfgShowLive.checked);
};

// Sync Color inputs
cfgCor.oninput = () => cfgCorText.value = cfgCor.value.toUpperCase();
cfgCorText.oninput = () => {
    if(/^#[0-9A-F]{6}$/i.test(cfgCorText.value)) {
        cfgCor.value = cfgCorText.value;
    }
};

// Load Config
let configUnsubscribe = null;
let currentNumbersUnsubscribe = null;

const toggleAuthBtn = document.getElementById('toggle-auth');
const signupFields = document.getElementById('signup-fields');
const submitAuthBtn = document.getElementById('submit-auth-btn');
const regNome = document.getElementById('reg-nome');

let isRegistering = false;

toggleAuthBtn.onclick = () => {
    isRegistering = !isRegistering;
    if (isRegistering) {
        signupFields.classList.remove('hidden');
        submitAuthBtn.innerText = 'CRIAR MINHA CONTA';
        toggleAuthBtn.innerText = 'Já tem conta? Entre aqui';
        document.querySelector('#login-screen h1').innerText = 'NOVO CADASTRO';
    } else {
        signupFields.classList.add('hidden');
        submitAuthBtn.innerText = 'ENTRAR NO PAINEL';
        toggleAuthBtn.innerText = 'Não tem conta? Cadastre-se';
        document.querySelector('#login-screen h1').innerText = 'PAINEL ADMIN';
    }
};

// Master Admin Logic
const masterAdminSection = document.getElementById('master-admin-section');
const masterUsersList = document.getElementById('master-users-list');
const clientDashboardSection = document.getElementById('client-dashboard-section');

function initMasterDashboard() {
    const isMaster = auth.currentUser.email === 'souzagames8080@gmail.com';
    
    if (isMaster) {
        masterAdminSection.classList.remove('hidden');
        clientDashboardSection.classList.add('hidden'); // Oculta o editor do próprio master
        document.querySelector('h1').innerText = 'RIFA ONLINE PRO';
        
        onSnapshot(collection(db, 'rifas'), (snapshot) => {
            let html = '';
            const now = Date.now();
            snapshot.forEach(docSnap => {
                if (docSnap.id === auth.currentUser.uid) return; // Não listar a si mesmo se tiver rifa
                
                const data = docSnap.data();
                const id = docSnap.id;
                const expiraEm = data.expiraEm ? data.expiraEm.toDate().getTime() : 0;
                const isExpired = expiraEm < now;
                const status = data.status || 'ativo';
                
                html += `
                    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <td class="px-10 py-6">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full ${status === 'bloqueado' ? 'bg-red-500' : (isExpired ? 'bg-yellow-500' : 'bg-green-500')}"></div>
                                <div>
                                    <div class="font-black text-slate-900 uppercase italic text-sm">${data.nome || 'Sem Nome'}</div>
                                    <div class="text-[10px] text-slate-400 font-mono">${id}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-10 py-6 text-slate-600 font-bold text-xs">${data.whatsappAdmin || 'Não informado'}</td>
                        <td class="px-10 py-6">
                            <div class="text-xs font-black ${isExpired ? 'text-red-500' : 'text-slate-900'}">${new Date(expiraEm).toLocaleDateString('pt-BR')}</div>
                            <div class="text-[9px] uppercase font-bold text-slate-400">${isExpired ? 'VENCIDO' : 'EM DIA'}</div>
                        </td>
                        <td class="px-10 py-6 text-right">
                            <div class="flex justify-end gap-2">
                                <button onclick="masterRenew('${id}')" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-blue-700 transition-all">+30 DIAS</button>
                                <button onclick="masterToggleBlock('${id}', '${status}')" class="${status === 'bloqueado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all">
                                    ${status === 'bloqueado' ? 'DESBLOQUEAR' : 'BLOQUEAR'}
                                </button>
                                <button onclick="masterDelete('${id}')" class="bg-red-50 text-red-500 px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">EXCLUIR</button>
                                <a href="/?u=${id}" target="_blank" class="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all flex items-center">VER</a>
                            </div>
                        </td>
                    </tr>
                `;
            });
            masterUsersList.innerHTML = html;
        });
    } else {
        masterAdminSection.classList.add('hidden');
        clientDashboardSection.classList.remove('hidden');
    }
}

// Master Action Functions
window.masterRenew = async (uid) => {
    try {
        const docRef = doc(db, 'rifas', uid);
        const rifaDoc = await getDoc(docRef);
        const data = rifaDoc.data();
        
        let currentExp = Date.now();
        if (data.expiraEm) {
            currentExp = data.expiraEm.toDate ? data.expiraEm.toDate().getTime() : new Date(data.expiraEm).getTime();
        }
        
        const newExp = new Date(Math.max(Date.now(), currentExp) + (30 * 24 * 60 * 60 * 1000));
        await updateDoc(docRef, { expiraEm: newExp, status: 'ativo' });
        alert("Assinatura renovada por 30 dias!");
    } catch (e) { 
        console.error(e);
        alert("Erro ao renovar: " + e.message); 
    }
};

window.masterToggleBlock = async (uid, currentStatus) => {
    try {
        await updateDoc(doc(db, 'rifas', uid), { status: currentStatus === 'bloqueado' ? 'ativo' : 'bloqueado' });
    } catch (e) { alert("Erro: " + e.message); }
};

window.masterDelete = async (uid) => {
    if (!confirm("⚠️ EXCLUIR CLIENTE? Isso apagará a rifa e todos os números PERMANENTEMENTE.")) return;
    try {
        await deleteDoc(doc(db, 'rifas', uid));
        alert("Cliente excluído.");
    } catch (e) { alert("Erro: " + e.message); }
};

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        document.body.style.background = '#f8fafc'; 
        
        // Generate My Link (UID) - Initial
        const myLinkInput = document.getElementById('my-link');
        const viewRifaBtn = document.getElementById('view-rifa-btn');
        const baseUrl = window.location.origin;
        
        let initialLink = `${baseUrl}/?u=${user.uid}`;
        if (myLinkInput) myLinkInput.value = initialLink;
        if (viewRifaBtn) {
            viewRifaBtn.href = initialLink;
            viewRifaBtn.classList.remove('hidden');
        }

        initMasterDashboard();
        loadUserRifas(user.uid);
    } else {
        loginScreen.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        document.body.style.background = 'radial-gradient(circle at top right, #0f172a, #020617)';
    }
});

// Copy Link
window.copyLink = () => {
    const linkInput = document.getElementById('my-link');
    linkInput.select();
    document.execCommand('copy');
    alert("Link copiado com sucesso! Divulgue para seus clientes.");
};

// Render Table Function
function renderTable(snapshot) {
    let pagos = 0;
    let reservados = 0;
    let html = '';
    const now = Date.now();
    paidParticipants = [];

    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const id = docSnap.id;
        
        if (data.status === 'reservado' && data.timestamp_reserva) {
             const reservaDate = data.timestamp_reserva.toDate ? data.timestamp_reserva.toDate().getTime() : now;
             reservados++;
        } else if (data.status === 'pago') {
            pagos++;
            let numLabel = String(data.numero).padStart(2, '0');
            if (RIFA_TOTAL === 100 && data.numero === 100) numLabel = "00";
            
            paidParticipants.push({
                numero: numLabel,
                nome: data.nome,
                whatsapp: data.whatsapp
            });
        }

        let numLabel = String(data.numero).padStart(2, '0');
        if (RIFA_TOTAL === 100 && data.numero === 100) numLabel = "00";

        html += `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 md:px-10 py-4 md:py-6 text-center md:text-left">
                    <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-black text-xs">${numLabel}</span>
                </td>
                <td class="px-4 md:px-10 py-4 md:py-6">
                    <span class="text-slate-900 uppercase italic tracking-tighter">${data.nome}</span>
                </td>
                <td class="px-4 md:px-10 py-4 md:py-6">
                    <a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}" target="_blank" class="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span class="hidden sm:inline">${data.whatsapp}</span>
                    </a>
                </td>
                <td class="px-4 md:px-10 py-4 md:py-6">
                    <span class="px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest italic ${data.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                        ${data.status}
                    </span>
                </td>
                <td class="px-4 md:px-10 py-4 md:py-6 text-right">
                    <div class="flex justify-end gap-2 md:gap-3">
                        ${data.status === 'reservado' ? `
                            <button onclick="confirmarPagamento('${id}')" title="Confirmar Pagamento" class="bg-green-50 text-green-600 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="md:w-4 md:h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                        ` : ''}
                        <button onclick="cancelarReserva('${id}')" title="Remover / Cancelar" class="bg-red-50 text-red-400 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="md:w-4 md:h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    statArrecadado.innerText = `R$ ${(pagos * RIFA_VALOR).toFixed(2).replace('.', ',')}`;
    statPagos.innerText = String(pagos).padStart(2, '0');
    statReservados.innerText = String(reservados).padStart(2, '0');
    statDisponiveis.innerText = String(RIFA_TOTAL - pagos - reservados).padStart(2, '0');
}

// Multi-Rifa Core Logic
window.loadUserRifas = (uid) => {
    const q = query(collection(db, 'rifas'), orderBy('nome'));
    onSnapshot(q, (snapshot) => {
        let html = '';
        let count = 0;
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.ownerId === uid) {
                count++;
                const id = docSnap.id;
                html += `
                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col gap-4 group hover:border-blue-500 transition-all">
                        <div class="flex justify-between items-start">
                            <div class="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl overflow-hidden shadow-inner">
                                <img src="${data.logoUrl || 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png'}" class="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all shadow-sm">
                            </div>
                            <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase italic tracking-widest">${data.status || 'Ativo'}</span>
                        </div>
                        <div>
                            <h3 class="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-none">${data.nome || 'Rifa Sem Nome'}</h3>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">${data.totalNumeros} Números</p>
                        </div>
                        <div class="grid grid-cols-2 gap-2 mt-2">
                            <button onclick="manageRifa('${id}')" class="bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                GERENCIAR
                            </button>
                            <a href="/?u=${data.slug || id}" target="_blank" class="bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-[9px] uppercase italic tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                VISITAR
                            </a>
                        </div>
                    </div>
                `;
            }
        });
        rifasGrid.innerHTML = html || `
            <div class="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <p class="text-slate-400 font-black uppercase tracking-[0.2em] text-sm italic">Nenhuma rifa encontrada</p>
                <button onclick="createNewRifa()" class="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Criar Primeira Rifa</button>
            </div>
        `;
    });
};

window.createNewRifa = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const name = prompt("Nome da Campanha:");
    if (!name) return;
    try {
        const newRef = doc(collection(db, 'rifas'));
        const expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + 30);
        await setDoc(newRef, {
            nome: name,
            valor: 20,
            totalNumeros: 100,
            descricao: "Participe!",
            corDestaque: "#2563eb",
            status: 'ativo',
            expiraEm: expiraEm,
            ownerId: user.uid,
            timestamp: new Date()
        });
        manageRifa(newRef.id);
    } catch (e) { alert("Erro ao criar: " + e.message); }
};

window.manageRifa = (rifaId) => {
    CURRENT_RIFA_ID = rifaId;
    rifasListContainer.classList.add('hidden');
    manageRifaContainer.classList.remove('hidden');
    if (configUnsubscribe) configUnsubscribe();
    configUnsubscribe = onSnapshot(doc(db, 'rifas', rifaId), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            RIFA_VALOR = Number(data.valor) || 20;
            RIFA_TOTAL = Number(data.totalNumeros) || 100;
            editingRifaNameDisplay.innerText = data.nome || "Ajustar";
            editingRifaSlugDisplay.innerText = data.slug || rifaId;
            cfgNome.value = data.nome || "";
            cfgValor.value = data.valor || "";
            cfgTotal.value = data.totalNumeros || 100;
            cfgDesc.value = data.descricao || "";
            cfgSlug.value = data.slug || "";
            cfgGrupo.value = data.linkGrupo || "";
            cfgSuporte.value = data.whatsappSuporte || "";
            cfgLogo.value = data.logoUrl || "";
            cfgFlyer.value = data.flyerUrl || "";
            cfgCor.value = data.corDestaque || "#2563EB";
            cfgWhatsapp.value = data.whatsappAdmin || "";
            cfgMetodo.value = data.metodoSorteio || "loteria";
            cfgDataSorteio.value = data.dataSorteio || "";
            cfgPremio1.value = data.premio1 || "";
            cfgGanhador1.value = data.ganhador1 || "";
            cfgShowLive.checked = data.showLive || false;
            cfgLiveUrl.value = data.liveUrl || "";
            document.getElementById('my-link').value = `${window.location.origin}/?u=${data.slug || rifaId}`;
        }
    });

    if (currentNumbersUnsubscribe) currentNumbersUnsubscribe();
    const q = query(collection(db, 'rifas', rifaId, 'numeros'), orderBy('numero', 'asc'));
    currentNumbersUnsubscribe = onSnapshot(q, (snapshot) => renderTable(snapshot));
};

window.backToRifasList = () => {
    CURRENT_RIFA_ID = null;
    rifasListContainer.classList.remove('hidden');
    manageRifaContainer.classList.add('hidden');
    if (configUnsubscribe) configUnsubscribe();
    if (currentNumbersUnsubscribe) currentNumbersUnsubscribe();
};

// Update remaining functions to use CURRENT_RIFA_ID
configForm.onsubmit = async (e) => {
    e.preventDefault();
    if(!CURRENT_RIFA_ID) return;
    try {
        await updateDoc(doc(db, 'rifas', CURRENT_RIFA_ID), {
            nome: cfgNome.value || "Minha Rifa",
            valor: Number(cfgValor.value) || 20,
            totalNumeros: Number(cfgTotal.value) || 100,
            descricao: cfgDesc.value || "Participe!",
            linkGrupo: cfgGrupo.value || "",
            whatsappSuporte: cfgSuporte.value || "",
            slug: cfgSlug.value.trim().toLowerCase().replace(/\s+/g, '-') || "",
            logoUrl: cfgLogo.value || "",
            flyerUrl: cfgFlyer.value || "",
            corDestaque: cfgCor.value || "#2563eb",
            whatsappAdmin: cfgWhatsapp.value || "",
            metodoSorteio: cfgMetodo.value || "loteria",
            dataSorteio: cfgDataSorteio.value || "",
            premio1: cfgPremio1.value || "",
            ganhador1: cfgGanhador1.value || "",
            showLive: cfgShowLive.checked,
            liveUrl: cfgLiveUrl.value || ""
        });
        alert("Salvo com sucesso!");
    } catch (e) { alert("Erro: " + e.message); }
};

window.confirmarPagamento = (id) => {
    if(!CURRENT_RIFA_ID) return;
    updateDoc(doc(db, 'rifas', CURRENT_RIFA_ID, 'numeros', id), { status: 'pago' });
};
window.cancelarReserva = (id) => {
    if(!CURRENT_RIFA_ID) return;
    deleteDoc(doc(db, 'rifas', CURRENT_RIFA_ID, 'numeros', id));
};
resetRifaBtn.onclick = async () => {
    if(!CURRENT_RIFA_ID || !confirm("Limpar todos os números desta rifa?")) return;
    try {
        const snapshot = await getDocs(collection(db, 'rifas', CURRENT_RIFA_ID, 'numeros'));
        const batch = writeBatch(db);
        snapshot.forEach(d => batch.delete(d.ref));
        await batch.commit();
        alert("Rifa resetada!");
    } catch (e) { alert("Erro: " + e.message); }
};


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

const RIFA_TOTAL = 100;
let RIFA_VALOR = 20.00;
let paidParticipants = [];

const generatePdfBtn = document.getElementById('generate-pdf-btn');
const resetRifaBtn = document.getElementById('reset-rifa-btn');
const configForm = document.getElementById('config-form');
const cfgNome = document.getElementById('cfg-nome');
const cfgValor = document.getElementById('cfg-valor');
const cfgDesc = document.getElementById('cfg-desc');
const cfgLogo = document.getElementById('cfg-logo');
const cfgCor = document.getElementById('cfg-cor');
const cfgCorText = document.getElementById('cfg-cor-text');
const cfgWhatsapp = document.getElementById('cfg-whatsapp');
const cfgMetodo = document.getElementById('cfg-metodo');
const cfgDataSorteio = document.getElementById('cfg-data-sorteio');
const cfgGanhadorOficial = document.getElementById('cfg-ganhador-oficial');

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
        const docSnap = await getDocs(query(collection(db, 'rifas'))); // Simple way for AI context
        const rifaDoc = await getDoc(docRef);
        const currentExp = rifaDoc.data().expiraEm ? rifaDoc.data().expiraEm.toDate().getTime() : Date.now();
        const newExp = new Date(Math.max(Date.now(), currentExp) + (30 * 24 * 60 * 60 * 1000));
        await updateDoc(docRef, { expiraEm: newExp, status: 'ativo' });
        alert("Assinatura renovada por 30 dias!");
    } catch (e) { alert("Erro: " + e.message); }
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
        
        // Generate My Link
        const myLinkInput = document.getElementById('my-link');
        const viewRifaBtn = document.getElementById('view-rifa-btn');
        const baseUrl = window.location.origin;
        const fullLink = `${baseUrl}/?u=${user.uid}`;
        
        if (myLinkInput) myLinkInput.value = fullLink;
        if (viewRifaBtn) {
            viewRifaBtn.href = fullLink;
            viewRifaBtn.classList.remove('hidden');
        }

        initMasterDashboard();

        // Listen to User Specific Rifa Config
        if (configUnsubscribe) configUnsubscribe();
        configUnsubscribe = onSnapshot(doc(db, 'rifas', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Check if blocked or expired (not for master admin)
                if (user.email !== 'souzagames8080@gmail.com') {
                    const now = Date.now();
                    const expiraEm = data.expiraEm ? data.expiraEm.toDate().getTime() : 0;
                    if (data.status === 'bloqueado' || expiraEm < now) {
                        alert("⚠️ SUA CONTA ESTÁ BLOQUEADA OU VENCIDA. Entre em contato com o suporte.");
                        signOut(auth);
                        return;
                    }
                }

                RIFA_VALOR = Number(data.valor) || 20;
                cfgNome.value = data.nome || "";
                cfgValor.value = data.valor || "";
                cfgDesc.value = data.descricao || "";
                cfgLogo.value = data.logoUrl || "";
                cfgCor.value = data.corDestaque || "#2563EB";
                cfgCorText.value = (data.corDestaque || "#2563EB").toUpperCase();
                cfgWhatsapp.value = data.whatsappAdmin || "";
                cfgMetodo.value = data.metodoSorteio || "loteria";
                cfgDataSorteio.value = data.dataSorteio || "";
                cfgGanhadorOficial.value = data.ganhadorOficial || "";
            }
        });

        // Listen to User Specific Numbers
        if (currentNumbersUnsubscribe) currentNumbersUnsubscribe();
        const q = query(collection(db, 'rifas', user.uid, 'numeros'), orderBy('numero', 'asc'));
        currentNumbersUnsubscribe = onSnapshot(q, (snapshot) => {
            renderTable(snapshot);
        });

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
            paidParticipants.push({
                numero: String(data.numero).padStart(2, '0'),
                nome: data.nome,
                whatsapp: data.whatsapp
            });
        }

        html += `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-10 py-6">
                    <div class="flex items-center gap-4">
                        <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-black text-xs">${String(data.numero).padStart(2, '0')}</span>
                        <span class="text-slate-900 uppercase italic tracking-tighter">${data.nome}</span>
                    </div>
                </td>
                <td class="px-10 py-6">
                    <a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}" target="_blank" class="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        ${data.whatsapp}
                    </a>
                </td>
                <td class="px-10 py-6">
                    <span class="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic ${data.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                        ${data.status}
                    </span>
                </td>
                <td class="px-10 py-6 text-right">
                    <div class="flex justify-end gap-3">
                        ${data.status === 'reservado' ? `
                            <button onclick="confirmarPagamento('${id}')" title="Confirmar Pagamento" class="bg-green-50 text-green-600 p-3 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                        ` : ''}
                        <button onclick="cancelarReserva('${id}')" title="Remover / Cancelar" class="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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

// Save Config
configForm.onsubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if(!user) return;
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Sessão expirada. Por favor, faça login novamente.");
            return;
        }
        await setDoc(doc(db, 'rifas', user.uid), {
            nome: cfgNome.value || "Minha Rifa",
            valor: Number(cfgValor.value) || 20,
            descricao: cfgDesc.value || "Participe!",
            logoUrl: cfgLogo.value || "",
            corDestaque: cfgCor.value || "#2563eb",
            whatsappAdmin: cfgWhatsapp.value || "",
            metodoSorteio: cfgMetodo.value || "loteria",
            dataSorteio: cfgDataSorteio.value || "",
            ganhadorOficial: cfgGanhadorOficial.value || "",
            ownerId: user.uid
        });
        alert("Configurações salvas com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar config:", error);
        if (error.message.includes('permission')) {
            alert("Erro de permissão: Tente sair e entrar novamente no painel.");
        } else {
            alert("Erro ao salvar: " + error.message);
        }
    }
};

// Login / Register
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        if (isRegistering) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // 30 days from now
            const expiraEm = new Date();
            expiraEm.setDate(expiraEm.getDate() + 30);

            // Create initial empty rifa config for the new user
            await setDoc(doc(db, 'rifas', user.uid), {
                nome: regNome.value || "Minha Rifa",
                valor: 20,
                descricao: "Participe da minha rifa!",
                corDestaque: "#2563eb",
                whatsappAdmin: "",
                status: 'ativo',
                expiraEm: expiraEm,
                ownerId: user.uid
            });
            alert("Conta criada com sucesso! Você tem 30 dias de acesso grátis.");
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        alert("Erro na autenticação: " + error.message);
    }
};

// Logout
logoutBtn.onclick = () => signOut(auth);

// Auto Cleanup Expired
setInterval(async () => {
    const user = auth.currentUser;
    if(!user) return;

    try {
        const q = query(collection(db, 'rifas', user.uid, 'numeros'));
        const snapshot = await getDocs(q);
        const now = Date.now();
        snapshot.forEach(async (docSnap) => {
            const data = docSnap.data();
            if (data.status === 'reservado' && data.timestamp_reserva) {
                const reservaDate = data.timestamp_reserva.toDate ? data.timestamp_reserva.toDate().getTime() : now;
                if (now - reservaDate > 15 * 60 * 1000) {
                    console.log(`Limpando reserva expirada: ${data.numero}`);
                    await deleteDoc(doc(db, 'rifas', user.uid, 'numeros', docSnap.id));
                }
            }
        });
    } catch (error) {
        console.error("Erro no cleanup:", error);
    }
}, 60000); // Check every minute

// PDF Generation Logic
generatePdfBtn.onclick = () => {
    console.log("Iniciando geração de PDF...");
    if (paidParticipants.length === 0) {
        alert("Nenhum pagamento confirmado para gerar o relatório.");
        return;
    }

    try {
        const doc = new jsPDF();
        const title = cfgNome.value || "Rifa Online Pro";
        
        doc.setFontSize(18);
        doc.text(`Lista de Participantes Confirmados`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Rifa: ${title}`, 14, 30);
        doc.text(`Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 38);
        
        const tableData = paidParticipants.map(p => [p.numero, p.nome, p.whatsapp]);
        const totalArrecadado = (paidParticipants.length * RIFA_VALOR).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        autoTable(doc, {
            head: [['Nº', 'Nome do Cliente', 'WhatsApp']],
            body: tableData,
            foot: [['', 'TOTAL ARRECADADO', totalArrecadado]],
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            footStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 5 }
        });
        
        doc.save(`participantes-pagos-${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
        console.log("PDF gerado com sucesso.");
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Falha ao gerar PDF. Verifique o console para mais detalhes.");
    }
};

// Reset Logic
resetRifaBtn.onclick = async () => {
    const user = auth.currentUser;
    if(!user) return;
    
    if (!confirm("⚠️ ATENÇÃO: Isso apagará TODOS os números reservados e pagos desta rifa. Tem certeza?")) {
        return;
    }

    try {
        const q = query(collection(db, 'rifas', user.uid, 'numeros'));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.forEach((docSnap) => {
            batch.delete(docSnap.ref);
        });

        await batch.commit();
        alert("Rifa resetada com sucesso!");
    } catch (error) {
        console.error("Erro ao resetar rifa:", error);
        alert("Erro ao resetar: " + error.message);
    }
};

// Global functions for buttons
window.confirmarPagamento = (id) => {
    const user = auth.currentUser;
    if(!user) return;
    updateDoc(doc(db, 'rifas', user.uid, 'numeros', id), { status: 'pago' });
};
window.cancelarReserva = (id) => {
    const user = auth.currentUser;
    if(!user) return;
    deleteDoc(doc(db, 'rifas', user.uid, 'numeros', id));
};

import { 
    auth, db, 
    signInWithEmailAndPassword, onAuthStateChanged, signOut,
    collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDocs, setDoc, writeBatch 
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

// Sync Color inputs
cfgCor.oninput = () => cfgCorText.value = cfgCor.value.toUpperCase();
cfgCorText.oninput = () => {
    if(/^#[0-9A-F]{6}$/i.test(cfgCorText.value)) {
        cfgCor.value = cfgCorText.value;
    }
};

// Load Config
onSnapshot(doc(db, 'config', 'geral'), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        RIFA_VALOR = Number(data.valor) || 20;
        cfgNome.value = data.nome || "";
        cfgValor.value = data.valor || "";
        cfgDesc.value = data.descricao || "";
        cfgLogo.value = data.logoUrl || "";
        cfgCor.value = data.corDestaque || "#2563EB";
        cfgCorText.value = (data.corDestaque || "#2563EB").toUpperCase();
        cfgWhatsapp.value = data.whatsappAdmin || "";
    } else {
        console.log("Configuração inicial não encontrada. O administrador pode criar uma clicando em salvar.");
    }
}, (error) => {
    console.error("Erro ao carregar configurações:", error);
});

// Save Config
configForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
        await setDoc(doc(db, 'config', 'geral'), {
            nome: cfgNome.value,
            valor: Number(cfgValor.value),
            descricao: cfgDesc.value,
            logoUrl: cfgLogo.value,
            corDestaque: cfgCor.value || "#2563eb",
            whatsappAdmin: cfgWhatsapp.value
        });
        alert("Configurações salvas com sucesso!");
    } catch (error) {
        alert("Erro ao salvar: " + error.message);
    }
};

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        document.body.style.background = '#f8fafc'; // Fundo claro para o admin facilitar leitura
        loadData();
    } else {
        loginScreen.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        document.body.style.background = 'radial-gradient(circle at top right, #0f172a, #020617)';
    }
});

// Login
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Acesso negado: " + error.message);
    }
};

// Logout
logoutBtn.onclick = () => signOut(auth);

// Load and Listen Data
function loadData() {
    const q = query(collection(db, 'rifa_numeros'), orderBy('numero', 'asc'));
    
    onSnapshot(q, (snapshot) => {
        let pagos = 0;
        let reservados = 0;
        let html = '';
        const now = Date.now();
        paidParticipants = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Check for expired reservations if you want to clean them up in real-time or just visual
            if (data.status === 'reservado' && data.timestamp_reserva) {
                 const reservaDate = data.timestamp_reserva.toDate ? data.timestamp_reserva.toDate().getTime() : now;
                 if (now - reservaDate > 15 * 60 * 1000) {
                     // Poderiamos auto-limpar aqui
                     // deleteDoc(doc(db, 'rifa_numeros', id));
                     // return;
                 }
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
        
        // Update Stats
        statArrecadado.innerText = `R$ ${(pagos * RIFA_VALOR).toFixed(2).replace('.', ',')}`;
        statPagos.innerText = String(pagos).padStart(2, '0');
        statReservados.innerText = String(reservados).padStart(2, '0');
        statDisponiveis.innerText = String(RIFA_TOTAL - pagos - reservados).padStart(2, '0');
    });
}

// Auto Cleanup Expired
setInterval(async () => {
    const q = query(collection(db, 'rifa_numeros'));
    const snapshot = await getDocs(q);
    const now = Date.now();
    snapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.status === 'reservado' && data.timestamp_reserva) {
            const reservaDate = data.timestamp_reserva.toDate ? data.timestamp_reserva.toDate().getTime() : now;
            if (now - reservaDate > 15 * 60 * 1000) {
                console.log(`Limpando reserva expirada: ${data.numero}`);
                await deleteDoc(doc(db, 'rifa_numeros', docSnap.id));
            }
        }
    });
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
    if (!confirm("⚠️ ATENÇÃO: Isso apagará TODOS os números reservados e pagos. Tem certeza que deseja resetar a rifa?")) {
        return;
    }

    try {
        const q = query(collection(db, 'rifa_numeros'));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.forEach((docSnap) => {
            batch.delete(docSnap.ref);
        });

        await batch.commit();
        alert("Rifa resetada com sucesso! Todos os números estão disponíveis novamente.");
    } catch (error) {
        console.error("Erro ao resetar rifa:", error);
        alert("Erro ao resetar: " + error.message);
    }
};

// Global functions for buttons
window.confirmarPagamento = (id) => updateDoc(doc(db, 'rifa_numeros', id), { status: 'pago' });
window.cancelarReserva = (id) => deleteDoc(doc(db, 'rifa_numeros', id));

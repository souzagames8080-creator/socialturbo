import { db, collection, doc, setDoc, onSnapshot, serverTimestamp } from "./firebase.js";

const grid = document.getElementById('numeros-grid');
const modal = document.getElementById('reserva-modal');
const form = document.getElementById('reserva-form');
const displayNum = document.getElementById('num-selecionado-display');
const rifaNome = document.getElementById('rifa-nome');
const rifaDesc = document.getElementById('rifa-descricao');
const rifaValor = document.getElementById('rifa-valor');

let selectedNumber = null;
let occupiedNumbers = {}; 
let RIFA_INFO = { nome: "Carregando...", descricao: "Aguarde...", valor: 0, logoUrl: "" };

// Ouvir Configurações dinâmicas
onSnapshot(doc(db, 'config', 'geral'), (docSnap) => {
    if (docSnap.exists()) {
        RIFA_INFO = docSnap.data();
        rifaNome.innerText = RIFA_INFO.nome;
        rifaDesc.innerText = RIFA_INFO.descricao;
        rifaValor.innerText = Number(RIFA_INFO.valor).toFixed(2).replace('.', ',');
        if (RIFA_INFO.logoUrl) {
            document.getElementById('rifa-logo').src = RIFA_INFO.logoUrl;
        }
        if (RIFA_INFO.corDestaque) {
            document.documentElement.style.setProperty('--accent-color', RIFA_INFO.corDestaque);
            // Apply to specific backgrounds that aren't just CSS variables
            const badge = document.querySelector('.bg-blue-600');
            if (badge) badge.style.backgroundColor = RIFA_INFO.corDestaque;
            const btn = document.querySelector('button[type="submit"]');
            if (btn) btn.style.backgroundColor = RIFA_INFO.corDestaque;
        }
    }
});

const RIFA_TOTAL = 100;

// Gerar Grid Inicial
function renderGrid() {
    grid.innerHTML = '';
    for (let i = 1; i <= RIFA_TOTAL; i++) {
        const status = occupiedNumbers[i] || 'disponivel';
        const card = document.createElement('div');
        card.className = `num-card status-${status}`;
        card.innerText = String(i).padStart(2, '0');
        
        if (status === 'disponivel') {
            card.onclick = () => openModal(i);
        }
        
        grid.appendChild(card);
    }
}

// Ouvir mudanças no Firestore
let initialLoad = true;
onSnapshot(collection(db, 'rifa_numeros'), (snapshot) => {
    occupiedNumbers = {};
    const now = Date.now();
    
    snapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.status === 'reservado' && data.timestamp_reserva) {
            const reservaDate = data.timestamp_reserva.toDate ? data.timestamp_reserva.toDate().getTime() : now;
            if (now - reservaDate > 15 * 60 * 1000) {
                return;
            }
        }
        
        occupiedNumbers[data.numero] = data.status;
    });
    
    renderGrid();
    if (initialLoad) {
        document.body.classList.add('loaded');
        initialLoad = false;
    }
});

function openModal(num) {
    selectedNumber = num;
    displayNum.innerText = String(num).padStart(3, '0');
    modal.classList.add('active');
}

window.closeModal = () => {
    modal.classList.remove('active');
    form.reset();
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const whatsapp = document.getElementById('whatsapp').value;

    try {
        const numId = String(selectedNumber);
        await setDoc(doc(db, 'rifa_numeros', numId), {
            numero: selectedNumber,
            nome,
            whatsapp,
            status: 'reservado',
            timestamp_reserva: serverTimestamp()
        });

        // Gerar link do WhatsApp
        const msg = window.encodeURIComponent(`Olá! Gostaria de reservar o número ${selectedNumber} da rifa ${RIFA_INFO.nome}. Meu nome é ${nome}.`);
        const phone = "5585992908713"; 
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
        
        window.open(whatsappUrl, '_blank');
        closeModal();
    } catch (error) {
        console.error("Erro ao reservar:", error);
        alert("Ops! Algo deu errado. Tente novamente.");
    }
};

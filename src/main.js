import { auth, db, onAuthStateChanged, doc, onSnapshot, collection, setDoc, serverTimestamp } from "./firebase.js";

const grid = document.getElementById('numeros-grid');
const modal = document.getElementById('reserva-modal');
const form = document.getElementById('reserva-form');
const displayNum = document.getElementById('num-selecionado-display');
const rifaNome = document.getElementById('rifa-nome');
const rifaDesc = document.getElementById('rifa-descricao');
const rifaValor = document.getElementById('rifa-valor');

let selectedNumber = null;
// Identificar qual rifa carregar (SaaS)
const urlParams = new URLSearchParams(window.location.search);
const USER_ID = urlParams.get('u'); // Ex: ?u=UID_DO_CLIENTE

// Auto-redirecionar se estiver logado e sem ID no link
onAuthStateChanged(auth, (user) => {
    if (user && !USER_ID) {
        window.location.href = `/?u=${user.uid}`;
    }
});

let occupiedNumbers = {}; 
let RIFA_INFO = { nome: "Carregando...", descricao: "Aguarde...", valor: 0, logoUrl: "" };

// Ouvir Configurações dinâmicas
if (USER_ID) {
    // Render grid immediately with 100 slots while loading occupied numbers
    renderGrid();

    onSnapshot(doc(db, 'rifas', USER_ID), (docSnap) => {
        if (docSnap.exists()) {
            RIFA_INFO = docSnap.data();
            rifaNome.innerText = RIFA_INFO.nome || "Rifa Online";
            rifaDesc.innerText = RIFA_INFO.descricao || "Participe já!";
            rifaValor.innerText = Number(RIFA_INFO.valor || 0).toFixed(2).replace('.', ',');
            if (RIFA_INFO.logoUrl) {
                document.getElementById('rifa-logo').src = RIFA_INFO.logoUrl;
            }
            if (RIFA_INFO.corDestaque) {
                document.documentElement.style.setProperty('--accent-color', RIFA_INFO.corDestaque);
                const badge = document.querySelector('.bg-blue-600');
                if (badge) badge.style.backgroundColor = RIFA_INFO.corDestaque;
            }
        } else {
            rifaNome.innerText = "Rifa não configurada";
            rifaDesc.innerText = "O administrador ainda não configurou esta rifa.";
        }
    }, (err) => {
        console.error("Erro config snapshot:", err);
        rifaNome.innerText = "Erro ao carregar";
    });
} else {
    rifaNome.innerText = "Bem-vindo ao Social Turbo";
    rifaDesc.innerText = "Crie sua própria rifa no painel administrativo.";
    renderGrid();
}

const RIFA_TOTAL = 100;

// Gerar Grid Inicial
function renderGrid() {
    grid.innerHTML = '';
    
    if (!USER_ID) {
        grid.innerHTML = `<div class='col-span-full py-20 text-center opacity-50 font-bold'>COLE O LINK COMPLETO DA SUA RIFA</div>`;
        return;
    }

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
if (USER_ID) {
    onSnapshot(collection(db, 'rifas', USER_ID, 'numeros'), (snapshot) => {
        occupiedNumbers = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.numero) {
                occupiedNumbers[data.numero] = data.status;
            }
        });
        
        renderGrid();
        if (initialLoad) {
            document.body.classList.add('loaded');
            initialLoad = false;
        }
    }, (err) => {
        console.error("Erro numeros snapshot:", err);
    });
}


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
        await setDoc(doc(db, 'rifas', USER_ID, 'numeros', numId), {
            numero: selectedNumber,
            nome,
            whatsapp,
            status: 'reservado',
            timestamp_reserva: serverTimestamp()
        });

        // Gerar link do WhatsApp
        const msg = window.encodeURIComponent(`Olá! Gostaria de reservar o número ${selectedNumber} da rifa ${RIFA_INFO.nome}. Meu nome é ${nome}.`);
        const phone = RIFA_INFO.whatsappAdmin || "5585992908713"; 
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
        
        window.open(whatsappUrl, '_blank');
        closeModal();
    } catch (error) {
        console.error("Erro ao reservar:", error);
        alert("Ops! Algo deu errado. Tente novamente.");
    }
};

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

// Redirecionar para login caso acesse a raiz sem rifa
if (!USER_ID) {
    window.location.href = "/admin.html";
}

// Auto-redirecionar se estiver logado e sem ID no link em cache
onAuthStateChanged(auth, (user) => {
    if (user && !USER_ID) {
        window.location.href = `/?u=${user.uid}`;
    }
});

let occupiedNumbers = {}; 
const RIFA_TOTAL = 100;
let RIFA_VALOR = 0;
let RIFA_INFO = { nome: "Carregando...", descricao: "Aguarde...", valor: 0, logoUrl: "" };
let countdownInterval = null;
let allParticipants = [];

// Gerar Grid Inicial
function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';
    
    if (!USER_ID) {
        grid.innerHTML = `<div class='col-span-full py-20 text-center opacity-50 font-bold uppercase tracking-widest italic'>Aguardando link do administrador...</div>`;
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

let initialLoad = true;
// Configurações e Listeners
if (USER_ID) {
    // Ouvir Configurações
    onSnapshot(doc(db, 'rifas', USER_ID), (docSnap) => {
        if (docSnap.exists()) {
            RIFA_INFO = docSnap.data();

            // Verificação de Bloqueio/Vencimento
            const now = Date.now();
            const expiraEm = RIFA_INFO.expiraEm ? RIFA_INFO.expiraEm.toDate().getTime() : 0;
            if (RIFA_INFO.status === 'bloqueado' || expiraEm < now) {
                rifaNome.innerText = "RIFA SUSPENSA";
                rifaDesc.innerText = "Esta rifa não está mais aceitando participações.";
                grid.innerHTML = "<div class='col-span-full py-20 text-center opacity-50 font-black uppercase italic'>ESTA PÁGINA FOI DESATIVADA PELO ADMINISTRADOR</div>";
                return;
            }

            RIFA_VALOR = Number(RIFA_INFO.valor || 0);
            rifaNome.innerText = RIFA_INFO.nome || "Rifa Online";
            rifaDesc.innerText = RIFA_INFO.descricao || "Participe já!";
            rifaValor.innerText = RIFA_VALOR.toFixed(2).replace('.', ',');
            
            if (RIFA_INFO.logoUrl) {
                document.getElementById('rifa-logo').src = RIFA_INFO.logoUrl;
            }

            // --- NOVO: Contagem Regressiva ---
            initCountdown(RIFA_INFO.dataSorteio, RIFA_INFO.metodoSorteio);

            // --- NOVO: Ganhador ---
            checkWinner(RIFA_INFO);
            
            if (RIFA_INFO.corDestaque) {
                document.documentElement.style.setProperty('--accent-color', RIFA_INFO.corDestaque);
                const badge = document.querySelector('.bg-blue-600');
                if (badge) badge.style.backgroundColor = RIFA_INFO.corDestaque;
            }
            renderGrid();
        } else {
            rifaNome.innerText = "Rifa não encontrada";
            rifaDesc.innerText = "Verifique se o link está correto.";
            renderGrid();
        }
    });

    // Ouvir Números
    onSnapshot(collection(db, 'rifas', USER_ID, 'numeros'), (snapshot) => {
        occupiedNumbers = {};
        allParticipants = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.numero) {
                occupiedNumbers[data.numero] = data.status;
                if (data.status === 'pago') {
                    allParticipants.push(data);
                }
            }
        });
        renderGrid();
        
        // Re-checar ganhador se a lista de participantes mudar
        if (RIFA_INFO) {
            checkWinner(RIFA_INFO);
        }

        if (initialLoad) {
            document.body.classList.add('loaded');
            initialLoad = false;
        }
    });
} else {
    document.body.classList.add('loaded');
    renderGrid();
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

// ========================
// 🎯 NOVAS FUNÇÕES (CONTADOR/GANHADOR)
// ========================

function initCountdown(targetDateStr, metodo) {
    const container = document.getElementById('countdown-container');
    const drawDateDisplay = document.getElementById('draw-date-formatted');
    const drawMethodDesc = document.getElementById('draw-method-desc');
    
    if (!targetDateStr) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    drawDateDisplay.innerText = formatarData(targetDateStr);
    
    if (metodo === 'loteria') {
        drawMethodDesc.innerText = "Sorteio baseado na Loteria Federal";
        document.getElementById('draw-info').innerText = "SORTEIO PELA LOTERIA FEDERAL";
    } else {
        drawMethodDesc.innerText = "Sorteio Manual (Acompanhe ao vivo)";
        document.getElementById('draw-info').innerText = "SORTEIO EM BREVE";
    }

    if (countdownInterval) clearInterval(countdownInterval);
    
    const targetDate = new Date(targetDateStr).getTime();

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('draw-info').innerText = "SORTEIO EM ANDAMENTO OU FINALIZADO";
            document.querySelectorAll('.timer-num').forEach(el => el.innerText = '00');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }, 1000);
}

function checkWinner(data) {
    const banner = document.getElementById('winner-banner');
    const winners = [
        { num: data.ganhador1, premio: data.premio1, id: 1 },
        { num: data.ganhador2, premio: data.premio2, id: 2 },
        { num: data.ganhador3, premio: data.premio3, id: 3 }
    ];

    let foundAny = false;

    winners.forEach(w => {
        const card = document.getElementById(`winner${w.id}-card`);
        const nameEl = document.getElementById(`winner${w.id}-name`);
        const numEl = document.getElementById(`winner${w.id}-number`);
        const waEl = document.getElementById(`winner${w.id}-whatsapp`);
        const premioEl = document.getElementById(`winner${w.id}-premio`);

        if (w.num) {
            const winner = allParticipants.find(p => String(p.numero) === String(w.num));
            if (winner) {
                card.classList.remove('hidden');
                nameEl.innerText = winner.nome;
                numEl.innerText = `Nº ${String(winner.numero).padStart(2, '0')}`;
                waEl.innerText = mascararWhatsapp(winner.whatsapp);
                premioEl.innerText = w.premio || "PRÊMIO SURPRESA";
                foundAny = true;
            } else {
                card.classList.add('hidden');
            }
        } else {
            card.classList.add('hidden');
        }
    });

    if (foundAny) {
        banner.classList.remove('hidden');
        // Ocultar contador se já temos ganhadores oficiais
        document.getElementById('countdown-container').classList.add('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

function formatarData(dataStr) {
    if (!dataStr) return "";
    const [date, time] = dataStr.split('T');
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y} às ${time}`;
}

function mascararWhatsapp(tel) {
    if (!tel) return "";
    const limpo = tel.replace(/\D/g, '');
    if (limpo.length < 8) return tel;
    const inicio = limpo.substring(0, 2);
    const meio = "*****";
    const fim = limpo.substring(limpo.length - 3);
    return `${inicio}${meio}${fim}`;
}

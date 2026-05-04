import { 
    auth, db, onAuthStateChanged, 
    doc, onSnapshot, collection, setDoc, serverTimestamp,
    query, where, getDocs, getDoc
} from "./firebase.js";

const grid = document.getElementById('numeros-grid');
const modal = document.getElementById('reserva-modal');
const form = document.getElementById('reserva-form');
const displayNum = document.getElementById('num-selecionado-display');
const rifaNome = document.getElementById('rifa-nome');
const rifaDesc = document.getElementById('rifa-descricao');
const rifaValor = document.getElementById('rifa-valor');

let selectedNumbers = [];
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
let RIFA_TOTAL = 100;
let RIFA_VALOR = 0;
let RIFA_INFO = { nome: "Carregando...", descricao: "Aguarde...", valor: 0, logoUrl: "" };
let countdownInterval = null;
let allParticipants = [];
let ACTUAL_UID = null;

// Funções de Inicialização Reativa
function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';
    
    if (!USER_ID) {
        grid.innerHTML = `<div class='col-span-full py-20 text-center opacity-50 font-bold uppercase tracking-widest italic'>Aguardando link do administrador...</div>`;
        return;
    }

    const totalToRender = Number(RIFA_INFO.totalNumeros) || 100;
    
    for (let i = 1; i <= totalToRender; i++) {
        const status = occupiedNumbers[i] || 'disponivel';
        const card = document.createElement('div');
        card.className = `num-card status-${status}`;
        
        let label = String(i).padStart(2, '0');
        if (totalToRender === 100 && i === 100) {
            label = "00";
        }
        
        card.innerText = label;
        
        if (status === 'disponivel') {
            const isSelected = selectedNumbers.includes(i);
            if (isSelected) card.classList.add('selected');
            card.onclick = () => toggleSelection(i);
        }
        
        grid.appendChild(card);
    }
}

function toggleSelection(num) {
    const index = selectedNumbers.indexOf(num);
    if (index > -1) {
        selectedNumbers.splice(index, 1);
    } else {
        selectedNumbers.push(num);
    }
    
    updateSelectionBar();
    renderGrid();
}

function updateSelectionBar() {
    const bar = document.getElementById('selection-bar');
    const countEl = document.getElementById('selected-count');
    const totalEl = document.getElementById('selected-total');

    if (selectedNumbers.length > 0) {
        bar.classList.remove('translate-y-32');
        countEl.innerText = String(selectedNumbers.length).padStart(2, '0');
        const totalPrice = selectedNumbers.length * RIFA_VALOR;
        totalEl.innerText = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    } else {
        bar.classList.add('translate-y-32');
    }
}

window.clearSelection = () => {
    selectedNumbers = [];
    updateSelectionBar();
    renderGrid();
};

function setupListeners(uid) {
    ACTUAL_UID = uid;
    
    // Ouvir Configurações
    onSnapshot(doc(db, 'rifas', uid), (docSnap) => {
        if (docSnap.exists()) {
            RIFA_INFO = docSnap.data();

            // Verificação de Bloqueio/Vencimento
            const now = Date.now();
            const expiraEm = RIFA_INFO.expiraEm ? RIFA_INFO.expiraEm.toDate().getTime() : 0;
            if (RIFA_INFO.status === 'bloqueado' || (expiraEm > 0 && expiraEm < now)) {
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

            initCountdown(RIFA_INFO.dataSorteio, RIFA_INFO.metodoSorteio);
            checkWinner(RIFA_INFO);
            renderLiveStream(RIFA_INFO);
            
            // --- NOVO: Grupo WhatsApp ---
            const groupBanner = document.getElementById('group-banner');
            const groupLink = document.getElementById('group-link');
            if (RIFA_INFO.linkGrupo) {
                groupBanner.classList.remove('hidden');
                groupLink.href = RIFA_INFO.linkGrupo;
            } else {
                groupBanner.classList.add('hidden');
            }

            // --- NOVO: Botão de Suporte ---
            const supportBtn = document.getElementById('support-btn');
            if (RIFA_INFO.whatsappSuporte) {
                const phoneSup = RIFA_INFO.whatsappSuporte.replace(/\D/g, '');
                supportBtn.href = `https://wa.me/${phoneSup}?text=${window.encodeURIComponent("Olá, estou com uma dúvida sobre a rifa " + (RIFA_INFO.nome || ""))}`;
                supportBtn.classList.remove('hidden');
            } else {
                supportBtn.classList.add('hidden');
            }
            
            if (RIFA_INFO.corDestaque) {
                document.documentElement.style.setProperty('--accent-color', RIFA_INFO.corDestaque);
                const badge = document.querySelector('.bg-blue-600');
                if (badge) badge.style.backgroundColor = RIFA_INFO.corDestaque;
            }
            renderGrid();
        }
    });

    // Ouvir Números
    onSnapshot(collection(db, 'rifas', uid, 'numeros'), (snapshot) => {
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
        
        const totalNum = RIFA_INFO.totalNumeros || 100;
        const soldCount = Object.values(occupiedNumbers).filter(s => s === 'pago').length;
        const remainingCount = totalNum - soldCount;
        const percent = Math.round((remainingCount / totalNum) * 100);

        document.getElementById('total-rifa-num').innerText = totalNum;
        document.getElementById('sold-rifa-num').innerText = soldCount;
        document.getElementById('remaining-rifa-num').innerText = remainingCount;
        document.getElementById('remaining-percent').innerText = `${percent}%`;
        document.getElementById('progress-circle').setAttribute('stroke-dasharray', `${percent}, 100`);

        renderGrid();
        
        if (RIFA_INFO) {
            checkWinner(RIFA_INFO);
            renderLiveStream(RIFA_INFO);
        }

        if (initialLoad) {
            document.body.classList.add('loaded');
            initialLoad = false;
        }
    });
}

async function resolveRifa() {
    if (!USER_ID) {
        document.body.classList.add('loaded');
        renderGrid();
        return;
    }

    try {
        // 1. Tentar por UID direto (mais rápido)
        const docSnap = await getDoc(doc(db, 'rifas', USER_ID));
        if (docSnap.exists()) {
            setupListeners(USER_ID);
        } else {
            // 2. Tentar por Slug
            const q = query(collection(db, 'rifas'), where('slug', '==', USER_ID));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
                setupListeners(querySnap.docs[0].id);
            } else {
                rifaNome.innerText = "Rifa não encontrada";
                rifaDesc.innerText = "Verifique se o link está correto.";
                document.body.classList.add('loaded');
                renderGrid();
            }
        }
    } catch (e) {
        console.error(e);
        rifaNome.innerText = "Erro ao carregar";
        document.body.classList.add('loaded');
    }
}

// Iniciar resolução
resolveRifa();

let initialLoad = true;
// Listener redundante removido para dar lugar ao setupListeners
// (as linhas 69-158 antigas foram incorporadas acima)


window.openModal = () => {
    if (selectedNumbers.length === 0) return;
    
    const labels = selectedNumbers.map(n => {
        let l = String(n).padStart(2, '0');
        if (Number(RIFA_INFO.totalNumeros) === 100 && n === 100) l = "00";
        return l;
    }).join(', ');
    
    displayNum.innerText = labels;
    modal.classList.add('active');
}

window.closeModal = () => {
    modal.classList.remove('active');
    form.reset();
};

form.onsubmit = async (e) => {
    e.preventDefault();
    if (selectedNumbers.length === 0) return;

    const nome = document.getElementById('nome').value;
    const whatsapp = document.getElementById('whatsapp').value;

    try {
        // Reservar todos em paralelo
        const promises = selectedNumbers.map(num => {
            const numId = String(num);
            return setDoc(doc(db, 'rifas', ACTUAL_UID, 'numeros', numId), {
                numero: num,
                nome,
                whatsapp,
                status: 'reservado',
                timestamp_reserva: serverTimestamp()
            });
        });

        await Promise.all(promises);

        // Gerar link do WhatsApp com todos os números
        const numsStr = selectedNumbers.map(n => {
             let l = String(n).padStart(2, '0');
             if (Number(RIFA_INFO.totalNumeros) === 100 && n === 100) l = "00";
             return l;
        }).join(', ');

        const msgTexto = `Olá! Gostaria de reservar os números (${numsStr}) da rifa ${RIFA_INFO.nome}. Meu nome é ${nome}.`;
        const msg = window.encodeURIComponent(msgTexto);
        const phone = RIFA_INFO.whatsappAdmin || "5585992908713"; 
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Limpar tudo
        selectedNumbers = [];
        updateSelectionBar();
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
                
                let label = String(winner.numero).padStart(2, '0');
                const totalToRender = Number(RIFA_INFO.totalNumeros) || 100;
                if (totalToRender === 100 && winner.numero === 100) label = "00";
                
                numEl.innerText = `Nº ${label}`;
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

function getYouTubeID(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

function renderLiveStream(data) {
    const container = document.getElementById('live-container');
    const iframe = document.getElementById('live-iframe');

    if (data.showLive && data.liveUrl) {
        const videoId = getYouTubeID(data.liveUrl);
        if (videoId) {
            const currentSrc = iframe.src;
            const newSrc = `https://www.youtube.com/embed/${videoId}`;
            if (currentSrc !== newSrc) {
                iframe.src = newSrc;
            }
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    } else {
        container.classList.add('hidden');
        iframe.src = "";
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

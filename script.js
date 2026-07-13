const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwluLT0RgSdpgX9vwK2gvV0rbRMV7nSmbXQxex2ojLFdPQcaZKF59-P39BdVsVfUHW1/exec";

// VARIÁVEIS DE ESTADO
let teamName = "";
let currentEnigma = 1;
let xp = 100; 
let badges = [];
let currentDecision = 0;
let timerInterval;
let timeLeft = 30;

let timeStart;
let timeEnd;
let totalSeconds = 0;
let finalStatusGlobal = "";

// BANCO DE DADOS DAS DECISÕES DA TEMPORADA 2 (10 FASES)
const t2Decisions = [
    {
        title: "Fase 1: A Call Tóxica",
        context: "Discord, jogando Valorant. Alex erra uma jogada. Beto ativa o mic e dá um flame pesado: 'Mlk, tu é um lixo. Vai de arrasta pra cima, desinstala a vida.' Silêncio na call.",
        options: [
            { text: "A) Mutar o Beto e continuar focado no jogo.", xp: -20, badge: "🙈 Camper Omisso" },
            { text: "B) Mandar no chat: 'Calma aí, vcs tão muito tiltados'.", xp: 10, badge: "🏳️ Desarmador de Bomb" },
            { text: "C) Falar no mic: 'Passou do limite' e quitar da partida junto com o Alex.", xp: 50, badge: "🛡️ Tank Protetor" }
        ]
    },
    {
        title: "Fase 2: O Tribunal do TikTok",
        context: "Fizeram um edit no TikTok do Alex tirado de contexto. O vídeo está viralizando com hate. Você estava na hora e sabe que é fake news.",
        options: [
            { text: "A) Compartilhar no grupo: 'Sabia que ele era surtado kkk'.", xp: -50, badge: "🐑 NPC de Manada" },
            { text: "B) Comentar desmentindo: 'Eu tava lá, isso é fake, apaga'.", xp: 50, badge: "🔍 Sniper de Fatos" },
            { text: "C) Apenas assistir e rolar o feed.", xp: -20, badge: "👻 Lurker Fantasma" }
        ]
    },
    {
        title: "Fase 3: O Bait / Catfish",
        context: "Criaram um perfil fake de e-girl com IA para flertar com o Alex, tirar prints e explanar. Você descobre a armadilha.",
        options: [
            { text: "A) Mandar DM pro Alex: 'Mano, é bait. Dá block e reporta.'", xp: 50, badge: "🚑 Healer Tático" },
            { text: "B) Xingar no grupo: 'Bando de fracassados sem vida fazendo fake.'", xp: -10, badge: "🔥 DPS Tóxico" },
            { text: "C) Mandar emoji de pipoca 🍿 e esperar o circo pegar fogo.", xp: -40, badge: "🍿 Espectador Vip" }
        ]
    },
    {
        title: "Fase 4: O Vazamento",
        context: "Beto ameaça: 'Se o Alex não me passar a cola na prova, vou vazar no X os prints dele chorando'.",
        options: [
            { text: "A) Avisar o Alex para passar a cola e evitar o PvP.", xp: -30, badge: "🩹 Patch Temporário" },
            { text: "B) Printar a ameaça e mandar direto para o sistema da escola (Coordenação).", xp: 50, badge: "⚖️ Anti-Cheat" },
            { text: "C) Mandar: 'Vish, quero nem ver o resultado disso'.", xp: -20, badge: "🤷 Noob Cúmplice" }
        ]
    },
    {
        title: "Fase 5: O Tier List",
        context: "Fizeram um site de Tier List da sala. Colocaram o Alex no tier 'Lixo/NPC'. A galera tá votando em massa.",
        options: [
            { text: "A) Fazer sua lista e colocar o Beto no Lixo também.", xp: -50, badge: "🪃 Counter-Strike Tóxico" },
            { text: "B) Fechar o link e ignorar a votação.", xp: -20, badge: "🥷 Stealth Inútil" },
            { text: "C) Denunciar o site e avisar que criar ranking humilhante dá processo.", xp: 50, badge: "🛠️ Admin da Razão" }
        ]
    },
    {
        title: "Fase 6: O Ratio",
        context: "Alex tenta se defender no Twitter/X, mas leva 'ratio' do Beto. A tropa do Beto tá massacrando o Alex nas replies.",
        options: [
            { text: "A) Dar like no post do Alex para dar um buff silencioso.", xp: 10, badge: "👍 Suporte Passivo" },
            { text: "B) Mandar um meme humilhando o Beto na thread.", xp: -20, badge: "🤡 Troll Caótico" },
            { text: "C) Chamar o Alex na DM, dizer pra trancar a conta e ajudar a printar as ofensas.", xp: 50, badge: "🛡️ Paladino de Dados" }
        ]
    },
    {
        title: "Fase 7: A Foto Vazada",
        context: "Tiraram foto do Alex chorando no banheiro e virou figurinha no WhatsApp. O flood de figurinhas começou.",
        options: [
            { text: "A) Salvar a figurinha no inventário, mas não usar.", xp: -30, badge: "🗑️ Looter de Lixo" },
            { text: "B) Mandar no grupo: 'Apaga isso, o mlk tá mal de verdade, passou do limite.'", xp: 50, badge: "⚔️ Vanguard" },
            { text: "C) Sair do grupo sem falar nada.", xp: -10, badge: "🏃 Rage Quit Covarde" }
        ]
    },
    {
        title: "Fase 8: O Interrogatório (Aula Online)",
        context: "Professor nota o sumiço do Alex e pergunta no meet: 'Alguém sabe dele?'. Chat em silêncio absoluto.",
        options: [
            { text: "A) Mandar DM pro professor dedurando o cyberbullying.", xp: 50, badge: "📡 Informante VIP" },
            { text: "B) Abrir o mic e berrar acusando o Beto na frente de todos.", xp: -10, badge: "💣 Kamikaze" },
            { text: "C) Fingir que foi pegar água e deixar outro responder.", xp: -30, badge: "💤 AFK (Away From Keyboard)" }
        ]
    },
    {
        title: "Fase 9: O Efeito Bumerangue",
        context: "O Beto notou que você não dá apoio. Fez um sticker seu: 'Fiscal de Cringe / Beta'. O grupo foca em você agora.",
        options: [
            { text: "A) Tiltar. Entrar no grupo e xingar o Beto ofendendo a aparência dele.", xp: -50, badge: "🤬 Griefer" },
            { text: "B) Mandar 'lacrou' e silenciar o grupo.", xp: 10, badge: "🧊 Escudo de Gelo" },
            { text: "C) Tirar print, sair do grupo e reportar formalmente pra escola.", xp: 50, badge: "🔨 Ban Hammer" }
        ]
    },
    {
        title: "Fase 10: A Quest Final (O Gank)",
        context: "Beto avisa: 'Amanhã na saída vamos cercar o Alex e gravar a reação dele, vai render muito view. Todo mundo lá.'",
        options: [
            { text: "A) Ir junto só pra olhar o PvP de perto, sem gravar.", xp: -50, badge: "👀 Espectador de Gank" },
            { text: "B) Faltar na escola (dar dodge) pra não se envolver.", xp: -30, badge: "💨 Main Dodge" },
            { text: "C) Avisar a diretoria urgente para interceptar a ameaça física.", xp: 50, badge: "👑 Game Master (GM)" }
        ]
    }
];

// NAVEGAÇÃO E UI
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function nextScreen(nextId) {
    showScreen(nextId);
}

function updateXPUI(amount) {
    xp += amount;
    document.getElementById('xp-counter').innerText = xp;
    
    const animEl = document.getElementById('xp-anim');
    animEl.innerText = amount > 0 ? `+${amount}` : amount;
    animEl.style.color = amount > 0 ? "var(--success)" : "var(--error)";
    animEl.style.animation = "none";
    void animEl.offsetWidth; 
    animEl.style.animation = "floatUp 1s ease-out forwards";
}

function startGame() {
    const nameInput = document.getElementById('team-name').value.trim();
    if (nameInput === "") {
        alert("Por favor, insira o nome da Guilda.");
        return;
    }
    teamName = nameInput;
    timeStart = new Date(); 
    showScreen('screen-briefing');
}

function startEnigmas() {
    document.getElementById('status-bar').classList.remove('hidden');
    document.getElementById('xp-counter').innerText = xp;
    showScreen('screen-e1');
}

// TEMPORADA 1 (10 Enigmas)
function checkPassword(enigmaNum, correctPassword, isLast = false) {
    const inputId = `input-e${enigmaNum}`;
    const feedbackId = `feedback-e${enigmaNum}`;
    const guess = document.getElementById(inputId).value.trim().toUpperCase();

    const normalizedGuess = guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedCorrect = correctPassword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalizedGuess === normalizedCorrect || guess === "PULAR") { 
        document.getElementById(feedbackId).innerText = "Firewall Quebrado! +20 XP";
        document.getElementById(feedbackId).style.color = "var(--success)";
        updateXPUI(20);

        document.getElementById(`action-e${enigmaNum}`).classList.add('hidden');
        document.getElementById(`explanation-e${enigmaNum}`).classList.remove('hidden');

    } else {
        document.getElementById(feedbackId).innerText = "Acesso Negado. -5 XP. Tente novamente.";
        updateXPUI(-5);
    }
}

// TEMPORADA 2
function startSeason2() {
    loadDecision();
    showScreen('screen-simulator');
}

function updateStatusBarT2() {
    document.getElementById('xp-counter').innerText = xp;
    const emojis = badges.map(b => b.split(' ')[0]);
    document.getElementById('badge-container').innerText = emojis.join(' ');
}

function loadDecision() {
    if (currentDecision >= t2Decisions.length) {
        endGame();
        return;
    }

    const dec = t2Decisions[currentDecision];
    document.getElementById('sim-title').innerText = dec.title;
    document.getElementById('sim-context').innerText = dec.context;
    
    const optionsContainer = document.getElementById('sim-options');
    optionsContainer.innerHTML = "";

    dec.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerText = opt.text;
        btn.onclick = () => makeChoice(opt.xp, opt.badge);
        optionsContainer.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    document.getElementById('timer-fill').style.width = '100%';

    timerInterval = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / 30) * 100;
        document.getElementById('timer-fill').style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            makeChoice(-30, "⏳ AFK (Omissão por lentidão)");
        }
    }, 1000);
}

function makeChoice(xpDelta, badge) {
    clearInterval(timerInterval);
    updateXPUI(xpDelta);
    badges.push(badge);
    updateStatusBarT2();
    currentDecision++;
    loadDecision();
}

// RESULTADOS E ENVIO
function endGame() {
    timeEnd = new Date();
    totalSeconds = Math.floor((timeEnd - timeStart) / 1000); 

    document.getElementById('status-bar').style.display = 'none';
    showScreen('screen-result');

    document.getElementById('final-xp').innerText = xp;
    
    const badgesUl = document.getElementById('final-badges');
    badgesUl.innerHTML = "";
    badges.forEach(b => {
        const li = document.createElement('li');
        li.innerText = b;
        badgesUl.appendChild(li);
    });

    const titleEl = document.getElementById('final-status');
    const descEl = document.getElementById('final-desc');

    if (xp < 150) {
        titleEl.innerText = "Game Over / Conta Banida (Tóxico)";
        titleEl.style.color = "var(--error)";
        descEl.innerText = "Sua reputação foi destruída. Suas badges mostram omissão e ataques constantes. No jogo e na vida, a omissão faz de você um CÚMPLICE. O sistema não tolera contas tóxicas.";
        finalStatusGlobal = "Banido";
    } else if (xp <= 350) {
        titleEl.innerText = "Player Casual / Passivo (NPC)";
        titleEl.style.color = "var(--timer-color)";
        descEl.innerText = "Você jogou safe, evitou o PvP e ficou no muro. Cuidado: o 'Efeito Espectador' é perigoso. Ficar neutro em situações de injustiça significa escolher a facção do opressor por conveniência.";
        finalStatusGlobal = "Passivo (NPC)";
    } else {
        titleEl.innerText = "Game Master / Herói do Servidor";
        titleEl.style.color = "var(--success)";
        descEl.innerText = "Level Up! Você assumiu o aggro (risco), protegeu a party e usou o report da forma certa. Comunidades e jogos só são ambientes seguros por causa de players com a sua coragem.";
        finalStatusGlobal = "Herói (GM)";
    }
}

// CONCATENAÇÃO DO RELATÓRIO EM UMA VARIÁVEL E ENVIO
function submitFinalReport() {
    const q1 = document.getElementById('report-q1').value.trim();
    const q2 = document.getElementById('report-q2').value.trim();
    const q3 = document.getElementById('report-q3').value.trim();
    
    if (q1 === "" || q2 === "" || q3 === "") {
        alert("Por favor, a guilda precisa preencher as três respostas do relatório antes de enviar.");
        return;
    }

    // Juntando as 3 respostas para enviar para a única coluna de "Relatório" da planilha
    const combinedReport = `1. SÉRIE: ${q1} | 2. DISCUSSÕES: ${q2} | 3. AVALIAÇÃO: ${q3}`;

    const btn = document.getElementById('submit-report-btn');
    btn.innerText = "Enviando para os Servidores...";
    btn.disabled = true;

    document.getElementById('sync-message').classList.remove('hidden');

    sendDataToSheets(finalStatusGlobal, combinedReport);
}

// FUNÇÃO PARA ENVIAR AO GOOGLE SHEETS (CORRIGIDA PARA BYPASS DE CORS)
function sendDataToSheets(statusText, reportText) {
    const data = {
        equipe: teamName,
        xpFinal: xp,
        status: statusText,
        medalhas: badges.join(', '),
        tempoTotal: totalSeconds,
        relatorio: reportText 
    };

    fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors', // Fundamental para não travar no navegador
        headers: {
            // A MUDANÇA ESTÁ AQUI: Trocamos application/json por text/plain
            'Content-Type': 'text/plain;charset=utf-8' 
        },
        body: JSON.stringify(data)
    }).then(() => {
        // Como estamos em no-cors, o then é disparado assim que o dado sai do navegador
        document.getElementById('sync-message').innerText = "✅ Dados sincronizados no servidor da escola!";
        document.getElementById('sync-message').style.color = "var(--success)";
        console.log("Envio disparado para o Google.");
    }).catch(err => {
        document.getElementById('sync-message').innerText = "❌ Falha na conexão com o banco de dados principal.";
        document.getElementById('sync-message').style.color = "var(--error)";
        console.error("Erro no envio:", err);
    });
}
}

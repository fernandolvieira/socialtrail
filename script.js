// VARIÁVEIS DE ESTADO
let teamName = "";
let currentEnigma = 1;
let xp = 150;
let badges = [];
let currentDecision = 0;
let timerInterval;
let timeLeft = 30;

// URL do Web App do Google Apps Script (Você colará a sua aqui futuramente)
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwluLT0RgSdpgX9vwK2gvV0rbRMV7nSmbXQxex2ojLFdPQcaZKF59-P39BdVsVfUHW1/exec";

// BANCO DE DADOS DAS DECISÕES DA TEMPORADA 2
const t2Decisions = [
    {
        title: "Decisão 1: A Call Tóxica",
        context: "Discord, jogando Valorant. Alex erra uma jogada importante. Beto ativa o microfone e dá um flame pesado: 'Mlk, tu é um lixo. Vai de arrasta pra cima, desinstala o jogo e some.' O resto da call fica em silêncio mortal.",
        options: [
            { text: "A) Mutar o Beto (silenciar o áudio) e continuar jogando.", xp: -20, badge: "🙈 Cego Fiel" },
            { text: "B) Mandar no chat: 'Calma aí mano, vcs tão muito tiltados por causa de jogo'.", xp: 10, badge: "🏳️ Paz Frágil" },
            { text: "C) Falar no microfone: 'Passou do limite, Beto.' e quitar (sair) da partida junto com o Alex.", xp: 50, badge: "🛡️ Escudo de Prata" }
        ]
    },
    {
        title: "Decisão 2: O Tribunal do TikTok",
        context: "Fizeram um edit no TikTok com uma foto do Alex tirada de contexto na sala, parecendo que ele ofendeu o professor. O vídeo está viralizando e os comentários estão pesados. Você estava na aula e sabe que é mentira.",
        options: [
            { text: "A) Compartilhar o vídeo no grupo: 'Sabia que ele era meio surtado kkk'.", xp: -50, badge: "🐑 Efeito Manada" },
            { text: "B) Comentar no vídeo: 'Isso tá totalmente fora de contexto, eu tava lá, apaga que dá B.O.'.", xp: 50, badge: "🔍 Caçador de Fatos" },
            { text: "C) Apenas assistir, ler os comentários e rolar o feed.", xp: -20, badge: "👻 Fantasma Digital" }
        ]
    },
    {
        title: "Decisão 3: O Bait",
        context: "Criaram um perfil fake no Insta usando IA. Adicionaram o Alex e começaram a flertar para tirar prints e explanar. Você descobre o plano no WhatsApp.",
        options: [
            { text: "A) Mandar DM privada pro Alex: 'Mano, acorda, isso é bait puro. Dá block agora.'", xp: 50, badge: "🕵️ Anjo da Guarda" },
            { text: "B) Ir no grupo e xingar: 'Cês são muito fracassados fazendo fake'.", xp: -10, badge: "🔥 Incendiário" },
            { text: "C) Mandar emoji de pipoca 🍿 no grupo para ver até onde vai.", xp: -40, badge: "🍿 Espectador VIP" }
        ]
    },
    {
        title: "Decisão 4: O Vazamento",
        context: "Beto manda no grupo: 'Se o Alex não me passar a cola na prova de matemática amanhã, vou vazar no Twitter os prints dele chorando que a ex-namorada dele me mandou'.",
        options: [
            { text: "A) Avisar o Alex para ele passar a cola para evitar o vexame.", xp: -30, badge: "🩹 Curativo Rápido" },
            { text: "B) Tirar print da ameaça e mostrar para a coordenação antes da prova.", xp: 50, badge: "⚖️ Quebra-Ciclos" },
            { text: "C) Responder no grupo: 'Vish pesado, quero nem ver no que vai dar'.", xp: -20, badge: "🤷 Pilatos" }
        ]
    },
    {
        title: "Decisão 5: O Efeito Bumerangue",
        context: "O Beto percebeu que você não concorda com ele. Ele faz um sticker com seu rosto escrito 'Fiscal de Cringe 🚩 / Emocionado'. O grupo todo manda 'kkkk' rindo de você.",
        options: [
            { text: "A) Tiltar. Entrar no grupo e xingar a aparência do Beto para se defender.", xp: -50, badge: "🪃 Bumerangue Tóxico" },
            { text: "B) Dar uma resposta irônica ('Nossa, lacrou 💅') e silenciar o grupo.", xp: 10, badge: "🧊 Coração de Gelo" },
            { text: "C) Tirar print de tudo, sair do grupo e enviar para a escola/pais exigindo providências.", xp: 50, badge: "🏆 Mestre da Ética" }
        ]
    }
];

// FUNÇÕES DE NAVEGAÇÃO
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    const nameInput = document.getElementById('team-name').value.trim();
    if (nameInput === "") {
        alert("Por favor, insira o nome da equipe.");
        return;
    }
    teamName = nameInput;
    showScreen('screen-e1');
}

// LÓGICA DA TEMPORADA 1
function checkPassword(enigmaNum, correctPassword, isLast = false) {
    const inputId = `input-e${enigmaNum}`;
    const feedbackId = `feedback-e${enigmaNum}`;
    const guess = document.getElementById(inputId).value.trim().toUpperCase();

    // Normalizar texto (remover acentos)
    const normalizedGuess = guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedCorrect = correctPassword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalizedGuess === normalizedCorrect || guess === "PULAR") { 
        document.getElementById(feedbackId).innerText = "Acesso liberado.";
        document.getElementById(feedbackId).style.color = "var(--success)";
        
        setTimeout(() => {
            if (isLast) {
                showScreen('screen-transition');
            } else {
                showScreen(`screen-e${enigmaNum + 1}`);
            }
        }, 1000);
    } else {
        document.getElementById(feedbackId).innerText = "Acesso Negado. Tente novamente ou pesquise o termo correto.";
    }
}

// LÓGICA DA TEMPORADA 2
function startSeason2() {
    document.getElementById('status-bar').classList.remove('hidden');
    document.getElementById('status-bar').style.display = 'flex';
    updateStatusBar();
    loadDecision();
    showScreen('screen-simulator');
}

function updateStatusBar() {
    document.getElementById('xp-counter').innerText = xp;
    document.getElementById('badge-container').innerText = badges.map(b => b.split(' ')[0]).join(' ');
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
            makeChoice(-30, "⏳ Lento (Omissão)");
        }
    }, 1000);
}

function makeChoice(xpDelta, badge) {
    clearInterval(timerInterval);
    xp += xpDelta;
    badges.push(badge);
    updateStatusBar();
    
    currentDecision++;
    loadDecision();
}

// FINALIZAÇÃO E ENVIO DE DADOS
function endGame() {
    document.getElementById('status-bar').style.display = 'none';
    showScreen('screen-result');

    document.getElementById('final-xp').innerText = xp;
    document.getElementById('final-badges').innerText = badges.join(' | ');

    const titleEl = document.getElementById('final-status');
    const descEl = document.getElementById('final-desc');

    let statusText = "";

    if (xp <= 50) {
        titleEl.innerText = "Cancelado / Cúmplice Tóxico";
        titleEl.style.color = "var(--error)";
        descEl.innerText = "Sua reputação digital foi destruída. Suas escolhas alimentaram o cyberbullying e pioraram o ambiente. Na vida real, a omissão te faz cúmplice do agressor e a internet não perdoa.";
        statusText = "Cancelado";
    } else if (xp <= 150) {
        titleEl.innerText = "NPC da Treta / Sobrevivente Passivo";
        titleEl.style.color = "var(--timer-color)";
        descEl.innerText = "Você tentou não se queimar, desviou dos problemas e ficou em cima do muro. Mas lembre-se: o 'Efeito Espectador' é perigoso. Ficar neutro em situações de injustiça significa escolher o lado do opressor.";
        statusText = "Passivo";
    } else {
        titleEl.innerText = "Escudo Digital / Agente de Mudança";
        titleEl.style.color = "var(--success)";
        descEl.innerText = "Sua reputação subiu! Você assumiu os riscos, quebrou o efeito manada e usou as ferramentas corretas para barrar o ódio. Comunidades online seguras dependem de pessoas que têm coragem de agir assim.";
        statusText = "Agente de Mudança";
    }

    sendDataToSheets(statusText);
}

function sendDataToSheets(statusText) {
    const data = {
        equipe: teamName,
        xpFinal: xp,
        status: statusText,
        medalhas: badges.join(', ')
    };

    console.log("Dados prontos para envio:", data);

    /*
    fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(() => {
        console.log("Dados enviados com sucesso!");
    }).catch(err => {
        console.error("Erro ao enviar dados", err);
    });
    */
}

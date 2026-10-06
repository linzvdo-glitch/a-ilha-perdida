// =====================================================
// A ILHA PERDIDA
// Multiplayer com PeerJS
// =====================================================


// =====================================================
// FUNÇÃO PARA PEGAR ELEMENTOS
// =====================================================

const $ = id => document.getElementById(id);


// =====================================================
// ELEMENTOS DA INTERFACE
// =====================================================

const ui = {

    lobby: $("lobby"),
    waiting: $("waiting"),
    game: $("game"),
    ending: $("ending"),

    createBtn: $("createBtn"),
    joinBtn: $("joinBtn"),
    joinCode: $("joinCode"),

    lobbyMsg: $("lobbyMsg"),

    connection: $("connection"),

    bigCode: $("bigCode"),
    waitingText: $("waitingText"),
    playersPreview: $("playersPreview"),
    startBtn: $("startBtn"),

    gameRoom: $("gameRoom"),
    locationName: $("locationName"),
    turnName: $("turnName"),

    players: $("players"),
    inventory: $("inventory"),
    map: $("map"),
    sceneArt: $("sceneArt"),
    story: $("story"),
    choices: $("choices"),
    gameMsg: $("gameMsg"),
    clues: $("clues"),

    progressBar: $("progressBar"),
    progressText: $("progressText"),

    endingTitle: $("endingTitle"),
    endingText: $("endingText"),
    finalScores: $("finalScores"),

    playAgain: $("playAgain")
};


// =====================================================
// VARIÁVEIS DO MULTIPLAYER
// =====================================================

let peer = null;

let connection = null;

let isHost = false;

let myPlayer = 0;

let roomCode = "";


// =====================================================
// ESTADO DO JOGO
// =====================================================

let state = {

    started: false,

    finished: false,

    turn: 0,

    location: "praia",

    players: [
        {
            name: "Explorador 1",
            score: 0,
            inventory: []
        },

        {
            name: "Explorador 2",
            score: 0,
            inventory: []
        }
    ],

    clues: [],

    flags: {

        mapFound: false,

        flashlightFound: false,

        keyFound: false,

        lighthouseSolved: false,

        caveSolved: false,

        templeSolved: false,

        treasureFound: false
    }
};


// =====================================================
// LOCALIZAÇÕES
// =====================================================

const locations = {

    praia: {

        name: "Praia Perdida",

        icon: "🏖️",

        story:
            "As ondas batem suavemente na areia. " +
            "Vocês chegaram à ilha em um pequeno barco " +
            "e encontram pegadas que seguem em direção à floresta.",

        choices: [

            {
                text: "🔎 Procurar na areia",

                action: "searchBeach"
            },

            {
                text: "🌲 Ir para a floresta",

                move: "floresta"
            },

            {
                text: "⛺ Montar acampamento",

                move: "acampamento"
            }
        ]
    },


    floresta: {

        name: "Floresta Misteriosa",

        icon: "🌲",

        story:
            "As árvores são enormes e escondem quase toda a luz " +
            "do sol. Entre as folhas vocês encontram uma trilha " +
            "antiga que parece levar ao farol.",

        choices: [

            {
                text: "🧭 Procurar uma trilha",

                action: "searchForest"
            },

            {
                text: "🗼 Ir para o farol",

                move: "farol"
            },

            {
                text: "🏖️ Voltar para a praia",

                move: "praia"
            },

            {
                text: "🕳️ Procurar a caverna",

                move: "caverna"
            }
        ]
    },


    farol: {

        name: "Farol Abandonado",

        icon: "🗼",

        story:
            "O velho farol está coberto de plantas. " +
            "Na porta existe uma placa com símbolos estranhos. " +
            "Parece que alguém deixou uma pista aqui.",

        choices: [

            {
                text: "🔐 Resolver o enigma",

                action: "solveLighthouse"
            },

            {
                text: "🌲 Voltar para a floresta",

                move: "floresta"
            }
        ]
    },


    acampamento: {

        name: "Acampamento",

        icon: "⛺",

        story:
            "O acampamento é um lugar seguro para organizar " +
            "os objetos encontrados. Há uma velha mochila perto " +
            "de uma fogueira apagada.",

        choices: [

            {
                text: "🎒 Procurar na mochila",

                action: "searchCamp"
            },

            {
                text: "🏖️ Voltar para a praia",

                move: "praia"
            },

            {
                text: "🌲 Ir para a floresta",

                move: "floresta"
            }
        ]
    },


    caverna: {

        name: "Caverna Azul",

        icon: "🕳️",

        story:
            "Uma enorme abertura aparece entre as pedras. " +
            "Lá dentro existem marcas brilhantes nas paredes. " +
            "A escuridão impede vocês de enxergar o fundo.",

        choices: [

            {
                text: "🔦 Explorar a caverna",

                action: "exploreCave"
            },

            {
                text: "🌲 Voltar para a floresta",

                move: "floresta"
            },

            {
                text: "🏛️ Seguir para o templo",

                move: "templo"
            }
        ]
    },


    templo: {

        name: "Templo Antigo",

        icon: "🏛️",

        story:
            "No centro da ilha existe um templo coberto de musgo. " +
            "No chão há três símbolos: uma onda, uma árvore " +
            "e uma estrela.",

        choices: [

            {
                text: "🧩 Resolver o enigma",

                action: "solveTemple"
            },

            {
                text: "🕳️ Voltar para a caverna",

                move: "caverna"
            }
        ]
    }

};


// =====================================================
// MENSAGENS
// =====================================================

function setMessage(text) {

    ui.gameMsg.textContent = text;
}


function lobbyMessage(text) {

    ui.lobbyMsg.textContent = text;
}


// =====================================================
// TROCAR DE TELA
// =====================================================

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(element => {

            element.classList.remove("active");

        });

    screen.classList.add("active");
}


// =====================================================
// GERAR CÓDIGO DA SALA
// =====================================================

function generateRoomCode() {

    return Math
        .random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}


// =====================================================
// CRIAR PARTIDA
// =====================================================

ui.createBtn.addEventListener("click", () => {

    roomCode = generateRoomCode();

    isHost = true;

    myPlayer = 0;

    state.players[0].name = "Explorador 1";

    ui.bigCode.textContent = roomCode;

    ui.gameRoom.textContent =
        "Sala: " + roomCode;

    showScreen(ui.waiting);

    ui.connection.textContent =
        "Criando sala...";

    peer = new Peer(
        "ilha-" + roomCode
    );


    peer.on("open", () => {

        ui.connection.textContent =
            "Sala pronta! Envie o código para seu amigo.";

    });


    peer.on("connection", conn => {

        if (connection) {

            conn.close();

            return;
        }

        connection = conn;

        myPlayer = 0;

        setupConnection();

    });


    peer.on("error", error => {

        console.error(error);

        ui.connection.textContent =
            "Erro ao criar a sala.";

    });

});


// =====================================================
// ENTRAR NA PARTIDA
// =====================================================

ui.joinBtn.addEventListener("click", () => {

    const code =
        ui.joinCode.value
            .trim()
            .toUpperCase();

    if (code.length !== 6) {

        lobbyMessage(
            "Digite um código de 6 caracteres."
        );

        return;
    }

    isHost = false;

    myPlayer = 1;

    roomCode = code;

    ui.gameRoom.textContent =
        "Sala: " + roomCode;

    lobbyMessage(
        "Conectando à sala..."
    );

    peer = new Peer();


    peer.on("open", () => {

        connection =
            peer.connect(
                "ilha-" + roomCode
            );

        setupConnection();

    });


    peer.on("error", error => {

        console.error(error);

        lobbyMessage(
            "Não foi possível entrar nessa sala."
        );

    });

});


// =====================================================
// CONFIGURAR CONEXÃO
// =====================================================

function setupConnection() {

    if (!connection) return;


    connection.on("open", () => {

        ui.connection.textContent =
            "Conectado ao outro jogador!";

        ui.playersPreview.innerHTML =
            "👤 Explorador 1<br>" +
            "👤 Explorador 2";


        if (isHost) {

            ui.startBtn.disabled = false;

        } else {

            ui.startBtn.disabled = true;

            send({

                type: "requestState"

            });

        }

    });


    connection.on("data", data => {

        handleNetworkMessage(data);

    });


    connection.on("close", () => {

        ui.connection.textContent =
            "O outro jogador saiu da partida.";

        setMessage(
            "A conexão com o outro jogador foi encerrada."
        );

    });

}


// =====================================================
// ENVIAR DADOS
// =====================================================

function send(data) {

    if (
        connection &&
        connection.open
    ) {

        connection.send(data);

    }

}


// =====================================================
// RECEBER DADOS
// =====================================================

function handleNetworkMessage(data) {


    if (data.type === "requestState") {

        if (!isHost) return;

        send({

            type: "state",

            state: state

        });

        return;
    }


    if (data.type === "state") {

        state = data.state;

        updateInterface();

        if (state.started) {

            showScreen(ui.game);

        }

        if (state.finished) {

            showEnding();

        }

        return;
    }


    if (data.type === "start") {

        state.started = true;

        updateInterface();

        showScreen(ui.game);

        return;
    }

}


// =====================================================
// INICIAR JOGO
// =====================================================

ui.startBtn.addEventListener("click", () => {

    if (!isHost) return;

    if (!connection || !connection.open) {

        setMessage(
            "O outro jogador ainda não está conectado."
        );

        return;
    }


    state.started = true;

    state.turn = 0;

    updateInterface();

    showScreen(ui.game);


    send({

        type: "start"

    });


    send({

        type: "state",

        state: state

    });

});


// =====================================================
// AÇÃO DO JOGADOR
// =====================================================

function choose(choice) {

    if (state.finished) return;


    if (state.turn !== myPlayer) {

        setMessage(
            "Agora é a vez do outro explorador."
        );

        return;
    }


    if (choice.move) {

        state.location = choice.move;

        addScore(5);

        nextTurn();

        sync();

        return;
    }


    if (choice.action) {

        executeAction(
            choice.action
        );

    }

}


// =====================================================
// EXECUTAR AÇÕES
// =====================================================

function executeAction(action) {


    switch (action) {


        // ---------------------------------
        // PRAIA
        // ---------------------------------

        case "searchBeach":

            if (!state.flags.mapFound) {

                state.flags.mapFound = true;

                addItem(
                    "🗺️",
                    "Mapa antigo"
                );

                addClue(
                    "O mapa mostra um caminho escondido que leva até o templo."
                );

                addScore(20);

                setMessage(
                    "Você encontrou um mapa antigo!"
                );

            } else {

                setMessage(
                    "Vocês já procuraram por toda a areia."
                );

            }

            nextTurn();

            break;


        // ---------------------------------
        // FLORESTA
        // ---------------------------------

        case "searchForest":

            if (!state.flags.keyFound) {

                state.flags.keyFound = true;

                addItem(
                    "🗝️",
                    "Chave enferrujada"
                );

                addClue(
                    "A chave possui o mesmo símbolo encontrado na porta do farol."
                );

                addScore(20);

                setMessage(
                    "Você encontrou uma chave escondida entre as raízes!"
                );

            } else {

                setMessage(
                    "Não há mais nada importante aqui."
                );

            }

            nextTurn();

            break;


        // ---------------------------------
        // ACAMPAMENTO
        // ---------------------------------

        case "searchCamp":

            if (!state.flags.flashlightFound) {

                state.flags.flashlightFound = true;

                addItem(
                    "🔦",
                    "Lanterna"
                );

                addClue(
                    "A lanterna pode iluminar lugares muito escuros."
                );

                addScore(15);

                setMessage(
                    "Vocês encontraram uma lanterna!"
                );

            } else {

                setMessage(
                    "A mochila está vazia."
                );

            }

            nextTurn();

            break;


        // ---------------------------------
        // FAROL
        // ---------------------------------

        case "solveLighthouse":

            if (state.flags.lighthouseSolved) {

                setMessage(
                    "O enigma do farol já foi resolvido."
                );

                nextTurn();

                break;
            }


            if (!state.flags.keyFound) {

                setMessage(
                    "A porta está trancada. Vocês precisam de uma chave."
                );

                nextTurn();

                break;
            }


            state.flags.lighthouseSolved = true;

            addClue(
                "No farol vocês descobriram: 'A estrela aponta para o templo.'"
            );

            addScore(30);

            setMessage(
                "A chave abriu a porta! Vocês encontraram uma nova pista."
            );

            nextTurn();

            break;


        // ---------------------------------
        // CAVERNA
        // ---------------------------------

        case "exploreCave":

            if (!state.flags.flashlightFound) {

                setMessage(
                    "Está escuro demais. Vocês precisam de uma lanterna."
                );

                nextTurn();

                break;
            }


            if (state.flags.caveSolved) {

                setMessage(
                    "Vocês já exploraram a caverna."
                );

                nextTurn();

                break;
            }


            state.flags.caveSolved = true;

            addClue(
                "Nas paredes da caverna havia três símbolos: água, árvore e estrela."
            );

            addScore(30);

            setMessage(
                "A lanterna revelou uma passagem secreta!"
            );

            nextTurn();

            break;


        // ---------------------------------
        // TEMPLO
        // ---------------------------------

        case "solveTemple":

            if (state.flags.templeSolved) {

                setMessage(
                    "O templo já foi aberto."
                );

                nextTurn();

                break;
            }


            if (
                !state.flags.mapFound ||
                !state.flags.lighthouseSolved ||
                !state.flags.caveSolved
            ) {

                setMessage(
                    "Ainda faltam pistas para resolver o enigma."
                );

                nextTurn();

                break;
            }


            state.flags.templeSolved = true;

            addScore(50);

            addClue(
                "O templo se abriu. O tesouro está muito perto!"
            );

            setMessage(
                "Os símbolos se alinham e uma passagem secreta aparece!"
            );

            nextTurn();

            break;

    }


    checkEnding();

    sync();

}


// =====================================================
// ADICIONAR ITEM
// =====================================================

function addItem(icon, name) {

    state.players[myPlayer].inventory.push({

        icon: icon,

        name: name

    });

}


// =====================================================
// ADICIONAR PISTA
// =====================================================

function addClue(text) {

    if (!state.clues.includes(text)) {

        state.clues.push(text);

    }

}


// =====================================================
// ADICIONAR PONTOS
// =====================================================

function addScore(points) {

    state.players[myPlayer].score += points;

}


// =====================================================
// TROCAR TURNO
// =====================================================

function nextTurn() {

    state.turn =
        state.turn === 0
            ? 1
            : 0;

}


// =====================================================
// VERIFICAR FINAL
// =====================================================

function checkEnding() {

    if (
        state.flags.templeSolved &&
        !state.flags.treasureFound
    ) {

        state.flags.treasureFound = true;

        state.finished = true;

        state.players[myPlayer].score += 100;

        showEnding();

    }

}


// =====================================================
// SINCRONIZAR
// =====================================================

function sync() {

    updateInterface();

    send({

        type: "state",

        state: state

    });

}


// =====================================================
// ATUALIZAR INTERFACE
// =====================================================

function updateInterface() {

    updatePlayers();

    updateInventory();

    updateClues();

    updateMap();

    updateScene();

    updateProgress();

    updateTurn();

}


// =====================================================
// ATUALIZAR JOGADORES
// =====================================================

function updatePlayers() {

    ui.players.innerHTML = "";

    state.players.forEach(
        (player, index) => {

            const div =
                document.createElement("div");

            div.className =
                "player-card";


            if (state.turn === index) {

                div.classList.add("active");

            }


            div.innerHTML = `

                <div class="player-name">
                    ${index === 0 ? "🧭" : "🔦"}
                    ${player.name}
                </div>

                <div class="player-score">
                    ⭐ ${player.score} pontos
                </div>

            `;


            ui.players.appendChild(div);

        }
    );

}


// =====================================================
// INVENTÁRIO
// =====================================================

function updateInventory() {

    const inventory =
        state.players[myPlayer].inventory;


    if (!inventory.length) {

        ui.inventory.textContent =
            "Nenhum item encontrado.";

        return;
    }


    ui.inventory.innerHTML = "";


    inventory.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "item";

        div.innerHTML = `

            <span class="item-icon">
                ${item.icon}
            </span>

            ${item.name}

        `;

        ui.inventory.appendChild(div);

    });

}


// =====================================================
// PISTAS
// =====================================================

function updateClues() {

    if (!state.clues.length) {

        ui.clues.textContent =
            "Nenhuma pista encontrada.";

        return;
    }


    ui.clues.innerHTML = "";


    state.clues.forEach(clue => {

        const div =
            document.createElement("div");

        div.className = "clue";

        div.textContent = clue;

        ui.clues.appendChild(div);

    });

}


// =====================================================
// MAPA
// =====================================================

function updateMap() {

    document
        .querySelectorAll(".map-location")
        .forEach(button => {

            const location =
                button.dataset.location;


            button.classList.toggle(
                "current",
                location === state.location
            );

        });

}


// =====================================================
// CENA
// =====================================================

function updateScene() {

    const location =
        locations[state.location];


    if (!location) return;


    ui.locationName.textContent =
        location.name;


    ui.sceneArt.textContent =
        location.icon;


    ui.story.textContent =
        location.story;


    ui.choices.innerHTML = "";


    location.choices.forEach(choice => {

        const button =
            document.createElement("button");

        button.className =
            "choice-btn";

        button.textContent =
            choice.text;


        if (state.turn !== myPlayer) {

            button.disabled = true;

        }


        button.addEventListener(
            "click",
            () => choose(choice)
        );


        ui.choices.appendChild(button);

    });

}


// =====================================================
// TURNO
// =====================================================

function updateTurn() {

    ui.turnName.textContent =
        state.players[state.turn].name;

}


// =====================================================
// PROGRESSO
// =====================================================

function updateProgress() {

    let completed = 0;

    const total = 6;


    if (state.flags.mapFound)
        completed++;

    if (state.flags.keyFound)
        completed++;

    if (state.flags.flashlightFound)
        completed++;

    if (state.flags.lighthouseSolved)
        completed++;

    if (state.flags.caveSolved)
        completed++;

    if (state.flags.templeSolved)
        completed++;


    const percentage =
        Math.round(
            completed / total * 100
        );


    ui.progressBar.style.width =
        percentage + "%";


    ui.progressText.textContent =
        percentage + "%";

}


// =====================================================
// CLICAR NO MAPA
// =====================================================

document
    .querySelectorAll(".map-location")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (state.turn !== myPlayer) {

                    setMessage(
                        "Agora é a vez do outro jogador."
                    );

                    return;
                }


                const destination =
                    button.dataset.location;


                if (
                    destination === state.location
                ) {

                    setMessage(
                        "Vocês já estão nesse lugar."
                    );

                    return;
                }


                state.location =
                    destination;


                addScore(5);

                nextTurn();

                sync();

            }
        );

    });


// =====================================================
// FINAL
// =====================================================

function showEnding() {

    showScreen(ui.ending);


    const score1 =
        state.players[0].score;

    const score2 =
        state.players[1].score;


    if (score1 > score2) {

        ui.endingTitle.textContent =
            "🏆 Explorador 1 venceu!";

    } else if (score2 > score1) {

        ui.endingTitle.textContent =
            "🏆 Explorador 2 venceu!";

    } else {

        ui.endingTitle.textContent =
            "🤝 Empate!";

    }


    ui.endingText.textContent =
        "Vocês encontraram o tesouro perdido da ilha!";


    ui.finalScores.innerHTML = `

        <div class="score-card">

            🧭 Explorador 1

            <strong>
                ${score1} pontos
            </strong>

        </div>

        <div class="score-card">

            🔦 Explorador 2

            <strong>
                ${score2} pontos
            </strong>

        </div>

    `;

}


// =====================================================
// JOGAR NOVAMENTE
// =====================================================

ui.playAgain.addEventListener(
    "click",
    () => {

        location.reload();

    }
);


// =====================================================
// ESTADO INICIAL
// =====================================================

updateInterface();
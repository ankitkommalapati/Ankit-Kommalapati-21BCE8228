const WebSocket = require('ws');
const http = require('http');

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
const server = http.createServer();

let gameState = {
    players: [],
    board: Array(8).fill().map(() => Array(8).fill(null)), // 5x5 grid
    turn: 0
};

const broadcast = (data) => {
    try {
        console.log('Broadcasting data:', data);
        
        const message = JSON.stringify(data);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    } catch (error) {
        console.error('Failed to broadcast message due to serialization error:', error);
    }
};


wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        const messageToSend = {
            type: parsedMessage.type,
            from: parsedMessage.from,
            to: parsedMessage.to,
            character: parsedMessage.character
        };
    
        switch (parsedMessage.type) {
            case 'move':
                // Broadcasting to all user or clients
                broadcast(messageToSend);
                break;
            case 'chat':
                // Broadcast chat messages
                broadcast({
                    type: 'chat',
                    message: parsedMessage.message,
                    player: parsedMessage.player
                });
                break;
        }
    });
    ws.send(JSON.stringify({ type: 'message', content: 'Welcome to the game!' }));
});


wss.on('connection', (ws) => {
    // Add new player
    const playerIndex = gameState.players.length;
    gameState.players.push(ws);
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'initialize':
                if (playerIndex === 0) {
                    gameState.board[0] = parsedMessage.setup;
                } else if (playerIndex === 1) {
                    gameState.board[4] = parsedMessage.setup;
                }
                broadcast({ type: 'gameState', gameState });
                break;

            case 'move':
                // Updating gameState
                const { from, to, character } = parsedMessage;
                if (validateMove(from, to, character, playerIndex)) {
                    makeMove(from, to, character);
                    gameState.turn = 1 - gameState.turn;
                    broadcast({ type: 'gameState', gameState });
                } else {
                    ws.send(JSON.stringify({ type: 'invalidMove' }));
                }
                break;

            case 'reset':
                // Reseting gameState for next game
                resetGame();
                broadcast({ type: 'gameState', gameState });
                break;
        }
    });

    ws.on('close', () => {
    });
});

const validateMove = (from, to, character, playerIndex) => {
    // Out-of-Bounds check
    if (to[0] < 0 || to[0] > 4 || to[1] < 0 || to[1] > 4) {
        return false;
    }

    if (gameState.turn !== playerIndex) {
        return false;
    }

    const dx = Math.abs(to[0] - from[0]);
    const dy = Math.abs(to[1] - from[1]);

    if ((dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0)) {
        // Checks if the target block is empty
        if (gameState.board[to[0]][to[1]] === null || 
            gameState.board[to[0]][to[1]].player !== playerIndex) {
            return true;
        }
    }
    return false;
};

const makeMove = (from, to, character) => {
    gameState.board[to[0]][to[1]] = character;
    gameState.board[from[0]][from[1]] = null;
    checkGameOver();
};

const checkGameOver = () => {
    let player0King = false;
    let player1King = false;

    for (let row = 0; row < gameState.board.length; row++) {
        for (let col = 0; col < gameState.board[row].length; col++) {
            const cell = gameState.board[row][col];
            if (cell && cell.type === 'king') {
                if (cell.player === 0) player0King = true;
                if (cell.player === 1) player1King = true;
            }
        }
    }

    if (!player0King) {
        broadcast({ type: 'gameOver', winner: 'Player 1' });
    } else if (!player1King) {
        broadcast({ type: 'gameOver', winner: 'Player 0' });
    }
};

const resetGame = () => {
    gameState = {
        players: [],
        board: Array(8).fill().map(() => Array(8).fill(null)),
        turn: 0
    };
};

console.log('WebSocket server running on ws://localhost:8080');

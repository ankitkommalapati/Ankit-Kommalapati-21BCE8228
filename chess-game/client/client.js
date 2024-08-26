const socket = new WebSocket('ws://localhost:8080');

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessBoard');
    //Labels for columns and rows
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const size = 8;
    // Grid
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            // Coordinates
            const coordinate = `${letters[col]}${size - row}`;
            cell.textContent = coordinate;

            board.appendChild(cell);
        }
    }
});
// Handles messages from the server
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case 'gameState':
            updateGameBoard(message.gameState);
            break;
        case 'invalidMove':
            alert('Invalid move! Try again.');
            break;
        case 'gameOver':
            alert(`${message.winner} wins!`);
            break;
    }
};

// Updates the game board UI
const updateGameBoard = (gameState) => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const boardCell = gameState.board[row][col];
        if (boardCell) {
            cell.textContent = boardCell.type[0].toUpperCase();
            cell.style.color = boardCell.player === 0 ? 'blue' : 'red';
        } else {
            cell.textContent = '';
        }
    });
};

let selectedPiece = null;

gameBoard.addEventListener('click', (event) => {
    if (event.target.className === 'cell') {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (selectedPiece) {
            socket.send(JSON.stringify({
                type: 'move',
                from: selectedPiece,
                to: [row, col],
                character: 'P1'
            }));
            selectedPiece = null;
        } else {
            selectedPiece = [row, col];
        }
    }
});

const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const message = chatInput.value;
        socket.send(JSON.stringify({
            type: 'chat',
            message: message
        }));
        chatInput.value = '';
    }
});

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case 'chat':
            const chatMessage = document.createElement('div');
            chatMessage.textContent = `Player ${message.player}: ${message.message}`;
            chatBox.appendChild(chatMessage);
            break;
    }
};

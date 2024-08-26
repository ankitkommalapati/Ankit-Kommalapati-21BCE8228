*****Turn-Based Chess-like Game with WebSocket Communication*****



*Project Overview*
* This project is a turn-based strategy game that resembles a simplified version of chess. It is designed for two players who take turns moving pieces across a 8*8 grid. The game
is built using WebSocket communication, allowing real-time interaction between the players. The server manages the game state and enforces the rules, including turn-taking,
move validation, and piece capturing.

*Core Features*
* Real-time communication between two players using WebSockets.
* Player turns are enforced to prevent unauthorized moves.
* Move validation checks to ensure that moves are within bounds and legal.
* Piece capturing mechanics to remove opponent pieces from the game board.
* Game state synchronization between both players.
* A win condition that ends the game when one player loses all their pieces.

*Technologies Used*
* Frontend >> HTML5, CSS3, JavaScript
* Backend >> Node.js, WebSocket

*Prerequisites*
* *Node.js* and *npm* installed on your system.

*Procedure*
* Clone the git repository, navigate to the server directory and install all the required packages using "npm install".
* Then start the WebSocket server using "node server.js", on 'localhost:8080'.
* Then navigate to client directory and serve the files using "http-serve". Now the game will open in your browser.

const WebSocket = require('ws');

let websocket;

function initWebsocketServer(server) {
    const wss = new WebSocket.Server({server});

    wss.on('connection', (ws) => {
        console.log('Client connected');
        websocket = ws;

        ws.on('message', (message) => {
            console.log(`Received message => ${message}`);
        });

        // Simuleer een tijdrovende actie
        // const items = ['item1', 'item2', 'item3'];
        // items.forEach((item, index) => {
        //     setTimeout(() => {
        //         console.log(item, index)
        //         ws.send(`Processing ${item}`);
        //     }, index * 3000); // elke 3 seconden
        // });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}

function sendWebsocketMessage(message) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(message);
        return true;
    } else {
        console.log('Geen actieve websocket verbinding beschikbaar');
        return false;
    }
}

module.exports = {sendWebsocketMessage, initWebsocketServer}

import net from 'net';




// client.on('data', function (data) {
//     console.log('Received: ' + data);
//     client.destroy(); // kill client after server's response
// });

// client.on('close', function () {
//     console.log('Connection closed');
// });

function connect(address = '127.0.0.1', port = 42069) {
    var client = new net.Socket();
    client.connect(port, address, () => {
        console.log('Connected');
        client.write('Hello, server! Love, Client.');
    });
}

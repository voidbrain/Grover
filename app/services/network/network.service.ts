import net from 'net';

export class NetworkService {
    status: { _value: any };

    constructor() {
    }

    testConnection() {
        var client = new net.Socket();
        client.connect(80, 'www.google.com', function() {
            console.log('Connected');
            client.write('Hello, server! Love, Client.');
        });

        client.on('data', function(data) {
            console.log('Received: ' + data);
            client.destroy(); // kill client after server's response
        });

        client.on('close', function() {
            console.log('Connection closed');
        });
    }
}

export default NetworkService;

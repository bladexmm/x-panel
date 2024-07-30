// src/socket.js
import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(url) {
        if (!this.socket) {
            this.socket = io(url);

            this.socket.on('connect', () => {
                console.log('Connected to server');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    send(data) {
        if (this.socket) {
            this.socket.send(data);
        }
    }
}

const socketService = new SocketService();
export default socketService;

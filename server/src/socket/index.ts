import { Server, Socket } from 'socket.io';

export function attachSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] client connected: ${socket.id}`);

    // Client sends this event to confirm it received a feed item (optional ack)
    socket.on('feed_ack', (id: number) => {
      console.log(`[Socket.IO] client ${socket.id} acked feed item ${id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] client disconnected: ${socket.id} (${reason})`);
    });
  });
}

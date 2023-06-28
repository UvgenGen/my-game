import { Server } from 'Socket.IO'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server, {
      cors: {
        origin: ["http://localhost:8000"],
      }
    })
    res.socket.server.io = io

    io.on('connection', socket => {
        socket.on('post-add', msg => {
          socket.broadcast.emit('update-posts', msg)
        })
      })

  }
  res.end()
}

export default SocketHandler

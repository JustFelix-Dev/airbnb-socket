const { createServer } = require('http');
const { Server } = require("socket.io");
const httpServer = createServer();

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', ' * '); // Replace with your client's domain
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     next();
//   });
  
// const allowedOrigins = [
//     "https://www.airbnb.felixdev.com.ng", // Add your client's domain here
//   ];
  
//   app.use(cors({
//     origin: (origin, callback) => {
//       if (allowedOrigins.includes(origin) || !origin) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//   }));

//   app.get('/testing', (req, res) => {
//     res.send('Hello CORS');
//   });
  

const io = new Server(httpServer,{
                        cors: {
                            origin: "https://www.airbnb.felixdev.com.ng",
                            methods: ["GET","POST"]
                        }, 
                    });

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log(`New client connected ${socket.id}`);

  // listen to a connection
   socket.on("addNewUser",(userId)=>{
      !onlineUsers.some((user)=> user.userId === userId) &&
      onlineUsers.push({
          userId,
          socketId: socket.id,
      });
      console.log("OnlineUsers", onlineUsers);

      io.emit("getOnlineUsers", onlineUsers)
    });

    // Add Message
    socket.on("sendMessage",(message)=>{
        const user = onlineUsers.find((user) => user.userId === message.recipientId) 
        if(user){
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
            });

        }
    })
    // Disconnect User not online
    socket.on("disconnect",()=>{
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
        io.emit("getOnlineUsers", onlineUsers)
    })
});

httpServer.listen(3000);
const { Server } = require("socket.io");
const express = require('express');
const cors = require('cors');
const app = express();

app.use((cors({
      origin: 'https://www.airbnb.felixdev.com.ng',
})));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.airbnb.felixdev.com.ng');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
    });
    
const io = new Server({
                        cors:"https://www.airbnb.felixdev.com.ng", 
                        methods: ['GET', 'POST'],
                        credentials: true,
                        allowEIO3: true,
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

io.listen(3000);
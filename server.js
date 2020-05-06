const path = require('path');
const express = require('express');
const http =  require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUSer,getRoomUsers,userLeaveChat} = require('./utils/user')

const app = express() ;
const server  = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname,'public')));
io.on('connection', socket => {

    socket.on('joinRoom',({username,room})=>{
         const user = userJoin(socket.id,username,room);

         socket.join(user.room);


        socket.emit('message', formatMessage(user.username,'Welcome to ChatLock .. '));

       //connect
    
       socket.broadcast.to(user.room).emit
       ('message',
           formatMessage(user.username,`${user.username} has joined the chat!`));


           io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
          });
        });

    
    

    
      
        
   

    //listen to chatmessage
    socket.on('chatMessage',msg=>{
        const user = getCurrentUSer(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

     //left 
     socket.on('disconnect',()=>{
         const user = userLeaveChat(socket.id);
         if(user){
          io.to(user.room).emit('message',formatMessage(user.username,`${user.username} has left the chat`));
          
          
          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
          });
         }
        });
    });



const PORT = 3000 || process.env.PORT;

server.listen(PORT,()=> console.log(`Server running on Port ${PORT}`));
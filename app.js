require('dotenv').config();
const express=require("express");
const app =express();
const session = require('express-session')
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('Connected!')).catch((err)=>{
    console.log("error occured while connected to database");
});
const Message=require("./models/messageModel");
const sessionMiddleware=session({
  secret: 'cat',
  resave: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: { secure: process.env.NODE_ENV === "production" }
})
app.use(sessionMiddleware);
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.use((socket,next)=>{
    sessionMiddleware(socket.request,{},next);
})
const rooms=[];
io.on("connection",socket=>{
    const username=socket.request.session.yourName;
    const joinedRooms=socket.request.session.rooms||[];
    console.log(username);
    console.log(`${socket.id} is connected`);
    socket.on("check-room-exists",(roomName)=>{
        const roomExists=Message.findOne({roomName:roomName});
        if(roomExists){
            socket.emit("room-valid",roomName);
        }else{
            socket.emit("room-invalid",roomName);
        }
    })
    socket.on("join-room",async(room)=>{
        socket.join(room);
        const chatHistory=await Message.find({roomName:room}).sort({timestamp:1});
        socket.emit("load-history",chatHistory);
    })
    socket.on("check-newRoom-validation",newRoom=>{
        const roomExists=Message.findOne({roomName:newRoom});
        if(roomExists){
            socket.emit("newRoom-invalid",newRoom);
        }else{
            rooms.push(newRoom);
            socket.join(newRoom);
            socket.emit("newRoom-valid",newRoom);
        }
    })
    socket.on("typing",({roomName,senderId})=>{
        const userName=socket.request.session.yourName||"Anonymous";
        io.to(roomName).emit("show-typing",{senderId,userName});
    })
    socket.on("send-message",async({msgInput,roomName,senderId})=>{
        console.log(`message recieved is ${msgInput},${roomName}`);
        const newMessage=new Message({
            roomName:roomName,
          sender:username||"Anonymous",
          message:msgInput   
        })
        await newMessage.save();
        io.in(roomName).emit("receive-message",{msgInput,senderId});
    })
})
app.set("view engine","ejs");
app.get("/",(req,res)=>{
    res.render("login.ejs");
})
app.get("/room",(req,res)=>{
    const roomName=req.query.roomName;
    const yourName=req.query.yourName;
    req.session.yourName=yourName;
    if(!req.session.rooms){
        req.session.rooms=[];
    }
    if(!req.session.rooms.includes(roomName)){
        req.session.rooms.push(roomName);
    }
    req.session.save(err=>{
        if(err){
            console.log("session save error: ",err);
            return res.send("error saving session");
        }
    })
    res.render("chats.ejs",{roomName,yourName});
})
app.get("/logout",(req,res)=>{
    res.redirect("/");
})
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))
const PORT = process.env.PORT || 8080;
server.listen(PORT,()=>{
    console.log("listening to port 8080");
})
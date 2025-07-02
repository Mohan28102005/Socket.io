const socket=io();
document.querySelector("#join-room-form").addEventListener("submit",e=>{
    e.preventDefault();
    const roomName=document.querySelector("#enteredRoomName").value;
    socket.emit("check-room-exists",roomName);
})
socket.on("room-valid",roomName=>{
    document.querySelector("#join-room-form").submit();
    socket.emit("join-room",roomName);
})
socket.on("room-invalid",roomName=>{
    alert("room name entered is invald");
})
document.querySelector("#create-new-room").addEventListener("submit",e=>{
    e.preventDefault();
    const newRoom=document.querySelector("#newRoom").value;
    socket.emit("check-newRoom-validation",newRoom);
})
socket.on("newRoom-valid",roomName=>{
    document.querySelector("#create-new-room").submit();
})
socket.on("newRoom-invalid",roomName=>{
    alert("The entered Room Name already exists");
})
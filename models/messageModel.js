const mongoose = require('mongoose');
const messageSchema=mongoose.Schema({
    roomName:{
        required:true,
        type:String 
    },
    sender:{
        requried:true,
        type:String 
    },
    message:{
        type:String,
        required:true 
    },
    timestamp:{
        type:Date,
        default:Date.now()
    }
})
module.exports=mongoose.model("Message",messageSchema);
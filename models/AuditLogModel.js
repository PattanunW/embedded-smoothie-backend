const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action:{
        type:String,
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    target:{
        type:String,
        required:true
    },
    target_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now
    },
    description:{
        type:String
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
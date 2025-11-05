const AuditLog = require('../models/AuditLogModel');

// @desc    Get all audit logs
// @route   GET /api/v1/auditlogs
// @access  Private
exports.getAuditLogs = async(req,res,next)=>{
    try{
        const auditLogs = await AuditLog.find().populate({
            path:'user_id',
            select:'name'
        });
        res.status(200).json({success:true,data:auditLogs});
    }
    catch(err){
        res.status(400).json({success:false,message:'Cannot get audit logs'});
    }
}

// @desc    Get a single audit log
// @route   GET /api/v1/auditlogs/:id
// @access  Private
exports.getAuditLog = async(req,res,next)=>{
    try{
        const auditLog = await AuditLog.findById(req.params.id).populate({
            path:'user_id',
            select:'name'
        });
        if(!auditLog){
            return res.status(404).json({success:false, message:`Audit log with the id ${req.params.id} does not exist`});
        }

        res.status(200).json({success:true,data:auditLog});
    }
    catch(err){
        res.status(400).json({success:false,message:'Cannot get audit logs'});
    }
}
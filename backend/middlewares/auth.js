const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

exports.isAuthenticatedUser=async(req,res,next)=>{
    const access_token=req.cookies.access_token;
    if(!access_token) return res.status(401).send("You are not logged in or unauthorized access");

    const decoded=jwt.verify(access_token,process.env.JWT_SECRET_KEY);

    req.user=await UserModel.findById(decoded.id);
    next();
}

exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            res.status(403).send(`Role: ${req.user.role} are not allowed to access this resource`);
        }
        next()
    }
}
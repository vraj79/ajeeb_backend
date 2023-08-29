const ErrorHandler = require("../utils/errorHandler");

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500,
    err.message=err.message || "Internal server error"

    // wrong mongodb id error
    if(err.name==="CastError"){
        const message=`Resource not found. Invalid ${err.path}`;
        err=new ErrorHandler(message,400)
    }
    
    // duplicate key error
    if(err.code===11000){
        const message=`Dublicate ${Object.keys(err.keyValue)} Entered`
        err=new ErrorHandler(message,400)
    }

    // jsonwebtoken error
    if(err.code==="JsonWebTokenError"){
        const message=`Json Web Token is invalid,try again`
        err=new ErrorHandler(message,400)
    }

    // jsonwebtoken expire error
    if(err.code==="TokenExpireError"){
        const message=`Json Web Token is expired,try again`
        err=new ErrorHandler(message,400)
    }

    res.status(err.statusCode).send({
        success:false,
        msg:err.message
    })
}
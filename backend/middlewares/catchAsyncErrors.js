module.exports=(Function)=>(req,res,next)=>{
    Promise.resolve(Function(req,res,next)).catch(next)
}
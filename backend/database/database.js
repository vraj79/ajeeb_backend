const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connect=()=>{
  mongoose.connect(process.env.MONGO,()=>{
    console.log("Database Connected")
  })
}


module.exports=connect

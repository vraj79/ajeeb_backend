const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const cloudinary=require("cloudinary");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path=require("path");

const connectDB = require("./database/database");
const ProductRouter = require("./routes/ProductRoute");
const errorMiddleware = require("./middlewares/error");
const UserRouter = require("./routes/UserRoute");
const OrderRouter = require("./routes/OrderRoute");
const paymentRouter = require("./routes/paymentRoute");

//config
dotenv.config({ path: "backend/config/config.env" });

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API, 
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY 
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// app.use(cors({
//   origin:"http://localhost:3000",
//   credentials:true
// }));
app.use(cors({
  origin: (origin, callback) => {
    // To allow requests from any origin
    callback(null, true);
  },
  credentials: true
}));
// routes
app.use("/products", ProductRouter);
app.use("/user", UserRouter);
app.use("/order", OrderRouter);
app.use('/payment',paymentRouter)

// middleware for error
app.use(errorMiddleware);

//server start
// app.get("/", (req, res) => {
//   res.send("server is running");
// });

// app.use(express.static(path.join(__dirname,"../frontend/build")));

// app.get("*",(req,res)=>{
//   res.sendFile(path.join(__dirname,"../frontend/build/index.html"));
// })

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`server started on http://localhost:${process.env.PORT}`);
});

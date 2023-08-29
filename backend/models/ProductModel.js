const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: [true, "Please Enter Product Name"], trim: true },
  description: {
    type: String,
    required: [true, "Please Enter Product Description"]
  },
  price: { type: Number, required: [true, "Please Enter Product Price"] },
  ratings: { type: Number, default: 0 },
  // images: [
  //   {
  //     public_id: { type: String, required: true },
  //     url: { type: String, required: true }
  //   }
  // ],
  images:{type: [String]},
  category: { type: String, required: [true, "Please Enter Product Category"] },
  stock: { type: Number, required: [true, "Please Enter Product Stock"], default: 1 },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String },
    }
  ],
  numOfReviews: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("product", productSchema)

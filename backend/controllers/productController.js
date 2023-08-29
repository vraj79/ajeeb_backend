const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ProductModel = require("../models/ProductModel");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");

// getAllProducts
exports.getAllProducts = async (req, res, next) => {
  try {
    const resPerPage = 8
    const totalProducts = await ProductModel.countDocuments();
    const filProduct = new ApiFeatures(ProductModel.find(), req.query).search().filter()

    const filteredProducts = await filProduct.query;

    const filteredProductsCount = filteredProducts.length;

    const apiFeature = new ApiFeatures(ProductModel.find(), req.query).search().filter()
      .pagination(resPerPage);

    const products = await apiFeature.query

    res.status(200).send({ success: true, products, totalProducts, resPerPage, filteredProductsCount });
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

exports.getProductCategories=catchAsyncErrors(async(req,res)=>{
  try {
    const categories = await ProductModel.find().distinct("category");
    res.status(200).send({ success: true, categories });
  } catch (error) {
    res.send({ error: error.message });
  }
})

//get product by id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404))

    res.status(200).send(product);
  } catch (error) {
    res.send({ error: error.message });
  }
};

// get all product for admin
exports.getAdminProducts = catchAsyncErrors(async (req, res) => {
  const products = await ProductModel.find().sort({ _id: -1 });

  res.status(200).send({ success: true, products });

})

//createProduct==>Admin
exports.createProduct = async (req, res, next) => {
  const productData = req.body;
  let images = [];

  for (let key in productData) {
    if (key.includes("image")) {
      images.push(productData[key]);
      delete productData[key];
    }
  }

  let imgLinks = []

  for (let i = 0; i < images.length; i++) {
    let result=await cloudinary.v2.uploader.upload(images[i], {
      folder: "products"
    })
    imgLinks.push(result.secure_url)
  }

  req.body.images = imgLinks

  req.body.user = req.user.id
  try {
    const product = await ProductModel.create(req.body);
    res.status(200).send({ success: true, product });
  } catch (error) {
    res.send({ error: error.message });
  }
};

//updateProduct==>Admin
exports.updateProduct = async (req, res) => {
  try {
    await ProductModel.findByIdAndUpdate({ _id: req.params.id }, req.body);
    res.status(200).send({ success: true, message: "product updated" });
  } catch (error) {
    res.send({ error: error.message });
  }
};

//deleteProduct==>Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    let product = await ProductModel.findById(req.params.id);

    if (product) {
      // for(let i=0;i<product.images.length;i++){
      //   await cloudinary.v2.uploader.destroy(product.images[i].public_id)
      // }
      await product.remove();
      res.status(200).send({ success: true, message: "product deleted" });
    } else {
      next(new ErrorHandler("Product Not Found", 404))
    }
  } catch (error) {
    res.send({ error: error.message });
  }
};


// create new review or update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }

  const product = await ProductModel.findById(productId);

  const isReviewed = product.reviews.find((ele) => ele.user === req.user._id)
  if (isReviewed) {
    product.reviews.forEach((ele) => {
      if (ele.user === req.user._id) {
        ele.rating = rating;
        ele.comment = comment;
      }
    })
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length
  }

  let avg = 0;
  product.reviews.forEach((ele) => (avg += ele.rating))
  product.ratings = avg / product.reviews.length

  await product.save({ validateBeforeSave: false });

  res.status(200).send({ success: true });
})

// get product reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  try {
    let product = await ProductModel.findById({ _id: req.query.id });

    if (!product) return next(new ErrorHandler("Product not found", 404))

    res.status(200).send({ success: true, reviews: product.reviews })
  } catch (error) {
    res.status(501).send({ error })
  }
})

// delete review
exports.delProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.productId);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  const reviews = product.reviews.filter((ele) => ((req.query.reviewId).toString() !== (ele._id).toString()));

  let avg = 0;
  reviews.forEach((ele) => (avg += ele.rating))
  const ratings = avg / reviews.length

  const numOfReviews = reviews.length;

  await ProductModel.findByIdAndUpdate(req.query.productId, { reviews, ratings, numOfReviews })

  res.status(200).json({ success: true, reviews: product.reviews })
})
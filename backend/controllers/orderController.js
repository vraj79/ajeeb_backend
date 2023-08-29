const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems } = req.body;

  const order = await OrderModel.create({ ...req.body, user: req.user._id });

  orderItems.forEach(async (ele) => (await updateStock(ele.id, ele.qty)))

  res.status(201).send({ success: true, order });
});

// get single order;
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id).populate("user", "name email");

  if (!order) return next(new ErrorHandler("Order not found with this Id", 404));

  res.status(200).send({ success: true, order })
})

// get logged in user order;
exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await OrderModel.find({ user: req.user._id })

  res.status(200).send({ success: true, orders })
})

// get all orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await OrderModel.find();

  let totalAmount = orders.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2);

  res.status(200).send({ success: true, orders, totalAmount })
})

// get update orders status
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400))
  }

  // order.orderItems.forEach(async (ele) => (await updateStock(ele.id, ele.qty)))

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now()
  }

  await order.save({ validateBeforeSave: false })

  res.status(200).send({ success: true, order })
})

// updating stock
async function updateStock(id, quantity) {
  const product = await ProductModel.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false })
}

// delete order
exports.delOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Order not found", 404));

  await order.remove();

  res.status(200).send({ success: true, msg: "Order deleted successfully" })
})
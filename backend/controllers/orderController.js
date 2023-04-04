// import all the models
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");

const ErrorHandler = require("../utils/errorHandler");

// Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const order = await OrderModel.create({
    shippingInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Order created successfully",
    order,
  });
});

// Get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  // populate() is a mongoose method that allows us to populate the user field with the name and email fields from the user model
  // as we don't have the name and email fields in the order model
  // we can also populate multiple fields by passing an array of fields

  const order = await OrderModel.findById(req.params.id).populate(
    "user",
    // "name email"
    ["name", "email"]
  );

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await OrderModel.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all orders - ADMIN => /api/v1/admin/orders/
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await OrderModel.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status -- admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  order.orderStatus = req.body.status;
  order.deliveredAt = Date.now();

  await order.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await ProductModel.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Delete order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }
  // .remove is deprecated 😁😁
  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});

const ProductModel = require("../models/productModel");
// ErrorHandler is a class that we created in utils/errorHandler.js
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  // adding user to req.body so that we can get the user id
  req.body.user = req.user.id;
  const product = await ProductModel.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// Get All Products

exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultsPerPage = 8;
  const productCount = await ProductModel.countDocuments();

  const apiFeature = new ApiFeatures(ProductModel.find(), req.query)
    .search()
    .filter()
    .paginate(resultsPerPage);

  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    productCount,
    products,
  });
});

// Update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await ProductModel.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product -- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  //   .remove is deprecated so we use .deleteOne
  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// Create new review or update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await ProductModel.findById(productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    // iterate through the reviews and update the review that matches the user id with the current user id
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    // if the user has not reviewed the product before, then push the review to the reviews array
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get ALl reviews of a single product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const rating = avg / reviews.length;

  await ProductModel.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      rating,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
  });
});

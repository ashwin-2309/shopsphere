const productModel = require("../models/productModel");
const ProductModel = require("../models/productModel");

// Create Product -- Admin
exports.createProduct = async (req, res, next) => {
  const product = await ProductModel.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
};

// Get All Products

exports.getAllProducts = async (req, res) => {
  const products = await ProductModel.find();
  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
};

// Update Product -- Admin
exports.updateProduct = async (req, res, next) => {
  let product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }

  product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
};

// Delete Product -- Admin
exports.deleteProduct = async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }
  //   .remove is deprecated so we use .deleteOne
  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }
  res.status(200).json({
    success: true,
    product,
  });
};

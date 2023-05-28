import React from "react";
import { Link } from "react-router-dom";
import ReactStars from "react-rating-stars-component";

const Product = ({ product }) => {
  const options = {
    edit: false,
    color: "rgba(20,20,20,0.2)",
    activeColor: "tomato",
    value: product.ratings,
    isHalf: true,
    size: window.innerWidth > 600 ? 30 : 20,
  };
  return (
    <Link className='productCard' to={Product._id}>
      <img src={product.images[0]} alt={product.name} />
      <p>{product.name}</p>
      <div>
        <ReactStars {...options} />{" "}
        <span>({product.numOfReviews} Reviews)</span>
      </div>
      <span>{`₹${product.price}`}</span>
    </Link>
  );
};

export default Product;

import React, { Fragment, useEffect } from "react";
import { CgMouse } from "react-icons/cg";
import "./Home.css";
import Product from "./Product.js";
import MetaData from "../layout/MetaData";
import { getProduct } from "../../actions/productAction";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../layout/Loader/Loader";
import { useAlert } from "react-alert";

const Home = () => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const { loading, error, products, productCount } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (error) {
      return alert.error(error);
    }
    dispatch(getProduct());
  }, [dispatch, error]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <>
          <MetaData title={"Shopsphere"} />
          <div className='banner'>
            <p>Welcome to ShopSphere</p>
            <h1>Find Amazing Products Below</h1>
            <a href='#container'>
              <button>
                Scroll
                <CgMouse />
              </button>
            </a>
            {/* put an image of stock  */}
          </div>

          <h2 className='homeHeading'>Featured Products</h2>
          <div className='container' id='container'>
            {products &&
              products.map((product) => (
                <Product key={product._id} product={product} />
              ))}
          </div>
        </>
      )}
    </Fragment>
  );
};

export default Home;

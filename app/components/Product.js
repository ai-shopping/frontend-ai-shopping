import React from "react";

const Product = ({ name }) => {
  return <div className="container m-1 product-item">
    <div className="row">
        <div className="col-md-12 d-flex justify-content-center align-items-center p-0 m-0">
          <img src={process.env.PUBLIC_URL + '/images/image-14.png'} className=""/>
          <div className="mx-2">
          <h5>{name}</h5>
          <p>$195.00 CAD</p>
          </div>
        </div>
      </div>
  </div>;
};


export default Product;
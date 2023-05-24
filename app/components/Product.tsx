import React from "react";

interface ProductProps {
  name:string
  price: string
}

const Product = (props: ProductProps) => {
  return <div className="container m-1 product-item">
    <div className="row">
        <div className="col-md-12 d-flex justify-content-center align-items-center p-0 m-0">
          <img src={process.env.PUBLIC_URL + '/images/image-14.png'} className=""/>
          <div className="mx-2">
          <h5>{props.name}</h5>
          <p>{props.price} CAD</p>
          </div>
        </div>
      </div>
  </div>;
};


export default Product;
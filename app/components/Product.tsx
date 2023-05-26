import React from "react";
import { ProductDto } from "~/data/models/product_dto";

interface ProductProps {
  product: ProductDto| undefined | null
  name:string
  price: string
}

const Product = (props: ProductProps) => {
  console.log(props)
  return <div className="container m-1 product-item">
    <div className="row">
        <div className="col-md-12 d-flex justify-content-center align-items-center p-0 m-0">
          <img src={props.product?.media?.nodes![0].image?.url} className=""/>
          <div className="mx-2">
          <h5>{props.name}</h5>
          <p>{props.product?.variants.nodes[0].price.amount} {props.product?.variants.nodes[0].price.currencyCode}</p>
          </div>
        </div>
      </div>
  </div>;
};


export default Product;
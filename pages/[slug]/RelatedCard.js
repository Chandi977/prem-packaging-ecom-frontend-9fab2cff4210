import React from "react";
import styles from "./page.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import { addToCart } from "../../utils/cart";

function RelatedCard({ product }) {
  console.log("PRODUCT DETAILS RELATED:", product);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);

  const handleData = () => {
    if (product?.priceList?.length > 0) {
      const t = product?.priceList[0]?.SP;
      const num = product?.priceList[0]?.number;
      const p = t / num;
      const tt = p * num;
      const cc = tt.toFixed(0);
      setTotal(cc);
      setPrice(p);
      setQuantity(num);
    } else {
      setPrice(product?.price);
    }
  };

  useEffect(() => {
    handleData();
    //console.log(product);
  }, [product]);

  const handleCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(product, quantity, price);
  };

  const handleViewProduct = () => {
    const productId = product?.slug;
    const url = `/${productId}`;
    const newTab = window.open(url, "_blank");

    // Focus on the new tab if it was successfully opened
    if (newTab) {
      newTab.focus();
    }
  };

  const router = useRouter();
  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{
          position: "relative",
          height: "150px",
          width: "250px",
        }}
      >
        <img src={product?.images?.[0]?.image} width="180px" />
        {/* <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{
              backgroundColor: "#E92227",
              position: "absolute",
              right: "0px",
              top: "0%",
              width: "41px",
              height: "43px",
              borderBottomLeftRadius: "9px",
            }}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ width: "25px", height: "24px" }}
            >
              <p className={styles.offtext}>
                20%
                <br />
                OFF
              </p>
            </div>
          </div> */}
      </div>
      <div
        className="d-flex flex-column justify-content-evenly align-items-between"
        style={{ height: "170px", width: "227px" }}
      >
        <div className="row " style={{ marginTop: "30px" }}>
          <p
            className="px-3"
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "21px",
              textTransform: "capitalize",
            }}
          >
            {product?.brand?.name} {product?.name} {product?.model}
          </p>
        </div>
        <div
          className="px-3 m-0 d-flex flex-row align-items-center justify-content-start"
          style={{ height: "50px" }}
        >
          <span
            className={styles.pricesecondtext}
            style={{
              fontSize: "16px",
              textDecoration: "line-through",
            }}
          >
            ₹{product?.priceList?.[0]?.MRP}{" "}
          </span>
          <span className={styles.pricesecondtext} style={{ fontSize: "20px" }}>
            ₹{total}
          </span>
        </div>
      </div>
      <button
        className={styles.packagebtn}
        style={{
          width: "227px",
          height: "41px",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={handleViewProduct}
      >
        View Product
      </button>
    </>
  );
}

export default RelatedCard;

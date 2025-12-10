import React, { useEffect } from "react";
import styles from "../../styles/page.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import { addToCart } from "../../utils/cart";

function TopCardMobile({ item }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  useEffect(() => {
    //console.log(item);
  });

  const handleCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(item?.product, quantity, item?.newPrice);
    if (result) {
      router.push("/my-cart");
    }
  };

  const handleViewProduct = () => {
    const productId = item?.slug;
    const url = `/${productId}`;
    const newTab = window.open(url, "_blank");

    // Focus on the new tab if it was successfully opened
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-start align-items-center"
      style={{
        width: "160px",
        height: "280px",
        cursor: "pointer",
        marginLeft:"100px"
      }}
    //   key={index}
    onClick={handleViewProduct}
    >
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{
          border: "1px solid ",
          border: "none",
          borderRadius: "100px",
          backgroundColor: "#808080",
          boxShadow: "2px 18px 18px #F5F5F9 ",
          cursor: "pointer",
          padding: "30px",
        }}
      >
        <img
          src={item?.images?.[0]?.image}
          style={{ width: "120px", height: "120px" }}
        />
      </div>
      <div className="mt-4 d-flex justify-content-center align-items-center">
        <p className={styles.toptext} style={{ textTransform: "capitalize" }}>
          {item?.brand?.name} {item?.name} {item?.model}
        </p>
      </div>
    </div>
  );
}

export default TopCardMobile;

import React from "react";
import styles from "./listingcard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useEffect } from "react";
import { addToFav, getFav, removeFromFav } from "../../utils/favourites";
import { addToCart } from "../../utils/cart";
import { useRouter } from "next/router";

function ListingCard({ item }) {
  const [favourite, setFavourite] = useState([]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [final, setFinal] = useState(0);
  const checkFav = (id) => {
    const temp = favourite?.map((x) => x?.product?._id).indexOf(id);
    if (temp === -1 || temp === undefined || temp === null) {
      return false;
    } else {
      return true;
    }
  };

  const getFavourite = async () => {
    const result = await getFav();
    if (result !== null) {
      setFavourite(result);
    }
  };

  useEffect(() => {
    getFavourite();
    if (item) {
      if (item?.priceList?.length > 0) {
        const price = item?.priceList?.[0]?.SP;
        const number = item?.priceList?.[0]?.number;
        const priceForOne = price / number;
        setPrice(priceForOne);
        setQuantity(item?.priceList[0]?.number);
        const ff = priceForOne * item?.priceList[0]?.number;
        setFinal(ff.toFixed(0));
      } else {
        setPrice(item?.price);
        setQuantity(1);
      }
    }
  }, [item]);

  const handleFavourite = async (e, product) => {
    e.stopPropagation();
    const temp = favourite?.map((x) => x?.product?._id).indexOf(product?._id);
    if (temp === -1 || temp === undefined || temp === null) {
      const c = await addToFav(product);
      getFavourite();
    } else {
      const c = await removeFromFav(product?._id);
      getFavourite();
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

  const handleCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(item, quantity, price);
  };
  const router = useRouter();
  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center bg-light w-100"
        style={{ position: "relative", height: "150px" }}
      >
        <img
          src={item?.images?.[0]?.image}
          className="pt-4"
          style={{ width: "110px", height: "103px" }}
          onClick={handleViewProduct}
        />
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{
            position: "absolute",
            right: "5%",
            top: "13%",
            borderRadius: "25px",
            width: "24px",
            height: "24px",
            backgroundColor: "white",
          }}
        >
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{
              width: "19px",
              height: "19px",
              borderRadius: "25px",
            }}
          >
            {checkFav(item?._id) ? (
              <FontAwesomeIcon
                icon={faHeart}
                style={{
                  color: "red",
                  width: "15px",
                  height: "15px",
                  paddingRight: "15px",
                  cursor: "pointer",
                }}
                onClick={(e) => handleFavourite(e, item)}
              />
            ) : (
              <FontAwesomeIcon
                icon={faHeart}
                style={{
                  color: "grey",
                  width: "15px",
                  height: "15px",
                  paddingRight: "15px",
                  cursor: "pointer",
                }}
                onClick={(e) => handleFavourite(e, item)}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className="d-flex flex-column justify-content-evenly pt-3 align-items-between bg-light"
        style={{ maxHeight: "120px", width: "100%", cursor: "pointer" }}
      >
        <div className="row p-0 m-0" style={{ maxHeight: "60px" }}>
          <p
            className="px-3"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "16px",
              textTransform: "capitalize",
              textAlign: "center",
            }}
            onClick={handleViewProduct}
          >
            {item?.brand &&
              (typeof item.brand === "string"
                ? // If item.brand is a string
                  item.brand === "6557dbbc301ec4f2f4266107"
                  ? "flipkart"
                  : item.brand === "6557dbcc301ec4f2f426610b"
                  ? "myntra"
                  : item.brand === "6557dbad301ec4f2f4266103"
                  ? "amazon"
                  : item.brand === "6582c8580ab82549a084894f"
                  ? "ajio"
                  : item.brand === "6557dbf9301ec4f2f426611e"
                  ? "rollabel"
                  : item.brand === "6557dc10301ec4f2f4266122"
                  ? "pack-secure"
                  : item.brand === "6582c8750ab82549a0848953"
                  ? "PackPro"
                  : item.brand
                : // If item.brand is an object, render a specific property (you can adjust this based on your data structure)
                  item.brand.name)}{" "}
            {item?.name} {item?.model}
          </p>
        </div>
        <div
          className="px-3 m-0 d-flex flex-column align-items-center pt-3 justify-content-center"
          style={{ height: "30px" }}
        >
          <p
            style={{
              color: "#249b3e",
              fontSize: "14px",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            ₹{final}
          </p>
        </div>
      </div>
      <button
        className={"w-100 " + styles.packagebtn}
        style={{
          fontSize: "11px",
          height: "30px",
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

export default ListingCard;

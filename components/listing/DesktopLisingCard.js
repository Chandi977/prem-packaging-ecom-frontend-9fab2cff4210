import React from "react";
import styles from "./DesktoplistingCard.module.scss";
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

function DesktopListingCard({ item }) {
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          className="d-flex justify-content-center align-items-center bg-light "
          style={{
            position: "relative",
            height: "200px",
            width: "300px",
            cursor: "pointer",
          }}
          // onClick={() => window.open(`/product?id=${item?._id}`, '_blank')}
        >
          <img
            src={item?.images?.[0]?.image}
            className="pt-4"
            style={{ width: "250px", height: "250px" }}
            onClick={handleViewProduct}
          />
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{
              position: "absolute",
              left: "5%",
              top: "5%",
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

          {item?.priceList?.[0]?.MRP !== item?.priceList?.[0]?.SP && (
            <div
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
              {/* Discount Tag */}
              <div
                className="d-flex flex-column "
                style={{ width: "25px", height: "24px", textAlign: "center" }}
              >
                <p className={styles.offtext}>
                  {Math.round(
                    ((item?.priceList?.[0]?.MRP - item?.priceList?.[0]?.SP) /
                      item?.priceList?.[0]?.MRP) *
                      100
                  )}
                  %
                  <br />
                  OFF
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className="d-flex flex-column justify-content-evenly align-items-center bg-light"
          style={{
            height: "120px",
            width: "300px",
            cursor: "pointer",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <div className="row p-0 m-0" style={{ height: "70px" }}>
            <p
              className="px-3"
              style={{
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "25px",
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
              {item?.name} {item?.model} (Pack of {item?.priceList?.[0]?.number}
              )
            </p>
          </div>
          <div
            className="px-3 mb-3 d-flex flex-column align-items-start justify-content-center"
            style={{ height: "40px" }}
          >
            {/* <p className={styles.pricetext}>₹{final}</p> */}
            <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
              <div className=" m-0 d-flex flex-row align-items-center justify-content-start">
                <s>
                  <p className={styles.pricetext1}>
                    ₹{item?.priceList?.[0]?.MRP}
                  </p>
                </s>
              </div>

              <div className=" m-0 d-flex flex-row align-items-center justify-content-start">
                <p className={styles.pricetext} style={{ fontWeight: "600" }}>
                  ₹{final}
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          className={"" + styles.packagebtn}
          style={{
            fontSize: "14px",
            height: "50px",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            width: "300px",
          }}
          onClick={handleViewProduct}
        >
          View Product
        </button>
      </div>
    </>
  );
}

export default DesktopListingCard;

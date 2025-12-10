import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/page.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import { useEffect } from "react";
import { addToCart } from "../../utils/cart";
import { addToFav, getFav, removeFromFav } from "../../utils/favourites";

function LandingBrandCard({ item }) {
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favourite, setFavourite] = useState([]);
  const [final, setFinal] = useState(0);

  const getFavourite = async () => {
    const result = await getFav();
    if (result !== null) {
      setFavourite(result);
    }
  };

  useEffect(() => {
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
    getFavourite();
  }, [item]);

  const checkFav = (id) => {
    const temp = favourite?.map((x) => x?.product?._id).indexOf(id);
    if (temp === -1 || temp === undefined || temp === null) {
      return false;
    } else {
      return true;
    }
  };

  const handleCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(item, quantity, price);
  };

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
  const router = useRouter();
  //console.log(item);
  return (
    <div
      className={
        "d-flex flex-column justify-content-start align-items-center mx-md-0 mx-3"
      }
      style={{ width: "288px", height: "357px", cursor: "pointer" }}
      onClick={() => router.push(`/${item?.slug}`)}
    >
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{
          position: "relative",
          height: "210px",
          width: "288px",
        }}
      >
        <img
          src={item?.images?.[0]?.image}
          className="pt-4"
          style={{ width: "170px", height: "136px" }}
        />
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{
            position: "absolute",
            right: "5%",
            top: "13%",
            borderRadius: "25px",
            width: "34px",
            height: "34px",
            backgroundColor: "white",
          }}
        >
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{
              width: "25px",
              height: "24px",
              borderRadius: "25px",
            }}
            onClick={(e) => handleFavourite(e, item)}
          >
            {checkFav(item?._id) ? (
              <FontAwesomeIcon
                icon={faHeart}
                style={{
                  color: "#E92227",
                  width: "15px",
                  height: "15px",
                }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faHeart}
                style={{
                  color: "grey",
                  width: "15px",
                  height: "15px",
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className="d-flex flex-column justify-content-evenly align-items-between bg-light"
        style={{ height: "130px", width: "288px" }}
      >
        <div className="row p-0 m-0" style={{ height: "50px" }}>
          <p
            className="px-3"
            style={{
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: "21px",
              fontFamily: "Montserrat",
            }}
          >
            {item?.name} {item?.model}
          </p>
        </div>
        <div
          className="px-3 m-0 d-flex flex-row align-items-center justify-content-start"
          style={{ height: "50px" }}
        >
          <p className={styles.pricetext}>₹{final}</p>
        </div>
      </div>
      <button
        className={styles.packagebtn}
        style={{
          width: "288px",
          height: "41px",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => router.push(`/${item?.slug}`)}
      >
        View Product
      </button>
    </div>
  );
}

export default LandingBrandCard;

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./listingcard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { addToFav, getFav, removeFromFav } from "../../utils/favourites";
import { addToCart } from "../../utils/cart";

function ListingCard({ item }) {
  const [favourite, setFavourite] = useState([]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [final, setFinal] = useState(0);

  const checkFav = (id) => {
    const temp = favourite?.map((x) => x?.product?._id).indexOf(id);
    return !(temp === -1 || temp === undefined || temp === null);
  };

  const getFavourite = async () => {
    const result = await getFav();
    if (result !== null) setFavourite(result);
  };

  useEffect(() => {
    getFavourite();
    if (item) {
      if (item?.priceList?.length > 0) {
        const SP = item?.priceList?.[0]?.SP || 0;
        const number = item?.priceList?.[0]?.number || 1;
        const priceForOne = SP / number;
        setPrice(priceForOne);
        setQuantity(number);
        const ff = priceForOne * number;
        setFinal(ff.toFixed(0));
      } else {
        setPrice(item?.price || 0);
        setQuantity(1);
        setFinal((item?.price || 0).toFixed(0));
      }
    }
  }, [item]);

  const handleFavourite = async (e, product) => {
    e.stopPropagation();
    const temp = favourite?.map((x) => x?.product?._id).indexOf(product?._id);
    if (temp === -1 || temp === undefined || temp === null) {
      await addToFav(product);
      getFavourite();
    } else {
      await removeFromFav(product?._id);
      getFavourite();
    }
  };

  const handleViewProduct = () => {
    const productId = item?.slug;
    const url = `/${productId}`;
    const newTab = window.open(url, "_blank");
    if (newTab) newTab.focus();
  };

  const handleCart = async (e) => {
    e.stopPropagation();
    await addToCart(item, quantity, price);
  };

  const brandName = () => {
    if (!item?.brand) return "";
    if (typeof item.brand === "string") {
      switch (item.brand) {
        case "6557dbbc301ec4f2f4266107":
          return "flipkart";
        case "6557dbcc301ec4f2f426610b":
          return "myntra";
        case "6557dbad301ec4f2f4266103":
          return "amazon";
        case "6582c8580ab82549a084894f":
          return "ajio";
        case "6557dbf9301ec4f2f426611e":
          return "rollabel";
        case "6557dc10301ec4f2f4266122":
          return "pack-secure";
        case "6582c8750ab82549a0848953":
          return "PackPro";
        default:
          return item.brand;
      }
    }
    return item.brand?.name || "";
  };

  const imageSrc = item?.images?.[0]?.image || "/placeholder.png";

  return (
    <div className={"w-100 d-flex flex-column"}>
      <div
        className="d-flex justify-content-center align-items-center bg-light w-100"
        style={{ position: "relative", height: 150 }}
      >
        {/* Next.js Image with lazy loading. Provide width/height for optimal layout. */}
        <div
          style={{ cursor: "pointer" }}
          onClick={handleViewProduct}
          aria-hidden
        >
          <Image
            src={imageSrc}
            alt={item?.name || "product image"}
            width={110}
            height={103}
            loading="lazy"
            style={{ objectFit: "contain" }}
            unoptimized={false}
            priority={false}
          />
        </div>

        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{
            position: "absolute",
            right: "5%",
            top: "13%",
            borderRadius: 25,
            width: 24,
            height: 24,
            backgroundColor: "white",
          }}
        >
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ width: 19, height: 19, borderRadius: 25 }}
          >
            <FontAwesomeIcon
              icon={faHeart}
              onClick={(e) => handleFavourite(e, item)}
              style={{
                color: checkFav(item?._id) ? "red" : "grey",
                width: 15,
                height: 15,
                paddingRight: 15,
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="d-flex flex-column justify-content-evenly pt-3 align-items-between bg-light"
        style={{ maxHeight: 120, width: "100%", cursor: "pointer" }}
      >
        <div className="row p-0 m-0" style={{ maxHeight: 60 }}>
          <p
            className="px-3"
            style={{
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "16px",
              textTransform: "capitalize",
              textAlign: "center",
            }}
            onClick={handleViewProduct}
          >
            {brandName()} {item?.name} {item?.model}
          </p>
        </div>

        <div
          className="px-3 m-0 d-flex flex-column align-items-center pt-3 justify-content-center"
          style={{ height: 30 }}
        >
          <p
            style={{
              color: "#249b3e",
              fontSize: 14,
              fontWeight: 500,
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
          fontSize: 11,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={handleViewProduct}
      >
        View Product
      </button>
    </div>
  );
}

export default React.memo(ListingCard);

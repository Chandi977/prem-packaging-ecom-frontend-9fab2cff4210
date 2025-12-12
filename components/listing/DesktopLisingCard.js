import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./DesktoplistingCard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { addToFav, getFav, removeFromFav } from "../../utils/favourites";
import { addToCart } from "../../utils/cart";

function normalizeUrl(raw) {
  if (!raw) return null;
  // trim whitespace
  const s = String(raw).trim();
  // already absolute http/https
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // protocol-relative //host/path -> add https:
  if (s.startsWith("//")) return "https:" + s;
  // cloudinary-style with leading slash is OK (relative to site) - return as-is
  if (s.startsWith("/")) return s;
  // missing protocol but looks like domain (example.com/...) -> add https://
  if (s.indexOf(".") > -1) return "https://" + s;
  // fallback null
  return null;
}

function DesktopListingCard({ item }) {
  const [favourite, setFavourite] = useState([]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [final, setFinal] = useState(0);

  // local state for image src (so we can swap to placeholder on error)
  const [imageSrc, setImageSrc] = useState("/placeholder.png");

  const checkFav = (id) => {
    const temp = favourite?.map((x) => x?.product?._id).indexOf(id);
    return !(temp === -1 || temp === undefined || temp === null);
  };

  const getFavourite = async () => {
    try {
      const result = await getFav();
      if (result !== null) setFavourite(result);
    } catch (err) {
      console.error("getFav error:", err);
    }
  };

  useEffect(() => {
    getFavourite();
  }, []);

  useEffect(() => {
    if (!item) {
      setImageSrc("/placeholder.png");
      return;
    }

    // price logic (unchanged, just safe)
    if (Array.isArray(item.priceList) && item.priceList.length > 0) {
      const SP = Number(item?.priceList?.[0]?.SP || 0);
      const number = Number(item?.priceList?.[0]?.number || 1);
      const priceForOne = number === 0 ? 0 : SP / number;
      setPrice(priceForOne);
      setQuantity(number);
      const ff = priceForOne * number;
      setFinal(Number.isFinite(ff) ? ff.toFixed(0) : "0");
    } else {
      const p = Number(item?.price || 0);
      setPrice(p);
      setQuantity(1);
      setFinal(Number.isFinite(p) ? p.toFixed(0) : "0");
    }

    // image logic: normalize URL and set local state
    const raw = item?.images?.[0]?.image || item?.image || null;
    const normalized = normalizeUrl(raw);
    if (normalized) {
      setImageSrc(normalized);
    } else {
      setImageSrc("/placeholder.png");
    }

    // console help for debugging
    // eslint-disable-next-line no-console
    console.debug("[DesktopListingCard] image src resolved:", normalized);
  }, [item]);

  const handleFavourite = async (e, product) => {
    e.stopPropagation();
    try {
      const temp = favourite?.map((x) => x?.product?._id).indexOf(product?._id);
      if (temp === -1 || temp === undefined || temp === null) {
        await addToFav(product);
        getFavourite();
      } else {
        await removeFromFav(product?._id);
        getFavourite();
      }
    } catch (err) {
      console.error("fav error:", err);
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
    try {
      await addToCart(item, quantity, price);
    } catch (err) {
      console.error("addToCart error:", err);
    }
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

  // safe MRP/SP retrieval
  const MRP = item?.priceList?.[0]?.MRP ?? null;
  const SP = item?.priceList?.[0]?.SP ?? null;
  const packNumber = item?.priceList?.[0]?.number ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{
          position: "relative",
          height: "200px",
          width: "300px",
          cursor: "pointer",
        }}
      >
        <div
          onClick={handleViewProduct}
          style={{ cursor: "pointer" }}
          aria-hidden
        >
          <Image
            src={imageSrc}
            alt={item?.name || "product image"}
            width={250}
            height={250}
            loading="lazy"
            style={{ objectFit: "contain" }}
            priority={false}
            // unoptimized avoids Next's image optimizer (useful for many external hosts)
            unoptimized
            // When next/Image raises an error (404/CORS), swap to local placeholder
            onError={() => {
              // eslint-disable-next-line no-console
              console.warn(
                "[DesktopListingCard] Image load failed, using placeholder:",
                imageSrc
              );
              setImageSrc("/placeholder.png");
            }}
          />
        </div>

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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faHeart}
              onClick={(e) => handleFavourite(e, item)}
              style={{
                color: checkFav(item?._id) ? "red" : "grey",
                width: "15px",
                height: "15px",
                paddingRight: "15px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        {MRP != null &&
          SP != null &&
          Number(MRP) > 0 &&
          Number(MRP) !== Number(SP) && (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{
                backgroundColor: "#E92227",
                position: "absolute",
                right: 0,
                top: 0,
                width: "41px",
                height: "43px",
                borderBottomLeftRadius: "9px",
              }}
            >
              <div
                style={{ width: "25px", height: "24px", textAlign: "center" }}
              >
                <p className={styles.offtext}>
                  {Math.round(((Number(MRP) - Number(SP)) / Number(MRP)) * 100)}
                  % <br />
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
            {brandName()} {item?.name} {item?.model}{" "}
            {packNumber ? `(Pack of ${packNumber})` : ""}
          </p>
        </div>

        <div
          className="px-3 mb-3 d-flex flex-column align-items-start justify-content-center"
          style={{ height: "40px" }}
        >
          <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
            <div className="m-0 d-flex flex-row align-items-center justify-content-start">
              <s>
                <p className={styles.pricetext1}>{MRP ? `₹${MRP}` : ""}</p>
              </s>
            </div>

            <div className="m-0 d-flex flex-row align-items-center justify-content-start">
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
  );
}

export default React.memo(DesktopListingCard);

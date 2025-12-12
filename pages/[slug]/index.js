"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { getService, PRODUCTION } from "../../services/service";
import Head from "next/head";
import Info from "./Info";
import BuySection from "./BuySection";
import RelatedSection from "./RelatedSection";
import { addToCart } from "../../utils/cart";
import { addToFav, getFav, removeFromFav } from "../../utils/favourites";
import ShareModal from "./shareModal";
import { toast } from "react-toastify";
import Image from "next/image";

export async function getServerSideProps(context) {
  const { query } = context;
  const res = await getService(`product/get/${query.slug}`);
  //   const deal = await getService("deal/all");
  return {
    props: {
      product: res?.data ? res?.data?.data : {},
    },
  };
}

const Productpage = ({ product }) => {
  const [priceList, setPriceList] = useState([]);
  const [price, setPrice] = useState(0);
  const [MRP, setMRP] = useState(0);
  const [stock, setStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favourite, setFavourite] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedPackWeight, setSelectedPackWeight] = useState(1);
  const [packSize, setSelectedPackSize] = useState(0);
  const [share, setShare] = useState(false);
  const [widt, setWidt] = useState();
  const [userName, setUserName] = useState();
  const [userEmail, setUserEmail] = useState();
  const [userMobileNo, setUserMobileNo] = useState();
  const breakpoint = 700;

  const getFavourite = async () => {
    const result = await getFav();
    if (result !== null) {
      setFavourite(result);
    }
  };

  useEffect(() => {
    if (product) {
      if (product?.priceList?.length > 0) {
        setPriceList(product?.priceList);
        setPrice(product?.priceList?.[0]?.SP);
        setMRP(product?.priceList?.[0]?.MRP);
        setQuantity(1);
        setSelectedNumber(product?.priceList?.[0]?.number);
        setSelectedPackWeight(product?.priceList?.[0]?.pack_weight);
        setStock(product?.priceList?.[0]?.stock_quantity);
        setSelectedPackSize(product?.priceList?.[0]?.number);
      } else {
        setPrice(product?.price);
        setQuantity(1);
      }
    }
    getFavourite();
  }, [product]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidt(window.innerWidth);
      const handleResizeWindow = () => setWidt(window.innerWidth);
      window.addEventListener("resize", handleResizeWindow);
      return () => {
        window.removeEventListener("resize", handleResizeWindow);
      };
    }
  }, []);

  const handlePlus = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleMinus = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleCart = async (e) => {
    e.stopPropagation();

    if (quantity > stock) {
      toast.error("Quantity selected is not in stock.");
      return;
    }

    const brand = product?.brand?._id;
    const category = product?.category;

    await addToCart(
      product,
      quantity,
      price,
      selectedPackWeight,
      packSize,
      selectedNumber,
      brand,
      category,
      stock
    );

    window.location.reload();
  };

  const checkFav = (id) => {
    const temp = favourite?.map((x) => x?.product?._id).indexOf(id);
    return !(temp === -1 || temp === undefined || temp === null);
  };

  const handleFavourite = async (e, prod) => {
    e.stopPropagation();
    const temp = favourite?.map((x) => x?.product?._id).indexOf(prod?._id);
    if (temp === -1 || temp === undefined || temp === null) {
      await addToFav(prod);
      getFavourite();
    } else {
      await removeFromFav(prod?._id);
      getFavourite();
    }
  };

  const handleNumberChange = (event) => {
    const newNumber = parseInt(event.target.value, 10);
    setSelectedNumber(newNumber);

    const selectedPriceData = priceList.find(
      (item) => item.number === newNumber
    );

    if (selectedPriceData) {
      setSelectedPackWeight(selectedPriceData.pack_weight);
      setSelectedPackSize(newNumber);
      setPrice(selectedPriceData.SP);
      setMRP(selectedPriceData.MRP);
      setStock(selectedPriceData.stock_quantity);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleShare = () => {
    setShare(true);
    document.body.style.overflow = "hidden";
  };

  const handleClose = () => {
    setShare(false);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const token = localStorage.getItem("PIToken");
    // token is fetched but not used currently – kept in case of future use

    const userData = JSON.parse(localStorage.getItem("PIUser"));

    if (userData && userData.first_name) {
      const fullName = `${userData.first_name} ${userData.last_name}`;
      setUserName(fullName);
      setUserEmail(userData.email_address);
      setUserMobileNo(userData.mobile_number);
    }
  }, []);

  const handleNotifyMe = async () => {
    const payload = {
      product_id: product?._id,
      name: userName,
      email_address: userEmail,
      mobile_number: userMobileNo,
    };

    try {
      const response = await fetch(PRODUCTION + "notify/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("You will be notified once in stock.");
      } else {
        console.error("Failed to send notification.");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const discountPercent =
    MRP && price ? Math.round(((MRP - price) / MRP) * 100) : 0;

  return (
    <>
      <Head>
        <title>
          {product?.brand?.name} {product?.name} {product?.model} - Prem
          Packaging - Innovation In Action
        </title>
        <meta name="description" content={product?.meta_description} />
        <meta property="og:title" content={product?.meta_title} />
      </Head>
      <div>
        {share && <ShareModal data={product} handleClose={handleClose} />}
      </div>
      <div
        style={{
          paddingTop: `${widt > breakpoint ? "120px" : "150px"}`,
          fontFamily: "Montserrat",
        }}
      >
        <div className="row mt-3 p-0">
          <div className={"container-fluid ml-0 mr-0 mb-0 " + styles.mainbody}>
            <div className={"mt-2 " + styles.pathtextlayout}>
              <p className={styles.catalogpath}>
                <a href="/" style={{ textDecoration: "none", color: "black" }}>
                  Homepage
                </a>{" "}
                / Product Listing / {product?.name}
              </p>
            </div>
            <div className={"row m-0 " + styles.firstdetaillayout}>
              <div
                className={
                  "col-6 p-0 d-flex flex-column justify-content-start align-items-start " +
                  styles.detailpicturelayout
                }
              >
                <p className={styles.productitlemobile}>
                  {product?.brand?.name} {product?.name} {product?.model}
                </p>

                <div
                  className={
                    "d-flex justify-content-center align-items-center mt-5 " +
                    styles.detailpicturelayouta
                  }
                >
                  <Image
                    src={
                      product?.images?.[selectedImageIndex]?.image ||
                      "/placeholder.png"
                    }
                    className={`${styles.zoomEffect} ${styles.mainproductimage}`}
                    alt={product?.name || "Product Image"}
                    width={500}
                    height={500}
                    loading="lazy"
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "30px",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  {product?.images?.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className="image-box"
                      style={{
                        border: "1px solid #D9D9D9",
                        cursor: "pointer",
                      }}
                    >
                      <Image
                        src={image.image}
                        alt={`Image ${index + 1}`}
                        width={100}
                        height={100}
                        loading="lazy"
                        className={
                          index === selectedImageIndex ? "selected-image" : ""
                        }
                      />
                    </div>
                  ))}
                </div>
                <div
                  className={"w-100 " + styles.mobileonly}
                  style={{
                    backgroundColor: "#EBEBEB",
                    height: "1px",
                    marginTop: "20px",
                  }}
                ></div>
              </div>
              <div className={"col-6 " + styles.detailsettingslayout}>
                <div className="row p-0 m-0">
                  <div
                    className="p-0 m-0"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "30px",
                      alignItems: "center",
                    }}
                  >
                    <div className={styles.productitle}>
                      {product?.brand?.name} {product?.name} {product?.model}
                    </div>
                    <div onClick={handleShare} style={{ cursor: "pointer" }}>
                      <Image
                        src="/icons/share-icon.svg"
                        alt="Share"
                        width={24}
                        height={24}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="p-0 d-flex flex-row justify-content-between">
                    <div className={styles.productpricediv}>
                      <p className={"m-0 " + styles.pricetag}>Price</p>
                      <p className={"m-0 " + styles.pricetag}> </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                        }}
                      >
                        <p className={styles.productmrp}>
                          MRP : <s>₹{MRP}</s>
                        </p>

                        <p className={styles.productprice}>
                          ₹{Math.round(price)}
                        </p>

                        <p className={styles.productDiscount}>
                          {discountPercent}% Off
                        </p>
                      </div>

                      <div className="mt-2">
                        <label
                          htmlFor="selectNumber"
                          style={{
                            paddingRight: "10px",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          Select Pack Size :{" "}
                        </label>
                        <select
                          id="selectNumber"
                          value={selectedNumber}
                          onChange={handleNumberChange}
                          style={{ padding: "5px" }}
                        >
                          {priceList.map((item, index) => (
                            <option key={index} value={item.number}>
                              {item.number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tapes Main View Start */}
                  <div className="p-0 mt-3">
                    {product &&
                      (product?.category === "6557df71301ec4f2f4266145" ||
                        product?.category === "6557df64301ec4f2f4266141" ||
                        product?.category === "6642e8f665f20fe41ab417bc") && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p style={{ fontWeight: "400", fontSize: "16px" }}>
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Print -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.print}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Paper Bag Main View Start */}
                    {product &&
                      product?.category === "6557df46301ec4f2f4266139" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in Inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_inch === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Poly Bag Main View Start */}
                    {product &&
                      product?.category === "6557df4f301ec4f2f426613d" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in Inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Labels Main View Start */}
                    {product &&
                      product?.category === "6557deb6301ec4f2f4266135" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                              fontSize: "16px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in Inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Corrugated Box Main View Start */}
                    {product &&
                      product?.category === "6557deab301ec4f2f4266131" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in Inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Carry Handle Tape Main View Start */}
                    {product &&
                      product?.category === "67cac1fc2a4e1c9ef44a92b5" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_inch === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Food Wrapping Paper Main View Start */}
                    {product &&
                      product?.category === "679ca70f2833ca433fa0aa9c" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Brand -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.brand?.name === ""
                                ? "Not Available"
                                : product?.brand?.name}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_inch === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Carry Bags Main View Start */}
                    {product &&
                      product?.category === "689d73214687bb4e437542e0" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in inches -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_inch === ""
                                ? "Not Available"
                                : product?.size_inch}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              marginTop: "0px",
                              gap: "5px",
                            }}
                          >
                            <p style={{ fontWeight: "600", fontSize: "16px" }}>
                              Dimension in mm -{" "}
                            </p>
                            <p
                              style={{
                                fontWeight: "400",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {product?.size_mm === ""
                                ? "Not Available"
                                : product?.size_mm}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Common Field: About Item */}
                    {product && product?.aboutItem !== null && (
                      <p>
                        <span style={{ fontWeight: "600", fontSize: "16px" }}>
                          About the Item -{" "}
                        </span>
                        <span style={{ fontWeight: "400", fontSize: "16px" }}>
                          {product?.aboutItem === ""
                            ? "Not Available"
                            : product?.aboutItem}
                        </span>
                      </p>
                    )}
                    <div>
                      <p
                        style={{
                          color: stock > 0 ? "green" : "red",
                          fontSize: "24px",
                          fontWeight: "600",
                        }}
                      >
                        {stock > 0 ? "In Stock" : "Out of Stock"}
                      </p>
                    </div>
                  </div>

                  <div className="row p-0 m-0 mt-2">
                    <div
                      className={
                        "col px-0 " + styles.incrementandaddtocartlayout
                      }
                    >
                      {stock <= 0 || isNaN(stock) ? (
                        <div
                          className="p-0 m-0 d-flex flex-row bg-light"
                          style={{
                            width: "200px",
                            height: "44px",
                            opacity: "0.5",
                          }}
                        >
                          <div
                            className="h-100 d-flex flex-row justify-content-center align-items-center"
                            style={{
                              width: "50px",
                              border: "1px solid rgba(0, 0, 0, 0.50)",
                              cursor: "pointer",
                            }}
                          >
                            <Image
                              src="/icon-minus.png"
                              width={24}
                              height={24}
                              alt="Minus"
                              loading="lazy"
                            />
                          </div>
                          <div
                            className="h-100 d-flex flex-row justify-content-center align-items-center"
                            style={{
                              width: "100px",
                              border: "1px solid rgba(0, 0, 0, 0.50)",
                            }}
                          >
                            <p className={styles.incrementnumber}>{quantity}</p>
                          </div>
                          <div
                            className="h-100 d-flex flex-row justify-content-center align-items-center"
                            style={{
                              width: "50px",
                              border: "1px solid rgba(0, 0, 0, 0.50)",
                              cursor: "pointer",
                              backgroundColor: "#182C5A",
                            }}
                          >
                            <Image
                              src="/icon-plus.png"
                              width={24}
                              height={24}
                              alt="Plus"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="p-0 m-0 d-flex flex-row bg-light"
                          style={{ width: "200px", height: "44px" }}
                        >
                          <div
                            className="h-100 d-flex flex-row justify-content-center align-items-center"
                            style={{
                              width: "50px",
                              border: "1px solid rgba(0, 0, 0, 0.50)",
                              cursor: "pointer",
                            }}
                          >
                            <Image
                              src="/icon-minus.png"
                              width={24}
                              height={24}
                              alt="Minus"
                              loading="lazy"
                              onClick={handleMinus}
                            />
                          </div>
                          <div
                            className="h-100 d-flex flex-row justify-content-center align-items-center"
                            style={{
                              width: "100px",
                              border: "1px solid rgba(0, 0, 0, 0.50)",
                            }}
                          >
                            <p className={styles.incrementnumber}>{quantity}</p>
                          </div>
                          <div
                            className="h-100 d-flex flex-row justify-content-center align-items-center"
                            style={{
                              width: "50px",
                              border: "1px solid rgba(0, 0, 0, 0.50)",
                              cursor: "pointer",
                              backgroundColor: "#182C5A",
                            }}
                          >
                            <Image
                              src="/icon-plus.png"
                              width={24}
                              height={24}
                              alt="Plus"
                              loading="lazy"
                              onClick={handlePlus}
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={
                          "d-flex flex-row align-items-center " +
                          styles.addtocartbtndetailslayout
                        }
                      >
                        {stock <= 0 || isNaN(stock) ? (
                          <button
                            className={styles.addtocartbtn}
                            onClick={handleNotifyMe}
                          >
                            Notify Me
                          </button>
                        ) : (
                          <button
                            className={styles.addtocartbtn}
                            onClick={handleCart}
                          >
                            Add To Cart
                          </button>
                        )}
                        <div
                          className="d-flex justify-content-center align-items-center "
                          style={{
                            marginLeft: "14px",
                            width: "40px",
                            height: "40px",
                            border: "1px solid rgba(0, 0, 0, 0.50)",
                          }}
                        >
                          {checkFav(product?._id) ? (
                            <FontAwesomeIcon
                              icon={faHeart}
                              style={{
                                color: "red",
                                cursor: "pointer",
                              }}
                              onClick={(e) => handleFavourite(e, product)}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faHeart}
                              style={{
                                color: "grey",
                                cursor: "pointer",
                              }}
                              onClick={(e) => handleFavourite(e, product)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row p-0 m-0 mt-3">
                    <div className="w-100 d-flex flex-column align-items-center">
                      <div
                        className="w-100 h-50 d-flex flex-row align-items-center"
                        style={{
                          border: "1px solid #808080",
                        }}
                      >
                        <p
                          style={{
                            marginLeft: "15px",
                            marginBottom: "0px",
                            color: "#000",
                            fontFamily: "Montserrat",
                            fontSize: "16px",
                            fontStyle: "normal",
                            fontWeight: "500",
                          }}
                          className="pt-3 pb-3"
                        >
                          Price is excluding GST
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row p-0 m-0">
                    <div className="w-100 d-flex flex-column align-items-center">
                      <div
                        className="w-100 h-50 d-flex flex-row align-items-center"
                        style={{
                          border: "1px solid #808080",
                        }}
                      >
                        <Image
                          src="/deliverytruck-img.png"
                          width={40}
                          height={40}
                          style={{ marginLeft: "16px" }}
                          alt="Delivery Truck"
                          loading="lazy"
                        />
                        <p
                          style={{
                            marginLeft: "15px",
                            marginBottom: "0px",
                            color: "#000",
                            fontFamily: "Montserrat",
                            fontSize: "16px",
                            fontStyle: "normal",
                            fontWeight: "500",
                            lineHeight: "24px",
                          }}
                          className="pt-3 pb-3"
                        >
                          {product?.delivery_time
                            ? `Delivery within ${product.delivery_time}`
                            : "Delivery within 7 - 10 working days"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row p-0 m-0">
                    <div className="col-md-3 text-center mt-3">
                      <Image
                        src="/icons/free-delivery.png"
                        height={50}
                        width={50}
                        alt="Free Delivery"
                        loading="lazy"
                      />
                      <br />
                      <span>Free Delivery</span>
                    </div>
                    <div className="col-md-3 text-center mt-3">
                      <Image
                        src="/icons/secure-transaction.png"
                        height={50}
                        width={50}
                        alt="Secured Transaction"
                        loading="lazy"
                      />
                      <br />
                      <span>Secured Transaction</span>
                    </div>
                    <div className="col-md-3 text-center mt-3">
                      <Image
                        src="/icons/no-return.png"
                        height={50}
                        width={50}
                        alt="No Returns"
                        loading="lazy"
                      />
                      <br />
                      <span>No Returns</span>
                    </div>
                    <div className="col-md-3 text-center mt-3">
                      <Image
                        src="/icons/recyclable.png"
                        height={50}
                        width={50}
                        alt="100% Recyclable"
                        loading="lazy"
                      />
                      <br />
                      <span>100% Recyclable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-5 m-0">
              <Info product={product} weight={selectedPackWeight} />
            </div>

            <BuySection product={product} />
            <RelatedSection product={product} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Productpage;

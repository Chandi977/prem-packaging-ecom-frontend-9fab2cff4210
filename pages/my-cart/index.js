"use client"; // This is a client component 👈🏽
import React from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useEffect } from "react";
import {
  alterQuantity,
  getCart,
  removeFromCart,
  updateCart,
  updateShippingDiscount,
  updateAllDiscount,
  updateProductTypeAllDiscount,
  removeCouponCode,
} from "../../utils/cart";
import { getService, postService } from "../../services/service";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Head from "next/head";
import { PRODUCTION } from "../../services/service";
import axios from "axios";

const Cartpage = () => {
  const [widt, setWidt] = useState();
  const [pincode, setPincode] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [token, setToken] = useState();
  const router = useRouter();
  const [cart, setCart] = useState();
  const [cartProducts, setCartProducts] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [dataCoupon, setCouponData] = useState();
  const breakpoint = 700;
  const [couponUsed, setCouponUsed] = useState([]);
  const currentDate = new Date().toISOString();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidt(window.innerWidth);
      const handleResizeWindow = () => setWidt(window.innerWidth);
      // subscribe to window resize event "onComponentDidMount"

      window.addEventListener("resize", handleResizeWindow);
      return () => {
        // unsubscribe "onComponentDestroy"
        window.removeEventListener("resize", handleResizeWindow);
      };
    }
  }, []);

  const getUser = async () => {
    const User = JSON.parse(localStorage.getItem("PIUser"));
    // setCouponUsed(User?.couponUsed);
    const user = await getService(`getuser/${User?._id}`);
    // console.log("58", user)
    setCouponUsed(user?.data?.data?.couponUsed);
    // if (user?.data?.success) {
    //   setUserAddresss(user?.data?.data?.contact_address);
    // }
  };

  useEffect(() => {
    const token = localStorage.getItem("PIToken");
    if (token) {
      getUser();
    } else {
      // Redirect to sign-in page if not logged in
      router.push("/login");
    }
    setToken(token);
  }, []);

  const handleCart = async () => {
    const c = await getCart();
    if (c !== null) {
      setCart(c);
      setCartProducts(c?.products);
      console.log("CART COMING", c);
      // OUT OF STOCK STATE MANAGEMENT HERE
      // {
      //   cart?.products?.map((product) => product);
      // }

      // const packSizeQuantityMap = {};
      // cart?.products?.forEach((item) => {
      //   packSizeQuantityMap[item.packSize] = item.quantity;
      // });
      // console.log("MAP CREATED: ", packSizeQuantityMap);
    }
  };

  useEffect(() => {
    handleCart();
    // console.log(dataCoupon)
  }, []);

  const handleAlter = async (value, index) => {
    if (
      value < 1 ||
      value === "" ||
      value === null ||
      value === undefined ||
      value === NaN
    ) {
      value = 1;
    }
    const result = await alterQuantity(index, Number(value));
    if (result) {
      handleCart();
    }
  };

  const handleRemove = async (id) => {
    const result = await removeFromCart(id);
    if (result) {
      handleCart();

      toast.success("Item removed from cart.");
      window.location.reload();
    }
  };

  const handleApplyCoupon = async () => {
    //console.log("Sending coupon code:", couponCode);
    console.log("Cart Products", cartProducts);
    // console.log("122", couponUsed);

    try {
      const response = await axios.get(
        `${PRODUCTION}coupon/get/code/${couponCode}`
      );
      const couponData = response?.data?.data;
      setCouponData(couponData);

      if (response.status === 200) {
        //console.log("Coupon Data:", dataCoupon);
        if (couponUsed) {
          for (let i = 0; i < couponUsed.length; i++) {
            if (couponUsed[i] === couponData?.couponCode) {
              toast.error("Coupon already used.");
              return;
            }
          }
        }
        if (couponData?.startDate >= currentDate) {
          toast.error("Coupon not active yet.");
          return;
        }

        if (currentDate >= couponData?.endDate) {
          toast.error("Coupon expired.");
          return;
        }

        if (cart?.total_amount < couponData?.minimumOrderValue) {
          toast.error(
            `Minimum Cart Value should be ${couponData?.minimumOrderValue}`
          );
          return;
        }
        if (
          couponData?.startDate <= currentDate &&
          currentDate <= couponData?.endDate &&
          cart?.total_amount > couponData?.minimumOrderValue
        ) {
          //console.log("checking1")
          if (couponData?.type === "product") {
            const productUpdates = [];

            cartProducts?.forEach(async (item) => {
              if (
                // Check if product type is BRAND or CATEGORY
                (couponData?.productType === "brand" &&
                  item?.brand === couponData?.brand) ||
                (couponData?.productType === "category" &&
                  item?.category === couponData?.category)
              ) {
                // console.log("check1");
                const discountedPrice = calculateDiscountedPrice(
                  item,
                  couponData
                );
                productUpdates.push({
                  product: item.product._id,
                  discountPrice: discountedPrice,
                });

                await updateCart(
                  productUpdates,
                  couponData?.couponCode,
                  "product",
                  couponData?.noOfUse
                ); // Send all product updates to updateCart function
                toast.success("Coupon Applied!");
                window.location.reload();
              } else if (couponData?.productType === "all") {
                const totalOrderValue = cart?.total_amount;

                if (couponData?.discountPercentage) {
                  const discountValue =
                    (totalOrderValue * couponData.discountPercentage) / 100;

                  let discountedOrderValue;

                  if (discountValue > couponData?.maxDiscountCap) {
                    discountedOrderValue =
                      totalOrderValue - couponData?.maxDiscountCap;
                  } else {
                    discountedOrderValue = totalOrderValue - discountValue;
                  }

                  await updateProductTypeAllDiscount(
                    discountedOrderValue,
                    couponData?.couponCode,
                    "all",
                    couponData?.noOfUse
                  );
                  toast.success("Coupon Applied!");
                  window.location.reload();
                  // console.log(discountedOrderValue);
                } else if (couponData?.discountPrice) {
                  const discountedOrderValue =
                    totalOrderValue - couponData?.discountPrice;
                  await updateProductTypeAllDiscount(
                    discountedOrderValue,
                    couponData?.couponCode,
                    "all",
                    couponData?.noOfUse
                  );
                  toast.success("Coupon Applied!");
                  window.location.reload();
                  // console.log(discountedOrderValue);
                }

                // Optionally reload the page after applying the discount
                // window.location.reload();
              } else {
                // console.log("check3");
                toast.error(
                  "Coupon not applicable for the products in the cart. "
                );
                return;
              }
            });
          }

          if (couponData?.type === "shipping") {
            //console.log("check1")
            if (couponData?.discountPrice) {
              //console.log("check2")
              const shippingDiscountPrice = couponData?.discountPrice;
              await updateShippingDiscount(
                shippingDiscountPrice,
                0,
                couponData?.couponCode,
                "shipping",
                couponData?.noOfUse
              );
              toast.success("Coupon Applied!");
              window.location.reload();
            } else {
              //console.log("check3")
              const shippingDiscountPercentage = couponData?.discountPercentage;
              await updateShippingDiscount(
                0,
                shippingDiscountPercentage,
                couponData?.couponCode,
                "shipping",
                couponData?.maxDiscountCap,
                couponData?.noOfUse
              );
              toast.success("Coupon Applied!");
              window.location.reload();
            }
          }

          if (couponData?.type === "both") {
            //console.log("check1")
            if (couponData?.discountPrice) {
              //console.log("check2")
              const totalDiscountPrice = couponData?.discountPrice;
              await updateAllDiscount(
                totalDiscountPrice,
                0,
                couponData?.couponCode,
                "both",
                couponData?.maxDiscountCap,
                couponData?.noOfUse
              );
              toast.success("Coupon Applied!");
              window.location.reload();
            } else {
              //console.log("check3")
              const totalDiscountPercentage = couponData?.discountPercentage;
              await updateAllDiscount(
                0,
                totalDiscountPercentage,
                couponData?.couponCode,
                "both",
                couponData?.maxDiscountCap,
                couponData?.noOfUse
              );
              toast.success("Coupon Applied!");
              window.location.reload();
            }
          }

          // toast.success("Coupon Applied!");
        } else {
          toast.error("Minimum order value not matched.");
          console.error();
        }
      } else {
        toast.error("Invalid Coupon");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Invalid Coupon");
    }
  };

  const removeCoupon = async () => {
    await removeCouponCode();
    toast.success("Coupon Removed");
    window.location.reload();
  };

  const calculateDiscountedPrice = (product, couponData) => {
    //console.log(product);
    let discountedPrice = product.price;

    if (couponData?.discountPercentage) {
      const discountPercentage = couponData?.discountPercentage;
      discountedPrice -= (discountPercentage / 100) * product.price;
    }

    if (couponData?.discountPrice) {
      discountedPrice -= couponData?.discountPrice;
    }

    if (discountedPrice < 0) {
      discountedPrice = 0;
    }

    return discountedPrice;
  };

  let isOutOfStock = false;

  const checkstocks = () => {
    cart?.products?.forEach((item) => {
      item.product.priceList.forEach((inneritem) => {
        if (inneritem.number == item.packSize) {
          if (inneritem.stock_quantity < item.quantity) {
            isOutOfStock = true;
            return;
          }
        }
      });
      if (isOutOfStock) return;
    });
    return isOutOfStock;
  };

  const stockCheckResult = checkstocks();

  return (
    <>
      <Head>
        <title>My Cart | store.prempackaging</title>
        <meta name="title" content="My Cart" />
        <meta
          name="description"
          content="Review and manage your selected packaging items in your cart. Edit quantities, apply discounts, and proceed easily to secure checkout."
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "150px" : "150px"}` }}>
        <div className="row mt-5">
          <div className={"row " + styles.mainbody}>
            <div className={"mt-2 mx-0 " + styles.mainlayout1}>
              <p className={styles.catalogpath}>
                {" "}
                <a href="/" style={{ textDecoration: "none", color: "black" }}>
                  Homepage{" "}
                </a>
                / My Cart
              </p>
            </div>
            <p
              className={styles.divinvisible}
              style={{
                color: "#182C5A",
                fontSize: "40px",
                fontStyle: "normal",
                fontWeight: "750",
                lineHeight: "54px",
                letterSpacing: "1.08px",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              YOUR SHOPPING CART
            </p>
            <div
              className={"row mx-2 " + styles.divinvisible}
              style={{
                height: "72px",
                borderRadius: "4px",
                boxShadow: "0px 1px 13px 0px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="col-3 my-auto">
                <p
                  className="m-0"
                  style={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Product
                </p>
              </div>
              <div className="col-2 d-flex justify-content-center align-items-center">
                <p className="m-0" style={{ fontWeight: "bold" }}>
                  Price
                </p>
              </div>
              <div className="col-2 d-flex justify-content-center align-items-center">
                <p className="m-0" style={{ fontWeight: "bold" }}>
                  Quantity
                </p>
              </div>
              <div className="col-2 d-flex justify-content-center align-items-center">
                <p className="m-0" style={{ fontWeight: "bold" }}>
                  Pack Weight
                </p>
              </div>
              <div className="col-2 d-flex justify-content-end align-items-center">
                <p className="m-0" style={{ fontWeight: "bold" }}>
                  {" "}
                  Subtotal
                </p>
              </div>
              <div className="col-1 d-flex justify-content-end align-items-center">
                <p className="m-0"></p>
              </div>
            </div>
            {cart?.products?.map((item, index) => {
              // console.log("ITEM COMING: ", item);
              return (
                <div
                  className={"row mt-5 mx-2 " + styles.divinvisible}
                  style={{
                    height: "100px",
                    borderRadius: "4px",
                    boxShadow: "0px 1px 13px 0px rgba(0, 0, 0, 0.05)",
                  }}
                  key={index}
                >
                  <div className="col-3 d-flex justify-content-start align-items-center">
                    <div className="d-flex justify-content-start align-items-center">
                      <img
                        src={item?.product?.images?.[0]?.image}
                        width="74px"
                        height="59px"
                      />
                      <p
                        className="px-2 m-0"
                        style={{
                          color: "#000",
                          fontSize: "16px",
                          fontStyle: "normal",
                          fontWeight: "700",
                          lineHeight: "24px",
                          textTransform: "capitalize",
                        }}
                      >
                        {item?.product?.brand === "6557dbbc301ec4f2f4266107"
                          ? "Flipkart"
                          : item?.product?.brand === "6557dbcc301ec4f2f426610b"
                          ? "Myntra"
                          : item?.product?.brand === "6557dbad301ec4f2f4266103"
                          ? "Amazon"
                          : item?.product?.brand === "6582c8580ab82549a084894f"
                          ? "Ajio"
                          : item?.product?.brand === "6557dbf9301ec4f2f426611e"
                          ? "Rollabel™"
                          : item?.product?.brand === "6557dc10301ec4f2f4266122"
                          ? "Pack-Secure"
                          : item?.product?.brand === "6582c8750ab82549a0848953"
                          ? "PackPro™"
                          : item?.product?.brand}{" "}
                        {item?.product?.name} {item?.product?.model}
                      </p>
                      {item.product.priceList.some((inneritem) => {
                        if (inneritem.number == item.packSize) {
                          if (inneritem.stock_quantity < item.quantity) {
                            return true;
                          }
                        }
                        return false;
                      }) && (
                        <p className="text-danger" style={{ fontSize: "14px" }}>
                          Out of Stock
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PRICE VALUE START */}
                  <div className="col-2 d-flex justify-content-center align-items-center">
                    <p className="m-0">₹{Math.round(item?.price)}</p>
                  </div>
                  {/* PRICE VALUE END */}

                  {/* QUANTITY VALUE START */}
                  <div className="col-2 d-flex justify-content-center align-items-center">
                    <input
                      type="text"
                      style={{
                        width: "70px",
                        height: "40px",
                        paddingLeft: "15px",
                      }}
                      value={item?.quantity}
                      disabled
                      // onChange={(e) =>
                      //   handleAlter(e.target.value, item?.product?._id)
                      // }
                    ></input>
                  </div>
                  {/* QUANTITY VALUE END */}

                  {/* PACKWEIGHT VALUE START */}
                  <div className="col-2 d-flex justify-content-center align-items-center">
                    <p className="m-0">{Math.ceil(item?.totalPackWeight)}kg</p>
                  </div>
                  {/* PACKWEIGHT VALUE END */}

                  {/* SUBTOTAL VALUE START  */}
                  <div className="col-2 d-flex justify-content-end align-items-center">
                    <p className="m-0" style={{ fontWeight: "700" }}>
                      ₹
                      {cart?.appliedCoupon &&
                      cart?.couponType === "product" &&
                      item?.discountPrice !== 0 ? (
                        <>
                          <s>{Math.round(item?.price * item?.quantity)}</s>
                          <span className="ml-1 fs-5 fw-bold">
                            {Math.round(item?.discountPrice * item?.quantity)}
                          </span>
                        </>
                      ) : (
                        <>{Math.round(item?.price * item?.quantity)}</>
                      )}
                    </p>
                  </div>
                  {/* SUBTOTAL VALUE END */}

                  {/* DELETE BTN START */}
                  <div className="col-1 d-flex justify-content-end align-items-center">
                    <p className="m-0">
                      <i
                        style={{
                          color: "red",
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRemove(item?.product?._id)}
                      >
                        <AiFillDelete />
                      </i>
                    </p>
                  </div>
                  {/* DELETE BTN END */}
                </div>
              );
            })}

            {/* only for mobileview */}
            <div
              className={
                "container-fluid bg-white mt-3 py-3 mx-0 " +
                styles.webresponsiveonly
              }
              style={{
                border: "0.817px solid rgba(0, 0, 0, 0.10)",
                borderRadius: "8.17px",
              }}
            >
              <div className="row mt-3 d-flex justify-content-center align-items-center">
                <p
                  className="p-0 m-0"
                  style={{
                    width: "fit-content",
                    color: "#000",
                    fontFeatureSettings: "'liga' off",
                    fontFamily: "Montserrat",
                    fontSize: "30px",
                    fontStyle: "normal",
                    fontWeight: "700",
                    lineHeight: "38.081px",
                    letterSpacing: "0.6px",
                  }}
                >
                  Your Shopping Cart
                </p>
              </div>
              <div
                className="row mt-3"
                style={{ height: "1px", backgroundColor: "#EBEBEB" }}
              ></div>
              <div className="row py-3">
                {cart?.products?.map((item, index) => {
                  return (
                    <>
                      <div
                        className="col-3 d-flex flex-column justify-content-center align-items-center"
                        key={index}
                      >
                        <img
                          src={item?.product?.images?.[0]?.image}
                          width="74px"
                          height="59px"
                        />
                      </div>
                      <div className="col-9 py-2 d-flex flex-column justify-content-start align-items-start">
                        <div className="d-flex flex-row justify-content-between align-items-start w-100">
                          <p
                            className="m-0"
                            style={{
                              textAlign: "start",
                              width: "168px",
                              color: "#000",
                              fontSize: "16px",
                              fontStyle: "normal",
                              fontWeight: "500",
                              lineHeight: "17px",
                              textTransform: "capitalize",
                            }}
                          >
                            {item?.product?.brand === "6557dbbc301ec4f2f4266107"
                              ? "flipkart"
                              : item?.product?.brand ===
                                "6557dbcc301ec4f2f426610b"
                              ? "myntra"
                              : item?.product?.brand ===
                                "6557dbad301ec4f2f4266103"
                              ? "amazon"
                              : item?.product?.brand ===
                                "6582c8580ab82549a084894f"
                              ? "ajio"
                              : item?.product?.brand ===
                                "6557dbf9301ec4f2f426611e"
                              ? "rollabel"
                              : item?.product?.brand ===
                                "6557dc10301ec4f2f4266122"
                              ? "pack-secure"
                              : item?.product?.brand ===
                                "6582c8750ab82549a0848953"
                              ? "PackPro"
                              : item?.product?.brand}{" "}
                            {item?.product?.name} {item?.product?.model}
                          </p>
                          <p
                            className="m-0"
                            style={{
                              color: "#000",
                              fontFeatureSettings: "'liga' off",
                              fontSize: "20px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              lineHeight: "17.726px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            ₹{Math.round(item?.price * item?.quantity)}
                          </p>
                        </div>
                        <div className="mt-3 py-1 d-flex flex-row justify-content-start align-items-start w-100">
                          <input
                            style={{
                              width: "35px",
                              paddingLeft: "10px",
                              height: "30px",
                            }}
                            type="text"
                            value={item?.quantity}
                            // onChange={(e) =>
                            //   handleAlter(e.target.value, item?.product?._id)
                            // }
                          ></input>

                          <div
                            className="h-100 mx-3"
                            style={{ borderLeft: "2px solid #D9D9D9" }}
                          ></div>
                          <p className="m-0">
                            {Math.ceil(item?.totalPackWeight)}kg
                          </p>

                          <div
                            className="h-100 mx-3"
                            style={{ borderLeft: "2px solid #D9D9D9" }}
                          ></div>
                          <p
                            className="m-0"
                            style={{
                              color: "#182C5A",
                              fontFeatureSettings: "'liga' off",
                              fontSize: "14px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#E92227",
                              lineHeight: "22.058px",
                              letterSpacing: "0.175px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleRemove(item?.product?._id)}
                          >
                            Delete
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>

              <div
                className="row mt-3"
                style={{ height: "1px", backgroundColor: "#EBEBEB" }}
              ></div>
              <div className="row py-3">
                <div className="col-8 d-flex justify-content-start align-items-center">
                  <p
                    className="m-0"
                    style={{
                      width: "fit-content",
                      color: "#000",
                      fontFeatureSettings: "'liga' off",
                      fontSize: "20px",
                      fontStyle: "normal",
                      fontWeight: "600",
                      lineHeight: "17.726px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Subtotal(
                    {cart?.products?.length ? cart?.products?.length : 0}{" "}
                    items):
                  </p>
                </div>
                <div className="col-4 d-flex justify-content-end align-items-center">
                  <p
                    className="m-0"
                    style={{
                      width: "fit-content",
                      color: "#000",
                      fontFeatureSettings: "'liga' off",
                      fontSize: "25px",
                      fontStyle: "normal",
                      fontWeight: "600",
                      lineHeight: "17.726px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ₹{Math.round(cart?.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className={"row bg-white my-5 p-0 " + styles.lastlayout}>
              <div className={"col-6 " + styles.lastlayoutfirsthalf}>
                <h2
                  className="text-center"
                  style={{
                    color: "#182C5A",
                    fontSize: "40px",
                    fontStyle: "normal",
                    fontWeight: "750",
                    lineHeight: "54px",
                    letterSpacing: "1.08px",
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginBottom: "30px",
                  }}
                >
                  COUPON CODE
                </h2>
                <div className="row mt-3">
                  {cart?.appliedCoupon ? (
                    <>
                      <input
                        placeholder={
                          cart?.appliedCoupon
                            ? cart?.appliedCouponName
                            : "Enter Coupon Code"
                        }
                        className={`${styles.lastlayoutcouponinput}`}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled
                        style={{ opacity: "0.5", marginTop: "10px" }}
                      />
                      <button
                        className={`${styles.lastlayoutcouponbtn} ${styles.disabled}`}
                        onClick={removeCoupon}
                        style={{ marginTop: "10px" }}
                      >
                        Remove Coupon
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        placeholder="Enter Coupon Code"
                        className={styles.lastlayoutcouponinput}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{ marginTop: "10px" }}
                      />
                      <button
                        className={styles.lastlayoutcouponbtn}
                        onClick={handleApplyCoupon}
                        style={{
                          textAlign: "center",
                          marginTop: "10px",
                        }}
                      >
                        Apply Coupon Code
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className={"col-6 p-0 " + styles.lastlayoutcarttotal}>
                <div
                  className={
                    "p-0 m-0 w-100 " + styles.lastlayoutsecondhalfinner
                  }
                  style={{ height: "324px" }}
                >
                  <div className="row mt-4 mx-2">
                    <h5
                      className="m-0"
                      style={{
                        color: "var(--text-2, #000)",
                        fontStyle: "normal",
                        fontWeight: "700",
                        fontSize: "30px",
                        lineHeight: "28px",
                        textAlign: "center",
                      }}
                    >
                      Cart Total
                    </h5>
                  </div>
                  <div className="row mt-4 mx-2">
                    <div className="col d-flex justify-content-between align-items-center">
                      <p
                        className="m-0"
                        style={{ fontWeight: "500", fontSize: "20px" }}
                      >
                        Total Cart Value :
                      </p>
                      {/* <p className="m-0">₹{Math.round(cart?.total_amount)}</p> */}
                      <div>
                        {cart?.discount_amount != 0 ? (
                          <>
                            <s>{Math.round(cart?.total_amount)}</s>
                            <span className="ml-1 fs-5 fw-bold">
                              {Math.round(cart?.discount_amount)}
                            </span>
                          </>
                        ) : (
                          <p style={{ fontWeight: "700", fontSize: "20px" }}>
                            ₹ {Math.round(cart?.total_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2 mx-2">
                    <div className="col d-flex justify-content-between align-items-center">
                      <p
                        className="m-0"
                        style={{ fontWeight: "500", fontSize: "20px" }}
                      >
                        Total Cart Weight :
                      </p>
                      <p
                        className="m-0"
                        style={{ fontWeight: "700", fontSize: "20px" }}
                      >
                        {Math.ceil(cart?.totalPackWeight)} kg
                      </p>
                    </div>
                  </div>
                  {/* <div className="row mt-2 mx-2">
                  <div className="col d-flex justify-content-between align-items-center">
                    <p className="m-0">Total:</p>
                    <p className="m-0">₹{Math.round(cart?.total_amount+shippingCost)}</p>
                  </div>
                </div> */}
                  <div className="row mt-4 mx-2">
                    <div className="col d-flex justify-content-center align-items-center">
                      {stockCheckResult ? (
                        <p className="text-danger">
                          Some Items are out of stock, Cannot Place Order!
                        </p>
                      ) : (
                        <button
                          className={styles.returnToShop}
                          style={{
                            width: "253px",
                            height: "56px",
                            borderRadius: "4px",
                            border: "0px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            if (cart?.products?.length) {
                              router.push("/checkoutpage");
                            } else {
                              toast.error("Cart is empty.");
                            }
                          }}
                        >
                          Proceed to checkout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={"row mx-2 p-0 btn-lg" + styles.divinvisible}>
                <button
                  className={styles.returnToShop}
                  style={{
                    width: "214px",
                    height: "56px",
                    borderRadius: "4px",
                    border: "1px solid rgba(0, 0, 0, 0.50)",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "24px",
                  }}
                  onClick={() => router.push("/")}
                >
                  Back to Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cartpage;

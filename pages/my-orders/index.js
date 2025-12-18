import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { indianStates } from "../../assets/data";
import Banner from "./OrdersBanner";
import { getService } from "../../services/service";
import Image from "next/image";
import { format } from "date-fns";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";

const Checkoutpage = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [widt, setWidt] = useState();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOderValue, setSelectedOrderValue] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");

  const breakpoint = 700;
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

  const handleModalShow = (orderId, orderValue) => {
    setSelectedOrderId(orderId);
    setSelectedOrderValue(orderValue);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedOrderId(null);
    setShowModal(false);
  };

  const handleUtrNumberChange = (event) => {
    setUtrNumber(event.target.value);
  };

  const handleSubmitUtrNumber = () => {
    if (utrNumber.trim() === "") {
      toast.error("Please enter a UTR Number.");
    } else {
      const requestData = {
        _id: selectedOrderId,
        utrNumber: utrNumber,
        paymentStatus: "Payment Processed",
      };

      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      };

      fetch(
        "https://server.prempackaging.com/premind/api/order/update/utr",
        requestOptions
      )
        .then((response) => {
          if (response.ok) {
            toast.success("UTR Number submitted successfully");
            showModal(false);
            window.location.reload();
          } else {
            toast.error("Failed to submit UTR Number.");
          }
        })
        .catch((error) => {
          // console.error("Error while submitting UTR Number:", error);
        });
    }
  };

  useEffect(() => {
    // Fetch the user's email address and orders on component mount
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("PIUser"));
      const userResponse = await getService(`getuser/${user?._id}`);

      if (userResponse?.data?.success) {
        const email = userResponse?.data?.data?.email_address;
        setEmailAddress(email);
        // Fetch orders based on the email address
        await fetchOrdersByEmail(email);
      } else {
        setLoadingOrders(false);
      }
    } catch (error) {
      // console.error("Error fetching user:", error);
      setLoadingOrders(false);
    }
  };

  const fetchOrdersByEmail = async (email) => {
    try {
      const response = await fetch(
        `https://server.prempackaging.com/premind/api/my/orders/${email}`
      );

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          // console.error("Response data is not an array:", data);
          setOrders(data);
        }
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
    //console.log(orders);
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = window.document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      window.document.body.appendChild(script);
    });
  };

  const displayRazor = async (
    amount,
    name,
    number,
    email,
    address,
    orderId
  ) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    const amountInt = Math.round(parseInt(amount));
    if (!res) {
      alert("you are offline... failed to load razorpay");
      return;
    }
    //console.log("Amount", amountInt);
    //console.log("Amount", amountInt);
    const options = {
      key: "rzp_live_81D6rnBJ3mkIAC",
      amount: amountInt,
      currency: "INR",
      name: "Prem Packaging",
      description: "Test Transaction",
      image: "pp_logo_1.png",
      handler: async function (response) {
        const result = await fetch(
          `https://server.prempackaging.com/premind/api/order/update/payment/status`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _id: orderId,
              paymentStatus: "Payment Verified",
              status: "Payment Verified",
            }),
          }
        );
        if (result?.data?.success) {
          toast.success("Order placed successfully");
          router.push("/");
          // if (window.location.pathname !== `/orderPlaced/${orderId}`) {
          //   dispatch(openLoader());
          // }
          await emptyCart();
        } else {
          toast.error("something wrong with payment");
          window.location.reload();
        }
      },
      prefill: {
        name: `${name}`,
        email: email,
        contact: number,
      },
      notes: {
        address: address,
      },
      theme: {
        color: "#0C4E9C",
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // Return true when out of stock condition is true, else false
  let isOutOfStock = false;
  const checkOrderEligibility = (order) => {
    order?.items?.forEach((item) => {
      // console.log("order product details: " + item.product);
      // console.log(" -- Quantity Selected in order: " + item.quantity);
      // console.log(" -- > Packsize in order: " + item.packSize);
      item?.product?.priceList?.forEach((inneritem) => {
        if (inneritem.number == item.packSize) {
          // console.log("MATCHED: " + inneritem.number);
          if (inneritem.stock_quantity <= item.quantity) {
            // console.log("ACCEPTED");
            isOutOfStock = true;
            return; // exit the inner loop
          }
        }
      });
      if (isOutOfStock) return; // exit the outer loop
    });
    return isOutOfStock;
  };

  const handlePayment = async (order) => {
    await displayRazor(
      order?.totalOrderValue * 100,
      order?.name,
      order?.mobile,
      order?.email,
      order?.address,
      order?._id
    );
    console.log(order);
  };

  return (
    <>
      <Head>
        <title>My Orders | store.prempackaging</title>
        <meta name="title" content="My Orders" />
        <meta
          name="description"
          content="Check the status of your packaging product orders anytime. Track shipping, manage purchases, and stay updated with order details conveniently."
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        <div className="row p-0 m-0">
          <Banner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className={styles.mainDiv}>
              {loadingOrders ? (
                <p>Loading your order history...</p>
              ) : (
                <div
                  style={
                    {
                      // display: "flex",
                      // flexDirection: "column",
                      // gap: "30px",
                      // marginBottom: "50px",
                    }
                  }
                >
                  <div className="container">
                    <div className="row">
                      {orders?.data?.length > 0 ? (
                        orders?.data
                          ?.slice()
                          ?.reverse()
                          .map((order, index) => (
                            <div
                              className="col-md-12 mb-2 mt-2"
                              key={order._id}
                            >
                              <div
                                style={
                                  {
                                    // display: "flex",
                                    // gap: "30px",
                                    // border: "1px solid #808080",
                                  }
                                }
                              >
                                <div
                                  className="card"
                                  style={{ border: "1px solid black" }}
                                >
                                  <div className="container">
                                    <div
                                      className="row"
                                      style={{ backgroundColor: "#182C5A" }}
                                    >
                                      <h2 className="text-center text-white">
                                        ORDER DETAILS
                                      </h2>
                                    </div>
                                    <div className="row mt-3">
                                      <div className="col-md-4">
                                        <p>
                                          <b>Order ID:</b> {order?.orderId}
                                        </p>
                                        <p>
                                          <b>Ordered by:</b> {order?.name}
                                        </p>
                                        <p>
                                          <b>Order Initiated at:</b>{" "}
                                          {format(
                                            new Date(order?.createdAt),
                                            "yyyy-MM-dd | hh:mm a"
                                          )}
                                        </p>
                                      </div>
                                      <div className="col-md-4">
                                        <p>
                                          <b>Total Order Value:</b> ₹
                                          {Math.round(order?.totalOrderValue)}
                                        </p>
                                        <p>
                                          <b>Address:</b> {order?.address},{" "}
                                          {order?.town}, {order?.state}
                                        </p>
                                        {order?.couponCode === "" ? (
                                          <p>
                                            <b>Coupon Code:</b> NA
                                          </p>
                                        ) : (
                                          <p>
                                            <b>Coupon Code:</b>{" "}
                                            {order?.couponCode}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-md-4">
                                        <p>
                                          <b>Payment Status:</b>{" "}
                                          {order?.paymentStatus}
                                        </p>
                                        <p>
                                          <b>Pincode:</b> {order?.pincode}
                                        </p>
                                      </div>
                                      {/* <p>
                                    <b>Product Name:</b> To be decided...
                                  </p> */}

                                      <div
                                        className="container-fluid mb-3"
                                        style={
                                          {
                                            // backgroundColor: "#182C5A",
                                            // color: "white",
                                            // borderTop: "1px solid black",
                                          }
                                        }
                                      >
                                        <div className="row mt-2">
                                          <div className="col-md-6">
                                            <h5 style={{ fontWeight: "bold" }}>
                                              PRODUCT DETAILS
                                            </h5>
                                            <p style={{ lineHeight: "30px" }}>
                                              <ul>
                                                {order?.items?.map(
                                                  (item, index) => (
                                                    <span key={index}>
                                                      <li>
                                                        <span
                                                          style={{
                                                            fontWeight: "bold",
                                                          }}
                                                        >
                                                          {item?.product?.model}{" "}
                                                          {item?.product?.name}{" "}
                                                        </span>
                                                        (Packsize:{" "}
                                                        {item?.packSize})
                                                        (Quantity:
                                                        {item?.quantity})
                                                      </li>
                                                    </span>
                                                  )
                                                )}
                                              </ul>
                                            </p>
                                          </div>
                                          <div className="col-md-4">
                                            <h5 style={{ fontWeight: "bold" }}>
                                              PRICE BREAKDOWN
                                            </h5>
                                            <p style={{ lineHeight: "30px" }}>
                                              <ul>
                                                <li>
                                                  <b>Cart Value: </b>₹{" "}
                                                  {Math.abs(
                                                    order?.totalCartValue
                                                  ).toFixed(0)}
                                                </li>
                                                <li>
                                                  <b>Freight: </b>₹{" "}
                                                  {Math.abs(
                                                    order?.shippingCost
                                                  ).toFixed(0)}
                                                </li>
                                                <li>
                                                  <b>GST: </b>₹{" "}
                                                  {Math.abs(
                                                    order?.totalOrderValue -
                                                      order?.shippingCost -
                                                      order?.totalCartValue
                                                  ).toFixed(0)}
                                                </li>
                                              </ul>
                                            </p>
                                          </div>
                                          <div className="col-md-2">
                                            <div className="d-flex align-items-center justify-content-center">
                                              {checkOrderEligibility(order) &&
                                              order?.paymentStatus ===
                                                "Not Paid" ? (
                                                <p className="text-danger">
                                                  one or more <br /> Products
                                                  are <br /> out of stock
                                                </p>
                                              ) : order?.paymentStatus ===
                                                "Not Paid" ? (
                                                <button
                                                  className="btn"
                                                  style={{
                                                    paddingBlock: "5px",
                                                    paddingInline: "10px",
                                                    color: "white",
                                                    backgroundColor: "#E92227",
                                                    marginTop: "25px",
                                                  }}
                                                  onClick={() =>
                                                    handlePayment(order)
                                                  }
                                                >
                                                  Complete Payment
                                                </button>
                                              ) : (
                                                <button
                                                  className="btn"
                                                  style={{
                                                    paddingBlock: "5px",
                                                    paddingInline: "10px",
                                                    color: "black",
                                                    backgroundColor: "#CBEBCA",
                                                    marginTop: "25px",
                                                  }}
                                                  onClick={() =>
                                                    handlePayment(order)
                                                  }
                                                  disabled
                                                >
                                                  Payment Completed
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Modal
                                  show={showModal}
                                  onHide={handleModalClose}
                                >
                                  <Modal.Header closeButton>
                                    <Modal.Title>Complete Payment</Modal.Title>
                                  </Modal.Header>
                                  <Modal.Body>
                                    <p>
                                      <strong>Order ID:</strong>{" "}
                                      {selectedOrderId}
                                    </p>
                                    <p>
                                      <strong>Total Order Value:</strong> ₹
                                      {Math.round(selectedOderValue)}
                                    </p>
                                    <p>
                                      <strong>Enter UTR Number:</strong>{" "}
                                      <input
                                        type="text"
                                        value={utrNumber}
                                        style={{
                                          width: "250px",
                                          marginTop: "5px",
                                          paddingBlock: "5px",
                                          textAlign: "center",
                                        }}
                                        onChange={handleUtrNumberChange}
                                      />
                                    </p>

                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "20px",
                                      }}
                                    >
                                      <button
                                        onClick={handleSubmitUtrNumber}
                                        style={{
                                          paddingBlock: "10px",
                                          paddingInline: "30px",
                                          backgroundColor: "#1A202E",
                                          color: "white",
                                          border: "none",
                                        }}
                                      >
                                        Submit UTR Number
                                      </button>
                                    </div>

                                    <div>
                                      <div
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "24px",
                                          color: "#3A5BA2",
                                          textAlign: "center",
                                        }}
                                      >
                                        For Payment , you can either
                                      </div>

                                      <div
                                        style={{
                                          fontWeight: "500",
                                          fontSize: "20px",
                                          color: "#3A5BA2",
                                          marginTop: "5px",
                                          textAlign: "center",
                                        }}
                                      >
                                        Scan the QR Code
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <img
                                          src="/qr_code.png"
                                          style={{
                                            width: "100px",
                                            height: "100px",
                                          }}
                                        ></img>
                                      </div>

                                      <div
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "24px",
                                          color: "#3A5BA2",
                                          marginTop: "5px",
                                          textAlign: "center",
                                        }}
                                      >
                                        OR
                                      </div>

                                      <div
                                        style={{
                                          fontWeight: "500",
                                          fontSize: "20px",
                                          color: "#3A5BA2",
                                          marginTop: "5px",
                                          textAlign: "center",
                                        }}
                                      >
                                        Pay via VPA
                                      </div>

                                      <div
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "24px",
                                          color: "#333333",
                                          marginTop: "0px",
                                          textAlign: "center",
                                        }}
                                      >
                                        premindustriesecom@hsbc
                                      </div>
                                    </div>
                                  </Modal.Body>
                                  <Modal.Footer>
                                    <Button
                                      variant="secondary"
                                      onClick={handleModalClose}
                                    >
                                      Close
                                    </Button>
                                  </Modal.Footer>
                                </Modal>
                                {/* <div>
                                <img
                                  src={
                                    order?.items?.[0]?.product?.images?.[0]
                                      ?.image
                                  }
                                  width={150}
                                  height={150}
                                />
                              </div>

                              <div
                                style={{
                                  paddingBlock: "10px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "start",
                                  gap: "40px",
                                }}
                              >
                                <div
                                  style={{
                                    paddingBlock: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "start",
                                    gap: "40px",
                                  }}
                                >
                                  <div
                                    style={{
                                      border: "1px solid green",
                                      backgroundColor: "#cbebca",
                                      textTransform: "capitalize",
                                      paddingInline: "5px",
                                      width: "200px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <span style={{ fontWeight: "600" }}>
                                      Payment Status :
                                    </span>{" "}
                                    <span style={{ fontWeight: "600" }}>
                                      {order?.paymentStatus}
                                    </span>
                                  </div>

                                  <div>
                                    <span style={{ fontWeight: "600" }}>
                                      Order Id :
                                    </span>{" "}
                                    {order._id}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    paddingBlock: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "start",
                                    gap: "40px",
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: "600" }}>
                                      Product Name :
                                    </span>{" "}
                                    {order?.items?.[0]?.product?.name}{" "}
                                    {order?.items?.[0]?.product?.model}
                                  </div>

                                  <div>
                                    <span style={{ fontWeight: "600" }}>
                                      Order Value :
                                    </span>{" "}
                                    ₹{Math.round(order?.totalOrderValue)}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    paddingBlock: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "start",
                                    gap: "40px",
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: "600" }}>
                                      Payment Status :
                                    </span>{" "}
                                    <span style={{ fontWeight: "500" }}>
                                      {order?.paymentStatus}
                                    </span>
                                  </div>

                                  <div>
                                    <div>
                                      <span style={{ fontWeight: "600" }}>
                                        UTR Number :
                                      </span>{" "}
                                      <span style={{ fontWeight: "400" }}>
                                        {order?.utrNumber}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  style={{
                                    width: "250px",
                                    paddingBlock: "5px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "start",
                                    gap: "25px",
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: "600" }}>
                                      Town/State :
                                    </span>{" "}
                                    <span style={{ fontWeight: "400" }}>
                                      {order?.town} , {order?.state}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    {order?.paymentStatus === "Not Paid" && (
                                      <button
                                        style={{
                                          paddingBlock: "5px",
                                          paddingInline: "10px",
                                          color: "white",
                                          backgroundColor: "#1A202E",
                                        }}
                                        onClick={() => handlePayment(order)}
                                      >
                                        Complete Payment
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Modal show={showModal} onHide={handleModalClose}>
                                <Modal.Header closeButton>
                                  <Modal.Title>Complete Payment</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                  <p>
                                    <strong>Order ID:</strong> {selectedOrderId}
                                  </p>
                                  <p>
                                    <strong>Total Order Value:</strong> ₹
                                    {Math.round(selectedOderValue)}
                                  </p>
                                  <p>
                                    <strong>Enter UTR Number:</strong>{" "}
                                    <input
                                      type="text"
                                      value={utrNumber}
                                      style={{
                                        width: "250px",
                                        marginTop: "5px",
                                        paddingBlock: "5px",
                                        textAlign: "center",
                                      }}
                                      onChange={handleUtrNumberChange}
                                    />
                                  </p>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      marginTop: "20px",
                                    }}
                                  >
                                    <button
                                      onClick={handleSubmitUtrNumber}
                                      style={{
                                        paddingBlock: "10px",
                                        paddingInline: "30px",
                                        backgroundColor: "#1A202E",
                                        color: "white",
                                        border: "none",
                                      }}
                                    >
                                      Submit UTR Number
                                    </button>
                                  </div>

                                  <div>
                                    <div
                                      style={{
                                        fontWeight: "700",
                                        fontSize: "24px",
                                        color: "#3A5BA2",
                                        textAlign: "center",
                                      }}
                                    >
                                      For Payment , you can either
                                    </div>

                                    <div
                                      style={{
                                        fontWeight: "500",
                                        fontSize: "20px",
                                        color: "#3A5BA2",
                                        marginTop: "5px",
                                        textAlign: "center",
                                      }}
                                    >
                                      Scan the QR Code
                                    </div>

                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <img
                                        src="/qr_code.png"
                                        style={{
                                          width: "100px",
                                          height: "100px",
                                        }}
                                      ></img>
                                    </div>

                                    <div
                                      style={{
                                        fontWeight: "700",
                                        fontSize: "24px",
                                        color: "#3A5BA2",
                                        marginTop: "5px",
                                        textAlign: "center",
                                      }}
                                    >
                                      OR
                                    </div>

                                    <div
                                      style={{
                                        fontWeight: "500",
                                        fontSize: "20px",
                                        color: "#3A5BA2",
                                        marginTop: "5px",
                                        textAlign: "center",
                                      }}
                                    >
                                      Pay via VPA
                                    </div>

                                    <div
                                      style={{
                                        fontWeight: "700",
                                        fontSize: "24px",
                                        color: "#333333",
                                        marginTop: "0px",
                                        textAlign: "center",
                                      }}
                                    >
                                      premindustriesecom@hsbc
                                    </div>
                                  </div>
                                </Modal.Body>
                                <Modal.Footer>
                                  <Button
                                    variant="secondary"
                                    onClick={handleModalClose}
                                  >
                                    Close
                                  </Button>
                                </Modal.Footer>
                              </Modal> */}
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="col-md-12 mb-2 mt-2 mb-5 text-center">
                          <h2 style={{ color: "#132348" }}>
                            No Orders Placed Yet
                          </h2>
                          <div className="row">
                            <div className="col-md-4 mt-5">
                              <h5>
                                <Link
                                  href="/corrugated-boxes"
                                  style={{
                                    textDecoration: "none",
                                    color: "#132348",
                                  }}
                                >
                                  Corrugated Box &rarr;
                                </Link>
                              </h5>
                            </div>
                            <div className="col-md-4 mt-5">
                              <h5>
                                <Link
                                  href="/label"
                                  style={{
                                    textDecoration: "none",
                                    color: "#132348",
                                  }}
                                >
                                  Label &rarr;
                                </Link>
                              </h5>
                            </div>
                            <div className="col-md-4 mt-5">
                              <h5>
                                <Link
                                  href="/paper-bag"
                                  style={{
                                    textDecoration: "none",
                                    color: "#132348",
                                  }}
                                >
                                  Paper Bag &rarr;
                                </Link>
                              </h5>
                            </div>
                            <div className="col-md-4 mt-5">
                              <h5>
                                <Link
                                  href="/poly-bags"
                                  style={{
                                    textDecoration: "none",
                                    color: "#132348",
                                  }}
                                >
                                  Poly Bag &rarr;
                                </Link>
                              </h5>
                            </div>
                            <div className="col-md-4 mt-5">
                              <h5>
                                <Link
                                  href="/tape"
                                  style={{
                                    textDecoration: "none",
                                    color: "#132348",
                                  }}
                                >
                                  Tape &rarr;
                                </Link>
                              </h5>
                            </div>
                            <div className="col-md-4 mt-5">
                              <h5>
                                <Link
                                  href="/"
                                  style={{
                                    textDecoration: "none",
                                    color: "#132348",
                                  }}
                                >
                                  Back to Home &rarr;
                                </Link>
                              </h5>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkoutpage;

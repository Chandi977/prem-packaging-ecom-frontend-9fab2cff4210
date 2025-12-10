import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { indianStates } from "../../assets/data";
import Banner from "../../components/landing/Banner";
import { getService } from "../../services/service";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Head from "next/head";

const Checkoutpage = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [orders, setOrders] = useState(); // Initialize orders as an object with a data array
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [widt, setWidt] = useState();
  const [utrNumber, setUtrNumber] = useState("");

  const breakpoint = 700;
  const router = useRouter();

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

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("PIUser"));
      const userResponse = await getService(`getuser/${user?._id}`);

      if (userResponse?.data?.success) {
        const email = userResponse?.data?.data?.email_address;
        setEmailAddress(email);
        await fetchOrdersByEmail(email);
      } else {
        setLoadingOrders(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setLoadingOrders(false);
    }
  };

  const fetchOrdersByEmail = async (email) => {
    //console.log(email);
    try {
      const response = await fetch(
        `https://server.prempackaging.com/premind/api/order/latest?email_address=${email}`
      );

      //console.log(response);
      if (response.ok) {
        const result = await response.json();
        const orderresult = result.data;
        // console.log(result.data);
        setOrders(orderresult);

        //console.log(orders);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUtrNumberChange = (event) => {
    setUtrNumber(event.target.value);
  };

  const handleSubmitUtrNumber = () => {
    if (utrNumber.trim() === "") {
      toast.error("Please enter a UTR Number.");
    } else {
      const requestData = {
        _id: orders._id,
        utrNumber: utrNumber,
        paymentStatus: "Paid",
        status: "Payment Done",
      };
      // console.log(requestData)

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
            // console.log("UTR Number submitted successfully.");
            toast.success("UTR Number submitted successfully");
            router.push("/");
          } else {
            toast.error("Failed to submit UTR Number.");
          }
        })
        .catch((error) => {
          console.error("Error while submitting UTR Number:", error);
        });
    }
  };

  return (
    <>
      <Head>
        <title>
          Payment Process - Prem Industries India Limited - Innovation In Action
        </title>
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        <div className="row p-0 m-0">
          <Banner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className={styles.mainDiv} style={{ marginBlock: "20px" }}>
              <h2
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "30px",
                  color: "#3A5BA2",
                  fontWeight: "700",
                  fontSize: "36px",
                }}
              >
                Payment Process
              </h2>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : (
                <>
                  <div className={styles.mainPage}>
                    <div className={styles.orderID}>
                      <div
                        style={{ paddingLeft: "10px", marginBottom: "20px" }}
                      >
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#3a5ba2",
                          }}
                        >
                          Order Id :
                        </div>
                        <div
                          style={{
                            border: "1px solid #1A202E",
                            width: "250px",
                            textAlign: "center",
                            backgroundColor: "white",
                            borderRadius: "2px",
                            marginTop: "5px",
                            fontWeight: "500",
                            color: "#333333",
                            paddingBlock: "5px",
                            cursor: "default",
                          }}
                        >
                          {orders.orderId}
                        </div>
                      </div>

                      <div
                        style={{ paddingLeft: "10px", marginBottom: "20px" }}
                      >
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>
                          Product(s) Name :
                        </div>
                        <div
                          style={{
                            border: "1px solid #1A202E",
                            width: "250px",
                            textAlign: "center",
                            backgroundColor: "white",
                            borderRadius: "2px",
                            marginTop: "5px",
                            color: "#333333",
                            fontWeight: "500",
                            paddingBlock: "5px",
                            cursor: "default",
                            textTransform: "capitalize",
                          }}
                        >
                          {orders?.items?.[0]?.product?.name}{" "}
                          {orders?.items?.[0]?.product?.model}
                        </div>
                      </div>

                      <div
                        style={{ paddingLeft: "10px", marginBottom: "20px" }}
                      >
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>
                          Shipping City :
                        </div>
                        <div
                          style={{
                            border: "1px solid #1A202E",
                            width: "250px",
                            textAlign: "center",
                            backgroundColor: "white",
                            borderRadius: "2px",
                            marginTop: "5px",
                            color: "#333333",
                            fontWeight: "500",
                            paddingBlock: "5px",
                            cursor: "default",
                          }}
                        >
                          {orders?.town} , {orders?.state}
                        </div>
                      </div>

                      <div
                        style={{ paddingLeft: "10px", marginBottom: "20px" }}
                      >
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>
                          Total Order Value :
                        </div>
                        <div
                          style={{
                            border: "1px solid #1A202E",
                            width: "250px",
                            textAlign: "center",
                            backgroundColor: "white",
                            borderRadius: "2px",
                            marginTop: "5px",
                            color: "#333333",
                            paddingBlock: "5px",
                            fontWeight: "700",
                            fontSize: "18px",
                            cursor: "default",
                          }}
                        >
                          ₹ {Math.round(orders.totalOrderValue)}
                        </div>
                      </div>

                      <div
                        style={{ paddingLeft: "10px", marginBottom: "20px" }}
                      >
                        <div style={{ fontSize: "20px", fontWeight: "600" }}>
                          Enter UTR Number :
                        </div>
                        <div
                          style={
                            {
                              // border: "1px solid grey",
                              // width: "250px",
                            }
                          }
                        >
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
                        </div>
                      </div>
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
                          marginTop: "20px",
                          textAlign: "center",
                        }}
                      >
                        Scan the QR Code
                      </div>

                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <img
                          src="/qr_code.png"
                          style={{ width: "200px", height: "200px" }}
                        ></img>
                      </div>

                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "24px",
                          color: "#3A5BA2",
                          marginTop: "16px",
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
                          marginTop: "20px",
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
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      className={styles.submitPaymentBtn}
                      onClick={handleSubmitUtrNumber}
                      style={{
                        paddingBlock: "10px",
                        paddingInline: "30px",
                        color: "white",
                        border: "none",
                      }}
                    >
                      Submit UTR Number
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkoutpage;

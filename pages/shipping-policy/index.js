"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Banner from "../../components/landing/Banner";
import Head from "next/head";

const PrivacyPolicy = () => {
  const [widt, setWidt] = useState();
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

  return (
    <>
      <Head>
        <title>Shipping Policy | store.prempackaging</title>
        <meta name="title" content="Shipping Policy" />
        <meta
          name="description"
          content="Get fast, reliable, and secure delivery with our shipping policy. Track your orders and enjoy timely packaging product deliveries nationwide."
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
              <h2 className={styles.heading1}>Shipping Policy</h2>
              <div className={styles.content1}>
                Thank you for choosing Prem Industries India Limited for your
                packaging needs. We&#39;re committed to providing you with a
                seamless shipping experience. Please take a moment to review our
                shipping policy:
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>1. Shipping Methods</h4>
              <div className={styles.subContent}>
                <div>
                  Standard Shipping: Estimated delivery within 5-7 business
                  days.
                </div>
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>2. Order Processing </h4>
              <div className={styles.subContent}>
                Orders are typically processed within 1-2 business days.
                <br />
                You will receive an email confirmation with tracking information
                once your order is shipped.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>3. Shipping Rates</h4>
              <div className={styles.subContent}>
                Shipping costs are determined by the weight, size, and delivery
                location of your order, and you&#39;ll be able to view the
                shipping charges at the checkout stage.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>4. Shipping Damage or Loss</h4>
              <div className={styles.subContent}>
                If your order arrives damaged or is lost in transit, please
                contact our customer support team within 3 business days of
                receiving your order. We will work to resolve the issue
                promptly.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>5. Address Accuracy</h4>
              <div className={styles.subContent}>
                It is crucial to provide accurate shipping information during
                checkout. We are not responsible for delays or additional
                charges caused by incorrect address details.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>6. Tracking Your Order</h4>

              <div className={styles.subContent}>
                You can track your order using the provided tracking number. If
                you have any queries about your shipment&#39;s status, reach out
                to our customer support team.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>7. Returns and Exchanges</h4>
              <div className={styles.subContent}>
                For information on returns and exchanges, please refer to our
                Returns Policy.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>8. Holiday Shipping</h4>
              <div className={styles.subContent}>
                During peak holiday seasons, shipping times may be longer than
                usual due to increased demand. Please plan your orders
                accordingly.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h4 className={styles.subHeading}>9. Contact Us</h4>
              <div className={styles.subContent}>
                If you have any inquiries or doubts about our shipping
                guidelines or your purchase, don&#39;t hesitate to reach out to
                our customer support team via email at
                ecommerce@premindustries.in or call us at +91 8447247227. <br />
                By placing an order with Prem Industries India Limited, you
                agree to abide by this shipping policy. We appreciate your trust
                in our products and services and are dedicated to delivering
                your packaging solutions with care and efficiency.
              </div>
            </div>

            <div className={styles.subDiv1}>
              Note: This shipping policy is subject to change. Please check our
              website for the most up-to-date information
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

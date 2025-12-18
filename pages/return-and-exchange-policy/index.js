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
        <title>Return and Exchange Policy | store.prempackaging</title>
        <meta name="title" content="Return and Exchange Policy" />
        <meta
          name="description"
          content="Our hassle-free return and exchange policy ensures your satisfaction. Shop with confidence knowing replacements and returns are easy and quick."
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
              <h2 className={styles.heading1}>Return Policy</h2>
              <div className={styles.content1}>
                At Prem Industries India Limited, we are dedicated to delivering
                high-quality packaging solutions. To ensure clarity and
                transparency regarding your purchases, please read and
                understand our Return and Exchange Policy.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h3 className={styles.subHeading}>1. No Return Policy</h3>

              <div className={styles.subContent1}>
                <span className={styles.span1}>1.1 No Return:</span> Prem
                Industries India Limited operates under a &#34;No Return&#34;
                policy for most of our products.
              </div>

              <div className={styles.subContent1}>
                <span className={styles.span1}>1.2 Exclusions: </span>{" "}
                Exceptions to our &#34;No Return&#34; policy are only applicable
                in cases of defective or damaged items. If you receive a product
                that is damaged or has a manufacturing defect, please refer to
                section 2 below for details on our &#34;7 Days Replacement&#34;
                option.
              </div>
            </div>

            <div className={styles.subDiv}>
              <h3 className={styles.subHeading}>2. 7 Days Replacement</h3>

              <div className={styles.subContent1}>
                <span className={styles.span1}>
                  2.1 Defective or Damaged Items:
                </span>{" "}
                In the rare event that you receive a product that is defective
                or damaged, you have the option to request a replacement within
                7 days of the delivery date.
              </div>

              <div className={styles.subContent1}>
                <span className={styles.span1}>
                  2.2 Initiating a Replacement:
                </span>{" "}
                To request a replacement, please follow these steps:
                <ul>
                  <li>
                    Contact our customer support team at
                    ecommerce@premindustries.in or call us at +91 8447247227
                    within 7 days of receiving the damaged or defective item.
                  </li>
                  <li>
                    Provide your order number, a description of the issue, and
                    clear photos or videos showing the defect or damage. This
                    information will help us assess the situation quickly.
                  </li>
                </ul>
              </div>

              <div className={styles.subContent1}>
                <span className={styles.span1}>2.3 Replacement Process:</span>
                <ul>
                  <li>
                    Once we receive your request and the required information,
                    we will review the case.
                  </li>
                  <li>
                    Once your request is approved, we will provide instructions
                    on returning the damaged or defective item.
                  </li>
                  <li>
                    Upon receiving the item and confirming the issue, we will
                    ship a replacement to you as soon as possible. If the exact
                    item is out of stock, we will offer a suitable replacement
                    or a refund, based on your preference.
                  </li>
                  <li>
                    We hereby clarify that any shipping costs related to
                    replacements shall not be borne by us. Such expenses shall
                    remain the responsibility of the customer.
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.subDiv}>
              <h3 className={styles.subHeading}>3. Privacy</h3>
              <div>
                <div className={styles.subContent1}>
                  <span className={styles.span1}>
                    3.1 Personal Information:
                  </span>{" "}
                  In the rare event that you receive a product that is defective
                  or damaged, you have the option to request a replacement
                  within 7 days of the delivery date.
                </div>
              </div>
            </div>

            <div className={styles.subDiv}>
              <h3 className={styles.subHeading}>4. Contact Information</h3>
              <div className={styles.subContent}>
                If you have any questions or need assistance with a replacement
                or warranty claim, please contact our customer support team at
                ecommerce@premindustries.in or call us at +91 8447247227.
              </div>
            </div>

            <div className={styles.subDiv} style={{ marginBottom: "60px" }}>
              <h3 className={styles.subHeading}>5. Policy Changes</h3>
              <div className={styles.subContent}>
                Prem Industries India Limited reserves the right to modify or
                update this Return and Exchange Policy at any time. Any changes
                will be effective immediately upon posting on our website. You
                are responsible for periodically reviewing this policy. <br />
                <br />
                When you make a purchase from us, you acknowledge and agree to
                abide by the terms and conditions detailed in this policy. We
                appreciate your business and are dedicated to providing you with
                quality packaging solutions and excellent customer service
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

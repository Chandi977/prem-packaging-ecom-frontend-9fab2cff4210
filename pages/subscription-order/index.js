"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import { getService, postService } from "../../services/service";
import Banner from "../../components/landing/Banner";
import Head from "next/head";

const SubscriptionOrder = () => {
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

  const [formData, setFormData] = useState({
    product_name: "",
    product_category: "",
    moq: "",
    number_of_months: "",
    contact_person_name: "",
    contact_person_email: "",
    contact_person_mobile_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Display the form data in the console
    //console.log("Form Data:", formData);

    try {
      // Make an https POST request to the backend API endpoint
      const response = await axios.post(
        "https://server.prempackaging.com/premind/api/subscription-order",
        formData
      );

      // Display a success message based on the API response
      //console.log(response.data.message);
    } catch (error) {
      // Handle errors, e.g., display an error message
      console.error("Error:", error.message);
    }
  };

  return (
    <>
      <Head>
        <title>
          Subscription Order - Prem Industries India Limited - Innovation In
          Action
        </title>
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        <div className="row p-0 m-0">
          <Banner />
        </div>
      </div>
      <div className="container mt-5 pt-5 pb-5 mb-5">
        <div className="row mt-5 pt-5 pb-5 mb-5">
          <div className="col-md-12 mt-5 pt-5 pb-5 mb-5">
            <h1
              className="text-center"
              style={{ fontSize: "40px", color: "#182C5A", fontWeight: "700" }}
            >
              Coming Soon...
            </h1>
          </div>
        </div>
      </div>
      {/* <div className={styles.mainBody}>
        <div className={styles.mainHeading}>
          <div>Subscription Order Form</div>
          <div className={styles.div1}></div>
        </div>

        <div className={styles.form}>
          <form onSubmit={handleSubmit}>
            <div className={styles.input}>
              <label htmlFor="companyName" className={styles.inputHeading}>
                Product Name*
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input}>
              <label htmlFor="productCategory" className={styles.inputHeading}>
                Product Category*
              </label>
              <input
                type="text"
                id="product_category"
                name="product_category"
                value={formData.product_category}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input}>
              <label htmlFor="moq" className={styles.inputHeading}>
                MOQ*
              </label>
              <input
                type="text"
                id="moq"
                name="moq"
                value={formData.moq}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input}>
              <label htmlFor="richText" className={styles.inputHeading}>
                Number of Months*
              </label>
              <textarea
                id="number_of_months"
                name="number_of_months"
                value={formData.number_of_months}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input}>
              <label htmlFor="contactDetails" className={styles.inputHeading}>
                Contact Person Name*
              </label>
              <input
                type="text"
                id="contact_person_name"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input}>
              <label htmlFor="email" className={styles.inputHeading}>
                Contact Person Email*
              </label>
              <input
                type="email"
                id="contact_person_email"
                name="contact_person_email"
                value={formData.contact_person_email}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input}>
              <label htmlFor="contactPerson" className={styles.inputHeading}>
                Contact Person Mobile Number*
              </label>
              <input
                type="text"
                id="contact_person_mobile_number"
                name="contact_person_mobile_number"
                value={formData.contact_person_mobile_number}
                onChange={handleChange}
                className={styles.inputBox}
              />
            </div>
            <div className={styles.input} style={{ marginBlock: "30px" }}>
              <button className={styles.submitButton} type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div> */}
    </>
  );
};

export default SubscriptionOrder;

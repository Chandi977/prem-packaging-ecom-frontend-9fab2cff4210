"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import { getService, postService } from "../../services/service";
import Banner from "../../components/landing/Banner";

export async function getServerSideProps(context) {
  const searchRes = await getService(`category/all`);
  const prod = await getService("product/all");
  const query = context.query;
  let brandId;
  if (query?.brand) {
    const brands = await getService(`brand/all`);
    const brand = brands?.data?.data?.filter(
      (item) => item.name === query?.brand
    );
    brandId = brand[0]?._id;
  }
  let subCategoryId;
  if (query?.subcategory) {
    const subcategories = await getService(`subcategory/all`);
    const subcategory = subcategories?.data?.data?.filter(
      (item) => item.name === query?.subcategory
    );
    subCategoryId = subcategory[0]?._id;
  }
  return {
    props: {
      brand: searchRes?.data ? searchRes?.data?.data : [],
      product: prod?.data ? prod?.data?.data : [],
      category: query?.category ? query?.category : null,
      brandId: brandId ? brandId : null,
      subCategoryId: subCategoryId ? subCategoryId : null,
      q: query?.q ? query?.q : null,
    },
  };
}

const CustomForm = () => {
  const [widt, setWidt] = useState();
  const breakpoint = 700;

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

  const [formData, setFormData] = useState({
    company_name: "",
    product_category: "",
    moq: "",
    rich_text: "",
    contact_person_name: "",
    contact_person_email: "",
    contact_person_mobile_number: "",
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      // ✅ Original API call
      const response = await axios.post(
        "https://server.prempackaging.com/premind/api/custom-packaging",
        formData
      );

      // ✅ NEW: Send same data to email API
      await axios.post(
        "https://prem-industries-forms.vercel.app/api/email-store-custom.js",
        formData
      );

      setSuccessMessage(response.data.message);

      setFormData({
        company_name: "",
        product_category: "",
        moq: "",
        rich_text: "",
        contact_person_name: "",
        contact_person_email: "",
        contact_person_mobile_number: "",
      });

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Custom Packaging Form | store.prempackaging</title>
        <meta name="title" content="Custom Packaging" />
        <meta
          name="description"
          content="Design unique custom packaging tailored to your brand. Choose sizes, styles, and materials that perfectly reflect your business identity."
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        <div className="row p-0 m-0">
          <Banner />
        </div>
      </div>
      <div className={styles.mainBody}>
        <div className={styles.mainHeading}>
          <div>Custom Packaging Form</div>
          <div className={styles.div1}></div>
        </div>

        <div className={styles.form}>
          {successMessage ? (
            <div className={styles.successMessage}>{successMessage}</div>
          ) : (
            <form>
              <div className={styles.input}>
                <label htmlFor="companyName" className={styles.inputHeading}>
                  Company Name*
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={styles.inputBox}
                />
              </div>

              <div className={styles.input}>
                <label
                  htmlFor="productCategory"
                  className={styles.inputHeading}
                >
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
                  Query Details*
                </label>
                <textarea
                  id="rich_text"
                  name="rich_text"
                  value={formData.rich_text}
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
                <button
                  className={styles.submitButton}
                  type="submit"
                  onClick={handleSubmitForm}
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
export default CustomForm;

"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import Head from "next/head";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { getService, postService } from "../../services/service";
import CorrugatedBanner from "../../components/landing/CorrugatedBanner";
import { useRouter } from "next/router";
import ListingCard from "../../components/listing/ListingCard";
import DesktopListingCard from "../../components/listing/DesktopLisingCard";
import Loader from "../../components/loader";

export async function getServerSideProps(context) {
  const searchRes = await getService(`category/all`);
  const prod = await getService("product/all");
  const query = context.query;

  let brandId = null;
  if (query?.brand) {
    const brands = await getService(`brand/all`);
    const brand = brands?.data?.data?.filter(
      (item) => item.name === query?.brand
    );
    brandId = brand?.[0]?._id || null;
  }

  let subCategoryId = null;
  if (query?.subcategory) {
    const subcategories = await getService(`subcategory/all`);
    const subcategory = subcategories?.data?.data?.filter(
      (item) => item.name === query?.subcategory
    );
    subCategoryId = subcategory?.[0]?._id || null;
  }

  return {
    props: {
      brand: searchRes?.data ? searchRes?.data?.data : [],
      product: prod?.data ? prod?.data?.data : [],
      category: query?.category ? query?.category : null,
      brandId: brandId,
      subCategoryId: subCategoryId,
      q: query?.q ? query?.q : null,
    },
  };
}

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const CustomSliderStyles = {
  "& .MuiSlider-thumb": {
    color: "white",
  },
  "& .MuiSlider-track": {
    color: "#E92227",
  },
  "& .MuiSlider-rail": {
    color: "#E0E0E0",
  },
  "& .MuiSlider-active": {
    color: "#E92227",
  },
};

function valuetext(value) {
  return `${value}°C`;
}

const BoppTape = ({ brand, product, category, brandId, subCategoryId, q }) => {
  const router = useRouter();
  const [products, setProducts] = useState();
  const [length, setLength] = useState([0, 300]);
  const [breadth, setBreadth] = useState([0, 300]);
  const [height, setHeight] = useState([0, 300]);
  const [showing, setShowing] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstIndex, setFirstIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(5);
  const [unit, setUnit] = useState("inches");
  const [isLoading, setIsLoading] = useState(false);
  const [flags, setFlags] = useState({
    size: false,
    category: false,
    sort: false,
  });

  const [seelctedCategories, setSelectedCategories] = useState([]);
  const [seelctedBrand, setSelectedBrand] = useState([]);
  const [widt, setWidt] = useState();
  const breakpoint = 700;

  const minValue = 0;
  const maxValue = unit === "inches" ? 20 : 300;

  const handleLength = (event, newValue) => {
    setLength(newValue);
  };

  const handleBradth = (event, newValue) => {
    setBreadth(newValue);
  };

  const handleHeight = (event, newValue) => {
    setHeight(newValue);
  };

  const handleUnit = (event) => {
    setUnit(event.target.value);
  };

  const handleApply = async () => {
    setIsLoading(true);
    try {
      setFlags((prev) => ({
        ...prev,
        size: true,
      }));

      const baseData = {
        length: {
          min: length?.[0],
          max: length?.[1],
        },
        breadth: {
          min: breadth?.[0],
          max: breadth?.[1],
        },
        height: {
          min: height?.[0],
          max: height?.[1],
        },
        unit: unit,
      };

      const data = flags?.category
        ? {
            ...baseData,
            category: seelctedCategories,
          }
        : baseData;

      const dat = await postService("/product/filter", data);
      setProducts(dat?.data?.data);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter products by category "Corrugated Box"
    if (product) {
      const corrugatedBoxProducts = product.filter(
        (prod) => prod.category?.name === "Corrugated Box"
      );
      setProducts(corrugatedBoxProducts);
    }
  }, [product]);

  const filterProducts = async (cat) => {
    setFlags((prev) => ({
      ...prev,
      category: true,
    }));

    if (flags?.size) {
      const temp = [...seelctedCategories];
      const index = temp.findIndex((item) => item === cat);

      if (index === -1) {
        temp.push(cat);
      } else {
        temp.splice(index, 1);
      }

      setSelectedCategories(temp);

      const data = {
        length: {
          min: length?.[0],
          max: length?.[1],
        },
        breadth: {
          min: breadth?.[0],
          max: breadth?.[1],
        },
        height: {
          min: height?.[0],
          max: height?.[1],
        },
        category: temp,
        ...(brandId !== null && { brand: brandId }),
        ...(subCategoryId !== null && { subcategory: subCategoryId }),
      };

      const dat = await postService("/product/filter", data);
      setProducts(dat?.data?.data);
    } else {
      const temp = [...seelctedCategories];
      const index = temp.findIndex((item) => item === cat);

      if (index === -1) {
        temp.push(cat);
      } else {
        temp.splice(index, 1);
      }

      setSelectedCategories(temp);

      const data = {
        category: temp,
        ...(brandId !== null && { brand: brandId }),
        ...(subCategoryId !== null && { subcategory: subCategoryId }),
      };

      const dat = await postService("/product/filter", data);
      setProducts(dat?.data?.data);
    }
  };

  const filterBrandProducts = async (cat) => {
    setFlags((prev) => ({
      ...prev,
      brand: true,
    }));

    if (flags?.size) {
      const temp = [...seelctedBrand];
      const index = temp.findIndex((item) => item === cat);

      if (index === -1) {
        temp.push(cat);
      } else {
        temp.splice(index, 1);
      }

      setSelectedBrand(temp);

      const data = {
        length: {
          min: length?.[0],
          max: length?.[1],
        },
        breadth: {
          min: breadth?.[0],
          max: breadth?.[1],
        },
        height: {
          min: height?.[0],
          max: height?.[1],
        },
        brand: temp,
        ...(brandId !== null && { brand: brandId }),
        ...(subCategoryId !== null && { subcategory: subCategoryId }),
      };

      const dat = await postService("/product/filter", data);
      setProducts(dat?.data?.data);
    } else {
      const temp = [...seelctedBrand];
      const index = temp.findIndex((item) => item === cat);

      if (index === -1) {
        temp.push(cat);
      } else {
        temp.splice(index, 1);
      }

      setSelectedBrand(temp);

      const data = {
        brand: temp,
        ...(brandId !== null && { brand: brandId }),
        ...(subCategoryId !== null && { subcategory: subCategoryId }),
      };

      const dat = await postService("/product/filter", data);
      const filteredProducts = dat?.data?.data?.filter(
        (prod) => prod.category === "6557deab301ec4f2f4266131"
      );
      setProducts(filteredProducts);
    }
  };

  const handleQuery = async () => {
    const data = {
      q: q,
    };
    const dat = await postService("product/filter", data);

    const filteredProducts = dat?.data?.data?.filter((prod) => {
      return prod.category === "6557deab301ec4f2f4266131";
    });

    setProducts(filteredProducts);
  };

  useEffect(() => {
    if (q) {
      handleQuery();
    }
  }, [q]);

  const handlecat = async (id) => {
    setIsLoading(true);
    try {
      await filterBrandProducts(id);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (products?.length > 0) {
      setTotalPages(Math.ceil(products.length / showing));
      const last = currentPage * showing;
      const first = last - showing;
      console.log("Corrugated product sample:", products[0]);
      setFirstIndex(first);
      setLastIndex(last);
    } else {
      setTotalPages(0);
      setFirstIndex(0);
      setLastIndex(showing);
    }
  }, [products, showing, currentPage]);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
    const last = value * showing;
    const first = last - showing;
    setFirstIndex(first);
    setLastIndex(last);
  };

  const handleSort = (type) => {
    if (!products) return;
    const temp = [...products];

    if (type === "low to high") {
      const sortedLowToHigh = temp
        .slice()
        .sort((a, b) => a?.priceList?.[0]?.SP - b?.priceList?.[0]?.SP);
      setProducts(sortedLowToHigh);
    } else if (type === "high to low") {
      const sortedHighToLow = temp
        .slice()
        .sort((a, b) => b?.priceList?.[0]?.SP - a?.priceList?.[0]?.SP);
      setProducts(sortedHighToLow);
    }
  };

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

  return (
    <>
      <Head>
        <title>Buy Corrugated Boxes Online | store.prempackaging </title>
        <meta name="title" content="Buy Corrugated Boxes Online" />
        <meta
          name="description"
          content="You Can Buy corrugated boxes online at Prem Industries India Limited. We are one of the best corrugated boxes manufacturers & supplier in India."
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        {isLoading && <Loader />}
        <div className="row p-0 m-0">
          <CorrugatedBanner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className="mt-2 d-flex flex-column">
              <p className={styles.catalogpath}>
                <span onClick={() => router.push("/")}>Homepage</span> /{" "}
                <span className={styles.spanee}>Corrugated Boxes</span>
              </p>
              <div
                className="row mt-2 m-0"
                style={{ height: "1px", backgroundColor: "#D9D9D9" }}
              ></div>
            </div>
            <div className={"row " + styles.filterheader}>
              <div className={"col-6 p-0 m-0 " + styles.filterheadersuba}>
                <p className={styles.showresulttext}>
                  Showing all {products?.length || 0} results
                </p>
              </div>
              <div className={"col-6 p-0  " + styles.filterheadersubb}>
                <div className={styles.filterheadersubbdiv}>
                  <p className={styles.filtershowtext}>Show:</p>
                  <select
                    style={{
                      paddingLeft: "12px",
                      marginRight: "10px",
                      width: "66px",
                      height: "34px",
                      backgroundColor: "white",
                      border: "1px solid #D9D9D9",
                    }}
                    value={showing}
                    onChange={(e) => setShowing(parseInt(e.target.value, 10))}
                  >
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                  </select>
                  <select
                    style={{
                      paddingLeft: "12px",
                      width: "193px",
                      height: "34px",
                      backgroundColor: "white",
                      border: "1px solid #D9D9D9",
                    }}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option selected disabled>
                      Default sorting
                    </option>
                    <option value="high to low">High to Low</option>
                    <option value="low to high">Low to high</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-4 d-flex" style={{ position: "relative" }}>
              {/* Filters for Desktop View */}
              <div className="d-flex flex-column col-3 ">
                <div className={"col-12 " + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "420px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "end",
                          }}
                        >
                          <div>
                            <p
                              className="mb-0 mt-3"
                              style={{ fontWeight: "bolder" }}
                            >
                              Filter by Size
                            </p>
                          </div>

                          <div
                            className="mb-0 mt-2"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "10px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="inches"
                                checked={unit === "inches"}
                                onChange={handleUnit}
                                style={{ marginTop: "5px" }}
                              />
                              inch
                            </label>
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="mm"
                                checked={unit === "mm"}
                                onChange={handleUnit}
                                style={{ marginTop: "5px" }}
                              />
                              mm
                            </label>
                          </div>
                        </div>

                        <p className="mb-0 mt-2">Length</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={length}
                          onChange={handleLength}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Breadth</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={breadth}
                          onChange={handleBradth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Height</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={height}
                          onChange={handleHeight}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <button
                          className={styles.packagebtn}
                          onClick={handleApply}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"mt-2 col-12 " + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "170px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <p
                          className="mb-0 mt-3"
                          style={{ fontWeight: "bolder" }}
                        >
                          Filter by Brands
                        </p>

                        <div className="mt-4 d-flex flex-column align-items-start gap-3">
                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbad301ec4f2f4266103")
                              }
                              sx={{
                                padding: "0px",
                                color: "gray",
                                "&.Mui-checked": {
                                  color: "gray",
                                },
                                "&.Mui-unchecked": {
                                  color: "gray",
                                },
                              }}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Amazon
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbbc301ec4f2f4266107")
                              }
                              sx={{
                                padding: "0px",
                                color: "gray",
                                "&.Mui-checked": {
                                  color: "gray",
                                },
                                "&.Mui-unchecked": {
                                  color: "gray",
                                },
                              }}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Flipkart
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products for Desktop view */}
              <div className={"col-9 p-2 " + styles.productslistdivwindow}>
                {products && products.length > 0 ? (
                  products.slice(firstIndex, lastIndex).map((item, index) => (
                    <div
                      className="row w-40"
                      style={{ height: "400px" }}
                      key={index}
                    >
                      <DesktopListingCard item={item} />
                    </div>
                  ))
                ) : (
                  <div
                    style={{ position: "absolute", top: "10%", left: "50%" }}
                  >
                    <p className={styles.noProducts}>
                      Sorry , No products found
                    </p>
                  </div>
                )}
              </div>

              {/* Filters for mobile View */}
              <div
                className={"d-flex flex-column col-12 " + styles.filterMobile}
              >
                <div className={"col-12 " + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{ height: "420px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "end",
                          }}
                        >
                          <div>
                            <p
                              className="mb-0 mt-3"
                              style={{ fontWeight: "bolder" }}
                            >
                              Filter by Size
                            </p>
                          </div>

                          <div
                            className="mb-0 mt-2"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "10px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="inches"
                                checked={unit === "inches"}
                                onChange={handleUnit}
                                style={{ marginTop: "5px" }}
                              />
                              inch
                            </label>
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="mm"
                                checked={unit === "mm"}
                                onChange={handleUnit}
                                style={{ marginTop: "5px" }}
                              />
                              mm
                            </label>
                          </div>
                        </div>

                        <p className="mb-0 mt-2">Length</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={length}
                          onChange={handleLength}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Breadth</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={breadth}
                          onChange={handleBradth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Height</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={height}
                          onChange={handleHeight}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <button
                          className={styles.packagebtn}
                          onClick={handleApply}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"mt-2 col-12 " + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{ height: "230px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <p
                          className="mb-0 mt-3"
                          style={{ fontWeight: "bolder" }}
                        >
                          Filter by Brands
                        </p>

                        <div className="mt-4 d-flex flex-column align-items-start gap-3">
                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbad301ec4f2f4266103")
                              }
                              sx={{
                                padding: "0px",
                                color: "gray",
                                "&.Mui-checked": {
                                  color: "gray",
                                },
                                "&.Mui-unchecked": {
                                  color: "gray",
                                },
                              }}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Amazon
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbbc301ec4f2f4266107")
                              }
                              sx={{
                                padding: "0px",
                                color: "gray",
                                "&.Mui-checked": {
                                  color: "gray",
                                },
                                "&.Mui-unchecked": {
                                  color: "gray",
                                },
                              }}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Flipkart
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbcc301ec4f2f426610b")
                              }
                              sx={{
                                padding: "0px",
                                color: "gray",
                                "&.Mui-checked": {
                                  color: "gray",
                                },
                                "&.Mui-unchecked": {
                                  color: "gray",
                                },
                              }}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Myntra
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6582c8580ab82549a084894f")
                              }
                              sx={{
                                padding: "0px",
                                color: "gray",
                                "&.Mui-checked": {
                                  color: "gray",
                                },
                                "&.Mui-unchecked": {
                                  color: "gray",
                                },
                              }}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Ajio
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products for Mobile view */}
              <div
                className={"col-8 p-0 w-100 " + styles.productslistdivmobile}
              >
                {products && products.length > 0 ? (
                  products.slice(firstIndex, lastIndex).map((item, index) => (
                    <div
                      className="mt-4 d-flex flex-column justify-content-start align-items-center"
                      style={{ width: "170px", height: "205px" }}
                      key={index}
                    >
                      <ListingCard item={item} />
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <p className={styles.noProductsMobile}>
                      Sorry , no products found
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="row" style={{ marginTop: "36px" }}>
              <div
                className="row mt-2 m-0"
                style={{ height: "1px", backgroundColor: "#D9D9D9" }}
              ></div>
            </div>

            <div className="row mt-4 p-0 m-0">
              <div
                className="col d-flex flex-column align-items-center justify-content-center "
                style={{ paddingBottom: "70px" }}
              >
                <Stack spacing={2} className={styles.pagingdivlast}>
                  <Pagination
                    count={totalPages}
                    variant="outlined"
                    shape="rounded"
                    onChange={handleChangePage}
                    page={currentPage}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoppTape;

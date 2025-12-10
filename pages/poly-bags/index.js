"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Head from "next/head";
import { getService, postService } from "../../services/service";
import PolyBagBanner from "../../components/landing/PolyBagBanner";
import { useRouter } from "next/router";
import ListingCard from "../../components/listing/ListingCard";
import ListingCardDesktop from "../../components/listing/ListingCardDesktop";
import DesktopListingCard from "../../components/listing/DesktopLisingCard";
import Loader from "../../components/loader";

export async function getServerSideProps(context) {
  const searchRes = await getService(`category/all`);
  const prod = await getService("product/all");
  const query = context.query;

  const POLY_BAG_CATEGORY_ID = "6557df4f301ec4f2f426613d";

  const allProducts = prod?.data?.data || [];

  // ✅ Filter only Poly Bag products on the server
  const polyBagsProducts = allProducts.filter((p) => {
    if (p.category && typeof p.category === "object") {
      return (
        p.category._id === POLY_BAG_CATEGORY_ID ||
        p.category._id?.toString() === POLY_BAG_CATEGORY_ID ||
        p.category.name?.trim().toLowerCase() === "poly bag"
      );
    }
    return p.category === POLY_BAG_CATEGORY_ID;
  });

  let brandId = null;
  if (query?.brand) {
    const brands = await getService(`brand/all`);
    const brand = brands?.data?.data?.filter(
      (item) => item.name === query?.brand
    );
    brandId = brand[0]?._id || null;
  }

  let subCategoryId = null;
  if (query?.subcategory) {
    const subcategories = await getService(`subcategory/all`);
    const subcategory = subcategories?.data?.data?.filter(
      (item) => item.name === query?.subcategory
    );
    subCategoryId = subcategory[0]?._id || null;
  }

  return {
    props: {
      brand: searchRes?.data ? searchRes?.data?.data : [],
      // 👇 send filtered poly bag products
      product: polyBagsProducts,
      category: query?.category || null,
      brandId,
      subCategoryId,
      q: query?.q || null,
    },
  };
}

const BoppTape = ({ brand, product, category, brandId, subCategoryId, q }) => {
  const router = useRouter();
  const [products, setProducts] = useState(product || []);
  const [width, setWidth] = useState([0, 600]);
  const [breadth, setBreadth] = useState([0, 600]);
  const [height, setHeight] = useState([100, 1000]);
  const [checked, setChecked] = useState([]);
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
  const [count, setCount] = useState(0);

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

  const handleWidth = (event, newValue) => {
    setWidth(newValue);
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
      setFlags({
        ...flags,
        size: true,
      });
      if (flags?.category) {
        const data = {
          width: {
            min: width?.[0],
            max: width?.[1],
          },
          breadth: {
            min: breadth?.[0],
            max: breadth?.[1],
          },
          category: seelctedCategories,
          unit: unit,
        };
        const dat = await postService("/label/filter", data);
        setProducts(dat?.data?.data);
      } else {
        const data = {
          width: {
            min: width?.[0],
            max: width?.[1],
          },
          breadth: {
            min: breadth?.[0],
            max: breadth?.[1],
          },
          unit: unit,
        };
        const dat = await postService("/label/filter", data);
        const filteredProducts = dat?.data?.data.filter((product) => {
          return product.category === "6557df4f301ec4f2f426613d";
        });

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ when SSR `product` changes, set to state (no extra filtering)
  useEffect(() => {
    if (product) {
      setProducts(product);
    }
  }, [product]);

  const filterProducts = async (cat) => {
    setFlags({
      ...flags,
      category: true,
    });
    if (flags?.size) {
      const temp = seelctedCategories;
      const index = seelctedCategories.findIndex((item) => item === cat);
      if (index === -1) {
        temp.push(cat);
        setSelectedCategories(temp);
        const data = {
          width: {
            min: width?.[0],
            max: width?.[1],
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
        const dat = await postService("/label/filter", data);
        setProducts(dat?.data?.data);
      } else {
        temp.splice(index, 1);
        setSelectedCategories(temp);
        const data = {
          width: {
            min: width?.[0],
            max: width?.[1],
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
        const dat = await postService("/label/filter", data);
        setProducts(dat?.data?.data);
      }
    } else {
      const temp = seelctedCategories;
      const index = seelctedCategories.findIndex((item) => item === cat);
      if (index === -1) {
        temp.push(cat);
        setSelectedCategories(temp);
        const data = {
          category: temp,
          ...(brandId !== null && { brand: brandId }),
          ...(subCategoryId !== null && { subcategory: subCategoryId }),
        };
        const dat = await postService("/label/filter", data);
        setProducts(dat?.data?.data);
      } else {
        temp.splice(index, 1);
        setSelectedCategories(temp);
        const data = {
          category: temp,
        };
        const dat = await postService("/label/filter", data);
        setProducts(dat?.data?.data);
      }
    }
  };

  const handlecat = async (id) => {
    setIsLoading(true);
    try {
      await filterBrandProducts(id);
      const data = checked;
      setChecked(data);
      setCount(count + 1);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBrandProducts = async (cat) => {
    setFlags({
      ...flags,
      brand: true,
    });
    if (flags?.size) {
      const temp = seelctedBrand;
      const index = seelctedBrand.findIndex((item) => item === cat);
      if (index === -1) {
        temp.push(cat);
        setSelectedBrand(temp);
        const data = {
          length: {
            min: length?.[0],
            max: length?.[1],
          },
          breadth: {
            min: length?.[0],
            max: length?.[1],
          },
          height: {
            min: length?.[0],
            max: length?.[1],
          },
          brand: temp,
          ...(brandId !== null && { brand: brandId }),
          ...(subCategoryId !== null && { subcategory: subCategoryId }),
        };
        const dat = await postService("/product/filter", data);
        setProducts(dat?.data?.data);
      } else {
        temp.splice(index, 1);
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
      }
    } else {
      const temp = seelctedCategories;
      const index = seelctedCategories.findIndex((item) => item === cat);
      if (index === -1) {
        temp.push(cat);
        setSelectedBrand(temp);
        const data = {
          brand: temp,
          ...(brandId !== null && { brand: brandId }),
          ...(subCategoryId !== null && { subcategory: subCategoryId }),
        };
        const dat = await postService("/product/filter", data);
        const filteredProducts = dat?.data?.data?.filter(
          (product) => product.category === "6557df4f301ec4f2f426613d"
        );
        setProducts(filteredProducts);
      } else {
        temp.splice(index, 1);
        setSelectedBrand(temp);
        const data = {
          brand: temp,
        };
        const dat = await postService("/product/filter", data);
        const filteredProducts = dat?.data?.data?.filter(
          (product) => product.category === "6557df4f301ec4f2f426613d"
        );
        setProducts(filteredProducts);
      }
    }
  };

  useEffect(() => {
    if (brand) {
      const data = brand?.map((item) => {
        item.checked = false;
        return item;
      });
      if (category) {
        const index = brand.findIndex((item) => item.name === category);
        const cate = brand?.filter((item) => item.name === category);
        filterProducts(cate[0]?._id);
        if (index) data[index] = true;
        setChecked(data);
      } else {
        setChecked(data);
      }
    }
  }, [brand, category]);

  const handleQuery = async () => {
    const data = {
      q: q,
    };
    const dat = await postService("label/filter", data);
    setProducts(dat?.data?.data);
  };

  useEffect(() => {
    if (q) {
      handleQuery();
    }
  }, [q]);

  useEffect(() => {
    if (products?.length > 0) {
      setTotalPages(Math.ceil(products?.length / showing));
      const last = currentPage * showing;
      const first = last - showing;
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

  const handleSort = async (type) => {
    const temp = [...products];

    if (type === "low to high") {
      const sortedLowToHigh = temp
        .slice()
        .sort((a, b) => a?.priceList?.[0]?.SP - b?.priceList?.[0]?.SP);
      setProducts(sortedLowToHigh);
      setCount(count + 1);
    } else if (type === "high to low") {
      const sortedHighToLow = temp
        .slice()
        .sort((a, b) => b?.priceList?.[0]?.SP - a?.priceList?.[0]?.SP);
      setProducts(sortedHighToLow);
      setCount(count + 2);
    }
  };

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

  return (
    <>
      <Head>
        <title>Buy custom Poly Bags online | store.prempackaging </title>
        <meta name="title" content="Buy custom Poly Bags online" />
        <meta
          name="description"
          content="If you want to buy poly bags online, browse our website store.prempackaging.com. Our ecommerce printed poly bags ensure protection and reliability. Order your custom poly bags online."
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        {isLoading && <Loader />}
        <div className="row p-0 m-0">
          <PolyBagBanner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className="mt-2 d-flex flex-column">
              <p className={styles.catalogpath}>
                <span onClick={() => router.push("/")}>Homepage</span> /{" "}
                <span className={styles.spanee}> Poly Bags</span>
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
              <div className={"col-6 p-0 m-0 " + styles.filterheadersubb}>
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
                    onChange={(e) => setShowing(parseInt(e.target.value))}
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
                    <option defaultValue disabled>
                      Default sorting
                    </option>
                    <option value="high to low">High to Low</option>
                    <option value="low to high">Low to high</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="row mt-4" style={{ position: "relative" }}>
              {/* Desktop Filter */}
              <div
                className={"d-flex flex-column col-3 " + styles.desktopFilter}
              >
                <div className={"col-12 p-0 m-0" + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "320px", border: "1px solid #E6E6E6" }}
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
                            alignItems: "center",
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
                            <label>
                              <input
                                type="radio"
                                name="unit"
                                value="inches"
                                checked={unit === "inches"}
                                onChange={() => setUnit("inches")}
                              />
                              inch
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="unit"
                                value="mm"
                                checked={unit === "mm"}
                                onChange={() => setUnit("mm")}
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
                            {unit === "inches" ? 20 : 600}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={width}
                          onChange={handleWidth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0}
                          max={unit === "inches" ? 20 : 600}
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
                            {unit === "inches" ? 20 : 600}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={breadth}
                          onChange={handleBradth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0}
                          max={unit === "inches" ? 20 : 600}
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

                <div className={"mt-2 col-12 p-0 m-0" + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "200px", border: "1px solid #E6E6E6" }}
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
                              iconStyle={{ fill: "gray" }}
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
                              iconStyle={{ fill: "gray" }}
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
                              iconStyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("66a206274e2b1ddf543d9df2")
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
                              Plain
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* this column is for windows view */}
              <div className={"col-9 " + styles.productslistdivwindow}>
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
                      Sorry , No products found Charan
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Filter */}
              <div
                className={"d-flex flex-column col-12 " + styles.mobileFilter}
              >
                <div className={"col-12 p-0 m-0" + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{
                      height: "320px",
                      border: "1px solid #E6E6E6",
                      marginLeft: "10px",
                    }}
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
                            alignItems: "center",
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
                            <label>
                              <input
                                type="radio"
                                name="unit"
                                value="inches"
                                checked={unit === "inches"}
                                onChange={() => setUnit("inches")}
                              />
                              inch
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="unit"
                                value="mm"
                                checked={unit === "mm"}
                                onChange={() => setUnit("mm")}
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
                            {unit === "inches" ? 20 : 600}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={width}
                          onChange={handleWidth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0}
                          max={unit === "inches" ? 20 : 600}
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
                            {unit === "inches" ? 20 : 600}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={breadth}
                          onChange={handleBradth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0}
                          max={unit === "inches" ? 20 : 600}
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

                <div className={"mt-2 col-12 p-0 m-0" + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{
                      height: "230px",
                      border: "1px solid #E6E6E6",
                      marginLeft: "10px",
                    }}
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
                              iconStyle={{ fill: "gray" }}
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
                              iconStyle={{ fill: "gray" }}
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
                              iconStyle={{ fill: "gray" }}
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
                              iconStyle={{ fill: "gray" }}
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

              {/* this column is for mobile view */}
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
                      Sorry , no products found hello
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

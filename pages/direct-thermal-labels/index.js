"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { getService, postService } from "../../services/service";
import DTLBanner from "../../components/landing/DTLBanner";
import { useRouter } from "next/router";
import ListingCard from "../../components/listing/ListingCard";
import ListingCardDesktop from "../../components/listing/ListingCardDesktop";
import DesktopListingCard from "../../components/listing/DesktopLisingCard";
import Loader from "../../components/loader";

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
  //   const deal = await getService("deal/all");
  return {
    props: {
      brand: searchRes?.data ? searchRes?.data?.data : [],
      product: prod?.data ? prod?.data?.data : [],
      category: query?.category ? query?.category : null,
      brandId: brandId ? brandId : null,
      subCategoryId: subCategoryId ? subCategoryId : null,
      q: query?.q ? query?.q : null,
      //   deal: deal?.data ? deal?.data?.data : [],
    },
  };
}

const BoppTape = ({ brand, product, category, brandId, subCategoryId, q }) => {
  const router = useRouter();
  const [products, setProducts] = useState();
  const [length, setLength] = useState([0, 300]);
  const [breadth, setBreadth] = useState([0, 300]);
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

  const handleLength = (event, newValue) => {
    setLength(newValue);
    //console.log(setWidth);
  };

  const handleBradth = (event, newValue) => {
    setBreadth(newValue);
    //console.log(setBreadth);
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
          length: {
            min: length?.[0],
            max: length?.[1],
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
          length: {
            min: length?.[0],
            max: length?.[1],
          },
          breadth: {
            min: breadth?.[0],
            max: breadth?.[1],
          },
          unit: unit,
        };
        const dat = await postService("/label/filter", data);
        const filteredProducts = dat?.data?.data.filter((product) => {
          return product.sub_category === "6557e1cb301ec4f2f426614c";
        });

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter products by category "Bopp tape"
    if (product) {
      const labelProducts = product.filter(
        (product) => product.sub_category === "6557e1cb301ec4f2f426614c"
      );
      // console.log(boppTapeProducts);
      //console.log(product);
      setProducts(labelProducts);
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
        const dat = await postService("/label/filter", data);
        setProducts(dat?.data?.data);
      } else {
        temp.splice(index, 1);
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

  useEffect(() => {
    if (brand) {
      const data = brand?.map((item) => {
        item.checked = false;
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
    const dat = await postService("product/filter", data);
    //console.log(dat?.data?.data);
    setProducts(dat?.data?.data);
  };

  useEffect(() => {
    if (q) {
      handleQuery();
    }
  }, [q]);

  const [count, setCount] = useState(0);

  const handlecat = async (id) => {
    //console.log(id , "288")
    filterBrandProducts(id);
    const data = checked;
    // data[index] = !data[index];
    setChecked(data);
    setCount(count + 1);
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
        //console.log("279", dat);
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
        //console.log("302", dat);
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
        //console.log("317", dat);
        const filteredProducts = dat?.data?.data?.filter(
          (product) => product.sub_category === "6557e1cb301ec4f2f426614c"
        );
        setProducts(filteredProducts);
      } else {
        temp.splice(index, 1);
        setSelectedBrand(temp);
        const data = {
          brand: temp,
        };
        const dat = await postService("/product/filter", data);
        //console.log("326", dat);
        const filteredProducts = dat?.data?.data?.filter(
          (product) => product.sub_category === "6557e1cb301ec4f2f426614c"
        );
        setProducts(filteredProducts);
      }
    }
  };

  useEffect(() => {
    if (products?.length > 0) {
      setTotalPages(Math.ceil(products?.length / showing));
      const last = currentPage * showing;
      const first = last - showing;
      setFirstIndex(first);
      setLastIndex(last);
    }
  }, [products, showing]);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
    const last = value * showing;
    const first = last - showing;
    setFirstIndex(first);
    setLastIndex(last);
  };

  const handleSort = async (type) => {
    // console.log(type , "308")
    const temp = [...products]; // Create a new array to prevent mutation

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
        <title>
          Buy Best Direct Thermal Label online | store.prempackaging
        </title>
        <meta name="title" content="Buy Best Direct Thermal Label online" />
        <meta
          name="description"
          content="Discover high-quality direct thermal labels for packaging at Prem Industries India Limited. Ensure efficient printing and labeling solutions. Order now"
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        {isLoading && <Loader />}
        <div className="row p-0 m-0">
          <DTLBanner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className="mt-2 d-flex flex-column">
              <p className={styles.catalogpath}>
                <span onClick={() => router.push("/")}>Homepage</span> /{" "}
                <span className={styles.spanee}>Direct Thermal Labels </span>
              </p>
              <div
                className="row mt-2 m-0"
                style={{ height: "1px", backgroundColor: "#D9D9D9" }}
              ></div>
            </div>
            <div className={"row " + styles.filterheader}>
              <div className={"col-6 p-0 m-0 " + styles.filterheadersuba}>
                <p className={styles.showresulttext}>
                  Showing all {products?.length} results
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
              <div
                className={"d-flex flex-column col-3 " + styles.desktopFilter}
              >
                <div className={"col-12 m-0 p-0 " + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "300px", border: "1px solid #E6E6E6" }}
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
                                onChange={handleUnit}
                                style={{ marginTop: "5px" }}
                              />
                              inch
                            </label>
                            <label>
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

                        <p className="mb-0 mt-2">Length (meters)</p>
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
                            {unit === "inches" ? 20 : 300}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={length}
                          onChange={handleLength}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0} // Set min value based on the selected unit
                          max={unit === "inches" ? 20 : 300}
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
                            {unit === "inches" ? 20 : 300}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={breadth}
                          onChange={handleBradth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0} // Set min value based on the selected unit
                          max={unit === "inches" ? 20 : 300}
                        />
                        {/*<p className="mb-0 mt-1">Height</p>
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
                        100
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
                        1000
                      </p>
                    </div>
                    <Slider
                      sx={CustomSliderStyles}
                      getAriaLabel={() => "Temperature range"}
                      value={height}
                      onChange={handleHeight}
                      valueLabelDisplay="auto"
                      getAriaValueText={valuetext}
                      min={100}
                      max={1000}
                    /> */}
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
                {/* <div className={"mt-2 col-12 m-0 p-0" + styles.filterslayout}>
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

                        <div
                          className="mt-4 d-flex flex-column align-items-start gap-3"
                          
                        >
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
                </div> */}
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
                      Sorry , No products found
                    </p>
                  </div>
                )}
              </div>

              {/* Filters for Desktop View */}
              <div
                className={"d-flex flex-column col-12 " + styles.mobileFilter}
              >
                <div className={"col-12 m-0 p-0 " + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{
                      height: "330px",
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
                                onChange={handleUnit}
                                style={{ marginTop: "5px" }}
                              />
                              inch
                            </label>
                            <label>
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

                        <p className="mb-0 mt-2">Length (meters)</p>
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
                            {unit === "inches" ? 20 : 300}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={length}
                          onChange={handleLength}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0} // Set min value based on the selected unit
                          max={unit === "inches" ? 20 : 300}
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
                            {unit === "inches" ? 20 : 300}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          getAriaLabel={() => "Temperature range"}
                          value={breadth}
                          onChange={handleBradth}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={unit === "inches" ? 0 : 0} // Set min value based on the selected unit
                          max={unit === "inches" ? 20 : 300}
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
              </div>

              {/* this column is for mobile view */}
              <div
                className={"col-8 p-0 w-100 " + styles.productslistdivmobile}
              >
                {products && products.length > 0 ? (
                  products.slice(firstIndex, lastIndex).map((item, index) => (
                    <div
                      className="mt-4 d-flex flex-column justify-content-start align-items-center"
                      style={{ width: "180px", maxHeight: "280px" }}
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
                    currentPage={currentPage}
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

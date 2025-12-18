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
import { getService, postService } from "../../services/service";
import Banner from "../../components/landing/Banner";
import { useRouter } from "next/router";
import ListingCard from "../../components/listing/ListingCard";
import ListingCardDesktop from "../../components/listing/ListingCardDesktop";
import DesktopListingCard from "../../components/listing/DesktopLisingCard";
import Head from "next/head";
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
  const [width, setWidth] = useState([100, 1000]);
  const [breadth, setBreadth] = useState([100, 1000]);
  const [height, setHeight] = useState([100, 1000]);
  const [checked, setChecked] = useState([]);
  const [showing, setShowing] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstIndex, setFirstIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(5);
  const [unit, setUnit] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [flags, setFlags] = useState({
    size: false,
    category: false,
    sort: false,
  });

  const [seelctedCategories, setSelectedCategories] = useState([]);
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
    //console.log(setWidth);
  };

  const handleBradth = (event, newValue) => {
    setBreadth(newValue);
    //console.log(setBreadth);
  };

  const handleHeight = (event, newValue) => {
    setHeight(newValue);
    //console.log(setHeight);
  };

  const handleApply = async () => {
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
        height: {
          min: height?.[0],
          max: height?.[1],
        },
        category: seelctedCategories,
      };
      const dat = await postService("/product/filter", data);
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
        height: {
          min: height?.[0],
          max: height?.[1],
        },
      };
      const dat = await postService("/product/filter", data);
      const filteredProducts = dat?.data?.data.filter((product) => {
        return product.brand === "6582c8580ab82549a084894f";
      });

      setProducts(filteredProducts);
    }
  };

  useEffect(() => {
    // Filter products by category "Bopp tape"
    if (product) {
      const boppTapeProducts = product.filter(
        (product) => product.brand?.name === "Ajio"
      );
      // console.log(boppTapeProducts);
      // console.log(product);
      setProducts(boppTapeProducts);
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
          brand: "6582c8580ab82549a084894f",
          ...(subCategoryId !== null && { subcategory: subCategoryId }),
        };
        const dat = await postService("/product/filter", data);
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
          brand: "6582c8580ab82549a084894f", // Add the brand filter here
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
        setSelectedCategories(temp);
        const data = {
          category: temp,
          brand: "6582c8580ab82549a084894f", // Add the brand filter here
          ...(subCategoryId !== null && { subcategory: subCategoryId }),
        };
        const dat = await postService("/product/filter", data);
        setProducts(dat?.data?.data);
      } else {
        temp.splice(index, 1);
        setSelectedCategories(temp);
        const data = {
          category: temp,
          brand: "6582c8580ab82549a084894f", // Add the brand filter here
        };
        const dat = await postService("/product/filter", data);
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

  const handlecat = async (index, id) => {
    setIsLoading(true); // Show loader when checkbox is clicked
    try {
      await filterProducts(id);
      const data = checked;
      data[index] = !data[index];
      setChecked(data);
      setCount(count + 1);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsLoading(false); // Hide loader after processing
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
        <title>Buy Ajio Polybags Online | store.prempackaging</title>
        <meta name="title" content="Buy Ajio Polybags Online" />
        <meta
          name="description"
          content="Shop Ajio polybags online at store.prempackaging.com. Get reliable, secure, and eco-friendly packaging solutions for your business. Order today for fast delivery!"
        />
      </Head>
      {/* TEST COMMIT */}
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        {isLoading && <Loader />}
        <div className="row p-0 m-0">
          <Banner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className="mt-2 d-flex flex-column">
              <p className={styles.catalogpath}>
                <span onClick={() => router.push("/")}>Homepage</span> /{" "}
                <span className={styles.spanee}>Ajio Listing</span>
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
            <div className="row mt-4 " style={{ position: "relative" }}>
              <div className={"col-3 " + styles.filterslayout}>
                {/* <div
                className="w-100"
                style={{ height: "420px", border: "1px solid #E6E6E6" }}
              >
                <div
                  className="row m-0"
                  style={{ paddingLeft: 3, paddingRight: 3 }}
                >
                  <div className="col">
                    <div style={{display:"flex" , flexDirection:"row" , justifyContent:"space-between" , alignItems:"center"  }}>
                      <div>
                        <p
                          className="mb-0 mt-3"
                          style={{ fontWeight: "bolder" }}
                        >
                          Filter by Size
                        </p>
                      </div>

                      <div className="mb-0 mt-2" style={{display:"flex" , flexDirection:"row" , gap:"10px"}}>
                        <label >
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
                      value={width}
                      onChange={handleWidth}
                      valueLabelDisplay="auto"
                      getAriaValueText={valuetext}
                      min={100}
                      max={1000}
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
                      value={breadth}
                      onChange={handleBradth}
                      valueLabelDisplay="auto"
                      getAriaValueText={valuetext}
                      min={100}
                      max={1000}
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
                    />
                    <button className={styles.packagebtn} onClick={handleApply}>
                      Apply
                    </button>
                  </div>
                </div>
              </div> */}
              </div>
              {/* this column is for windows view */}
              <div className={"col-md-12"}>
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
                  <div style={{ top: "10%" }}>
                    <p className={styles.noProducts}>
                      We are authorised manufacturers of Ajio polybags. For
                      further purchases, please contact through the official
                      Reliance channel.
                    </p>
                  </div>
                )}
              </div>

              {/* this column is for mobile view */}
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

"use client"; // This is a client component 👈🏽
import React, { useEffect, useRef, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import styles from "./page.module.css";
import axios from "axios";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LockIcon from "@mui/icons-material/Lock";
import Select from "react-select";
import { Dropdown } from "react-bootstrap";
import CustomDropdown from "./CustomDropdown";
import { getCartCount } from "../../utils/cart";
import { PRODUCTION } from "../../services/service";
import Loader from "../../components/loader";
import {
  faChevronDown,
  faNavicon,
  faPhone,
  faHeart,
  faSearch,
  faCartShopping,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import styled from "@emotion/styled";
import Link from "next/link";
import { getService } from "../../services/service";
import { useRouter } from "next/router";

import Marquee from "react-fast-marquee";

const Navbar = () => {
  const router = useRouter();
  const [token, setToken] = useState();
  const [userName, setUserName] = useState();
  const [cart, setCart] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebartranslatevalue, Setsidebartranslatevalue] = useState(100);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isDropdownTapeOpen, setDropdownTapeOpen] = useState(false);
  const [isDropdownBrandOpen, setDropdownBrandOpen] = useState(false);
  const [isDropdownBrand2Open, setDropdownBrand2Open] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const [isDropdownSustainabilityOpen, setDropdownSustainabilityOpen] =
    useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCat, setSubCat] = useState([]);
  const [width, setWidth] = useState();
  const [selctedBrand, setSelectedBrand] = useState();
  const [selectedSubCat, setSelectedSubCat] = useState();
  const [query, setQuery] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [showDropdownMobile, setShowDropdownMobile] = useState(false);
  const [searchQueryMobile, setSearchQueryMobile] = useState("");
  const [searchProductsMobile, setSearchProductsMobile] = useState([]);
  const breakpoint = 700;
  const DEBOUNCE_DELAY = 500;
  const phoneNumber = "+918447247227";
  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);
  const dropdownRefSustainability = useRef(null);

  const handleCart = async () => {
    const c = await getCartCount();
    if (c !== null) {
      setCart(c);
    }
  };

  useEffect(() => {
    handleCart();
    // console.log(PRODUCTION);
  }, []);

  const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    paddingLeft: "30px",

    border: `0px`,
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
  }));

  const changetranslate = () => {
    if (sidebartranslatevalue == 0) {
      Setsidebartranslatevalue(100);
    } else {
      Setsidebartranslatevalue(0);
    }
  };

  const toggleDropdownLabel = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdownTape = () => {
    setDropdownTapeOpen(!isDropdownTapeOpen);
    setDropdownBrandOpen(false);
    setDropdownBrand2Open(false);
  };
  const toggleDropdownBrand = () => {
    setDropdownBrandOpen(!isDropdownBrandOpen);
    setDropdownBrand2Open(false);
  };
  const toggleDropdownBrand2 = () => {
    setDropdownBrand2Open(!isDropdownBrand2Open);
    setDropdownBrandOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // setDropdownOpen(false);
      setDropdownTapeOpen(false);
      // setIsOpen(false);
    }
  };

  const handleCloseDropdown = () => {
    setDropdownTapeOpen(false);
    setDropdownOpen(false);
  };

  const handleClickOutside1 = (event) => {
    if (dropdownRef1.current && !dropdownRef1.current.contains(event.target)) {
      setDropdownOpen(false);
      // setDropdownTapeOpen(false);
      // setIsOpen(false);
    }
  };

  const handleClickOutside2 = (event) => {
    if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
      setIsOpen(false);
      // setDropdownTapeOpen(false);
      // setIsOpen(false);
    }
  };

  const toggleNewDropdown = () => {
    setIsNewDropdownOpen(!isNewDropdownOpen);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside1);
    // document.addEventListener("mousedown", handleClickOutside2);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside1);
      // document.removeEventListener("mousedown", handleClickOutside2);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth);
      const handleResizeWindow = () => setWidth(window.innerWidth);
      // subscribe to window resize event "onComponentDidMount"

      window.addEventListener("resize", handleResizeWindow);
      return () => {
        // unsubscribe "onComponentDestroy"
        window.removeEventListener("resize", handleResizeWindow);
      };
    }
  }, []);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "none", // Remove the border
      fontFamily: "Montserrat", // Set the custom font family
      fontSize: "16px",
      textAlign: "right",
      color: "#333333",
      fontWeight: 400,
      textTransform: "capitalize",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#333333",
      textAlign: "right",
      width: "auto",
      minWidth: "40px", // Set the placeholder color to black
    }),
    menu: (provided) => ({
      ...provided,
      width: "120px", // Set the desired fixed width for the menu
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      backgroundImage:
        'url("https://res.cloudinary.com/dwxqg9so3/image/upload/v1693866197/Stroke-1_ymridf.png")', // Set your custom arrow image
      backgroundSize: "10px", // Adjust the size of your custom arrow
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      width: "0px", // Set the width of the dropdown indicator
    }),
    // Add any other custom styles here for other components like menu, option, etc.
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Get the user's token from local storage
    const token = localStorage.getItem("PIToken");
    setToken(token);

    // Get the user's data from local storage
    const userData = JSON.parse(localStorage.getItem("PIUser"));

    // Check if userData contains the user's name and store it in state
    if (userData && userData.first_name) {
      const fullName = `${userData.first_name} ${userData.last_name}`;
      setUserName(fullName);
    }
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.removeItem("PIToken");
    localStorage.removeItem("PIUser");
    setTimeout(() => {
      router.push("/login").then(() => {
        window.location.reload();
      });
      setIsLoading(false);
    }, 3500);
  };

  const handleClickMyAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      // console.log("293", userName);
      if (userName) {
        router.push("/my-orders");
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    }, 3500);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Clicked outside the dropdown, close it
        setShowDropdown(false);
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      if (searchQuery.length >= 0) {
        const response = await axios.post(PRODUCTION + "product/main/search", {
          search: searchQuery,
        });

        if (response.data.success) {
          setSearchProducts(response.data.data);
          setShowDropdown(true);
        } else {
          setSearchProducts([]);
        }
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const handleSearchMobile = async () => {
    try {
      if (searchQueryMobile.length >= 0) {
        const response = await axios.post(
          "https://server.prempackaging.com/premind/api/product/main/search",
          { search: searchQueryMobile } // Sending the search query in the request body
        );

        if (response.data.success) {
          setSearchProductsMobile(response.data.data);
          setShowDropdownMobile(true);
        } else {
          setSearchProductsMobile([]);
        }
        // router.push("/listingpage");
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/corrugated-boxes");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickHome = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickLabel = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/label");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickDTL = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/direct-thermal-labels");
      setIsLoading(false);
    }, 3500);
  };
  const toggleDropdownSustainability = () => {
    setDropdownSustainabilityOpen(!isDropdownSustainabilityOpen);
  };
  const handleClickCL = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/chromo-labels");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickPaperBag = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/paper-bags");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickPolyBag = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/poly-bags");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickTape = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/tape");
      setIsLoading(false);
    }, 3500);
  };
  const handleClickBrand = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickBOPPTape = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/bopp-tapes");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickPaperTape = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/paper-tapes");
      setIsLoading(false);
    }, 3500);
  };
  const handleClickCarryHandleTape = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/packpro-carry-handle-tapes");
      setIsLoading(false);
    }, 3500);
  };
  const handleClickFoodWrappingPaper = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/packpro-food-wrapping-papers");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickSpecialityTape = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/speciality-tape");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickSignUp = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/sign-up");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/login");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickCart = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/my-cart");
      setIsLoading(false);
    }, 3500);
  };

  return (
    <>
      <div
        className="row m-0"
        style={{
          position: "fixed",
          backgroundColor: "white",
          zIndex: "20",
          width: `${width > breakpoint ? "100vw" : "100vw"}`,
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        }}
      >
        <Marquee
          className="text-white"
          style={{
            backgroundColor: "#E92227",
            fontWeight: "600",
            height: "35px",
          }}
        >
          <h5>
            Winter Sale is Here! Enjoy 10% OFF on All Packaging Solutions When
            You Shop Through our Website or Mobile App. Use Code WINTERSALE10 At
            Checkout. Hurry—Offer Valid for a Limited Time! &nbsp; &nbsp;&nbsp;
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          </h5>
        </Marquee>
        {isLoading && <Loader />}
        {/* sidebar mobile view */}
        <div
          className="bg-white"
          style={{
            position: "absolute",
            height: "100vh",
            maxHeight: "100vh",
            overflowY: "auto",
            width: "35vh",
            zIndex: "1000000",
            transition: "all 0.3s ease",
            transform: "translate(-" + sidebartranslatevalue + "%, 0)",
          }}
        >
          <div
            className="row "
            style={{ backgroundColor: "#182C5A", height: "50px" }}
          >
            <div
              className="d-flex flex-row align-items-center "
              style={{
                justifyContent: "space-between",
                marginTop: "10px",
                // padding: "0px",
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                  paddingLeft: "20px",
                  paddingRight: "10px",
                }}
              >
                <FontAwesomeIcon
                  icon={faUser}
                  // onClick={toggleDropdown}
                  style={{
                    color: "#e92227",
                    width: "20px",
                    height: "20px",
                    paddingLeft: "0px",
                  }}
                />
                <p
                  className="headertext"
                  style={{
                    marginLeft: "7px",
                    marginBottom: "0px",
                    color: "#FFF",
                    fontFeatureSettings: "'liga' off",
                    fontFamily: "Montserrat",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: "500",
                    lineHeight: "18px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    userSelect: "none",
                  }}
                  onClick={toggleDropdown}
                >
                  {userName}
                </p>
              </div>

              <div className="m-0 d-flex" style={{ width: "fit-content" }}>
                <img
                  src="sidebarcross.png"
                  style={{ width: "17px", height: "17px" }}
                  onClick={changetranslate}
                />
              </div>
            </div>
          </div>

          <div
            className="row"
            style={{
              height: "4px",
              backgroundColor: "rgba(206, 206, 206, 0.50)",
            }}
          >
            {" "}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: "10px",
              marginLeft: "20px",
              marginTop: "10px",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            <Link
              href="/corrugated-boxes"
              onClick={() => {
                changetranslate();
                handleClick();
              }}
              style={{
                textDecoration: "none",
                color: "#333333",
                fontWeight: "600",
                fontSize: "16px",
                lineHeight: "21px",
              }}
            >
              <span>CORRUGATED BOXES</span>
            </Link>

            <Link
              href="/paper-bags"
              onClick={() => {
                changetranslate();
                handleClickPaperBag();
              }}
              style={{
                textDecoration: "none",
                color: "#333333",
                fontWeight: "600",
                fontSize: "16px",
                lineHeight: "21px",
              }}
            >
              <span>PAPER BAGS</span>
            </Link>

            <Link
              href="/poly-bags"
              onClick={() => {
                changetranslate();
                handleClickPolyBag();
              }}
              style={{
                textDecoration: "none",
                color: "#333333",
                fontWeight: "600",
                fontSize: "16px",
                lineHeight: "21px",
              }}
            >
              <span>POLY BAGS</span>
            </Link>
            <div
              ref={dropdownRefSustainability}
              style={{ position: "relative" }}
            >
              <div
                onClick={toggleDropdownSustainability}
                style={{
                  textDecoration: "none",
                  color: "#333333",
                  fontWeight: "600",
                  fontSize: "16px",
                  lineHeight: "21px",
                }}
              >
                <span>SUSTAINABLE PRODUCTS</span>
                <ArrowDropDownIcon sx={{ color: "#333333" }} />
              </div>

              {isDropdownSustainabilityOpen && (
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "white",
                    top: "25px",
                    left: "0",
                    border: "1px solid #ccc",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    width: "200px",
                    zIndex: 9999,
                  }}
                >
                  <Link
                    href="/carry-bags"
                    style={{
                      display: "block",
                      padding: "10px",
                      color: "#333",
                      textDecoration: "none",
                      fontWeight: "500",
                      borderBottom: "1px solid #ccc",
                      fontSize: "14px",
                    }}
                    onClick={() => setDropdownSustainabilityOpen(false)}
                  >
                    CARRY BAGS
                  </Link>
                </div>
              )}
            </div>

            <div
              ref={dropdownRef}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  textDecoration: "none solid rgb(51,51,51)",
                  color: "#333333",
                  fontWeight: "600",
                  fontSize: "14px",
                  lineHeight: "21px",
                  cursor: "pointer",
                }}
              >
                <span
                  onClick={handleClickBrand}
                  style={{
                    textDecoration: "none solid rgb(51,51,51)",
                    color: "#333333",
                    fontWeight: "600",
                    fontSize: "16px",
                    lineHeight: "21px",
                  }}
                >
                  OUR BRANDS
                </span>
              </div>
              <div
                onClick={toggleDropdownTape}
                style={{
                  textDecoration: "none solid rgb(51,51,51)",
                  color: "#333333",
                  fontWeight: "600",
                  fontSize: "14px",
                  lineHeight: "21px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <ArrowDropDownIcon sx={{ color: "#333333" }} />
              </div>
              {isDropdownTapeOpen && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "absolute",
                    backgroundColor: "white",
                    top: "20px",
                    left: "45px",
                    border: "1px solid #ccc",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    // gap: "10px",
                    width: "200px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: "1px solid #ccc",
                      paddingBlock: "10px",
                    }}
                  >
                    <Link
                      href="/packpro"
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "500",
                        fontSize: "14px",
                        lineHeight: "21px",
                        textAlign: "center",
                      }}
                      onClick={() => {
                        handleCloseDropdown();
                      }}
                    >
                      PACKPRO™
                    </Link>
                    <div
                      onClick={toggleDropdownBrand}
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "21px",
                        cursor: "pointer",
                      }}
                    >
                      <ArrowDropDownIcon sx={{ color: "#333333" }} />
                    </div>
                    {isDropdownBrandOpen && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          position: "absolute",
                          backgroundColor: "white",
                          top: "45px",
                          left: "45px",
                          border: "1px solid #ccc",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                          // gap: "10px",
                          width: "200px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/bopp-tapes"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickBOPPTape();
                            }}
                          >
                            BOPP TAPES
                          </Link>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/paper-tapes"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickPaperTape();
                            }}
                          >
                            PAPER TAPES
                          </Link>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/void-tapes"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                            }}
                            rel="noopener noreferrer"
                          >
                            VOID TAPES
                          </Link>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/packpro-carry-handle-tapes"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickCarryHandleTape();
                            }}
                          >
                            CARRY HANDLE TAPES
                          </Link>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/packpro-food-wrapping-papers"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickFoodWrappingPaper();
                            }}
                          >
                            FOOD WRAPPING PAPERS
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: "1px solid #ccc",
                      paddingBlock: "10px",
                    }}
                  >
                    <Link
                      href="/rollabel"
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "500",
                        fontSize: "14px",
                        lineHeight: "21px",
                        textAlign: "center",
                      }}
                      onClick={() => {
                        handleCloseDropdown();
                        handleClickBOPPTape();
                      }}
                    >
                      ROLLABEL™
                    </Link>
                    <div
                      onClick={toggleDropdownBrand2}
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "21px",
                        cursor: "pointer",
                      }}
                    >
                      <ArrowDropDownIcon sx={{ color: "#333333" }} />
                    </div>
                    {isDropdownBrand2Open && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          position: "absolute",
                          backgroundColor: "white",
                          top: "90px",
                          left: "45px",
                          border: "1px solid #ccc",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                          // gap: "10px",
                          width: "200px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/direct-thermal-labels"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickDTL();
                            }}
                          >
                            DIRECT THERMAL LABELS
                          </Link>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/chromo-labels"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              textAlign: "center",
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickCL();
                            }}
                          >
                            CHROMO LABELS
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="row"
            style={{
              height: "4px",
              backgroundColor: "rgba(206, 206, 206, 0.50)",
            }}
          >
            {" "}
          </div>

          <div
            className="row d-flex flex-column py-1"
            style={{ width: "fit-content", height: "fit-content" }}
          >
            <div
              className="d-flex flex-row align-items-center py-2"
              style={{ gap: "25px" }}
            >
              <LockOpenOutlinedIcon
                fontSize="large"
                sx={{ color: "#E92227" }}
              />

              <p
                className=""
                style={{
                  color: "#212121",
                  fontFeatureSettings: "'liga' off",
                  fontFamily: "Montserrat",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: "500",
                  lineHeight: "18px",
                  letterSpacing: "0.344px",
                  cursor: "pointer",
                  paddingTop: "15px",
                }}
              >
                {token ? (
                  <span onClick={handleLogout}>Logout</span>
                ) : (
                  <>
                    <span
                      onClick={() => {
                        changetranslate();
                        handleClickSignUp();
                      }}
                    >
                      Sign Up
                    </span>{" "}
                    /{" "}
                    <span
                      onClick={() => {
                        changetranslate();
                        handleClickSignIn();
                      }}
                    >
                      Sign In
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div
            className="row "
            style={{
              height: "4px",
              backgroundColor: "rgba(206, 206, 206, 0.50)",
            }}
          >
            {" "}
          </div>

          <div
            className="row d-flex flex-column py-1"
            style={{ width: "fit-content", height: "fit-content" }}
          >
            <Link
              href={`tel:${phoneNumber}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <div className="d-flex flex-row align-items-center py-1">
                <LocalPhoneOutlinedIcon
                  fontSize="large"
                  sx={{ color: "#E92227" }}
                />

                <p
                  className="p-0 m-0 mx-4"
                  style={{
                    color: "#212121",
                    fontFeatureSettings: "'liga' off",
                    fontFamily: "Montserrat",
                    fontSize: "17.211px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "44.863px",
                    letterSpacing: "0.344px",
                    textDecoration: "none",
                  }}
                >
                  +91 84472 47227
                </p>
              </div>
            </Link>

            <Link
              href="https://wa.me/8447247227?text=Hi"
              target="_blank"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <div className="d-flex flex-row align-items-center">
                <Link href="https://wa.me/8447247227?text=Hi" target="_blank">
                  <WhatsAppIcon fontSize="large" sx={{ color: "#E92227" }} />
                </Link>

                <p
                  className="p-0 m-0 mx-4"
                  style={{
                    color: "#212121",
                    fontFeatureSettings: "'liga' off",
                    fontFamily: "Montserrat",
                    fontSize: "17.211px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "44.863px",
                    letterSpacing: "0.344px",
                  }}
                >
                  +91 844724 7227
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className={"row " + styles.topbar}>
          <div
            className="col-12 h-100 d-flex flex-row align-items-center justify-content-end px-5 m-0"
            style={{
              display: width < breakpoint ? "block" : "none",
            }}
          >
            <FontAwesomeIcon
              icon={faUser}
              onClick={toggleDropdown}
              style={{
                color: "#e92227",
                width: "15px",
                height: "15px",
                paddingLeft: "10px",
              }}
            />
            <p
              className="headertext"
              ref={dropdownRef2}
              style={{
                marginLeft: "7px",
                marginBottom: "0px",
                textDecoration: "none solid rgb(51,51,51)",
                color: "#333333",
                fontFeatureSettings: "'liga' off",
                fontFamily: "Montserrat",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: "500",
                lineHeight: "18px",
                cursor: "pointer",
                textTransform: "capitalize",
                userSelect: "none",
              }}
              onClick={toggleDropdown}
            >
              Welcome {userName}
            </p>
            {isOpen && (
              <div
                className="dropdown"
                style={{
                  position: "absolute",
                  top: "15%",
                  right: "15%",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  zIndex: "999",
                }}
              >
                {token ? (
                  <div
                    className="dropdown-item"
                    style={{ padding: "8px", borderBottom: "1px solid #ccc" }}
                    onClick={handleLogout}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        cursor: "pointer",
                      }}
                    >
                      Logout
                    </span>
                  </div>
                ) : (
                  <div className="dropdown-item" style={{ padding: "8px" }}>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        handleClickSignUp();
                      }}
                    >
                      Sign Up
                    </span>{" "}
                    /{" "}
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        handleClickSignIn();
                      }}
                    >
                      Sign In
                    </span>
                  </div>
                )}
                <div
                  className="dropdown-item text-center"
                  style={{ padding: "8px", borderBottom: "1px solid #ccc" }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      textDecoration: "none solid rgb(51,51,51)",
                      color: "#333333",
                      cursor: "pointer",
                    }}
                    onClick={handleClickMyAccount}
                  >
                    My Orders
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                marginLeft: "12px",
                height: "18px",
                borderLeft: "2px solid #D9D9D9",
              }}
            ></div>
            <Link
              href="/my-cart"
              onClick={handleClickCart}
              style={{ textDecoration: "none", color: "black" }}
            >
              <FontAwesomeIcon
                icon={faCartShopping}
                style={{
                  color: "#e92227",
                  width: "15px",
                  height: "15px",
                  paddingLeft: "10px",
                }}
              />
            </Link>
            <p
              className="headertext"
              style={{ marginLeft: "7px", marginBottom: "0px" }}
            >
              <Link
                href="/my-cart"
                onClick={handleClickCart}
                style={{
                  textDecoration: "none solid rgb(51,51,51)",
                  color: "#333333",
                }}
              >
                Cart ({cart?.count !== undefined ? cart.count : 0})
              </Link>
            </p>
            <div
              style={{
                marginLeft: "12px",
                height: "18px",
                borderLeft: "2px solid #D9D9D9",
              }}
            ></div>
            <Link
              href="/wishlist"
              style={{ textDecoration: "none", color: "black" }}
            >
              <FontAwesomeIcon
                icon={faHeart}
                style={{
                  color: "#E92227",
                  width: "15px",
                  height: "15px",
                  paddingLeft: "10px",
                }}
              />
            </Link>
            <p
              className="headertext"
              style={{ marginLeft: "7px", marginBottom: "0px" }}
            >
              <Link
                href="/wishlist"
                style={{
                  textDecoration: "none solid rgb(51,51,51)",
                  color: "#333333",
                }}
              >
                Wishlist
              </Link>
            </p>
          </div>
        </div>

        {/* header part 1 */}

        {width > breakpoint ? (
          <div className="row p-0 m-0" style={{ height: "100px" }}>
            <div className="row p-0 m-0">
              <div className="col-3 m-0 p-0 d-flex justify-content-center align-items-center">
                <Link href="https://prempackaging.com">
                  <div className="row ml-3 d-flex flex-column justify-content-center align-items-center">
                    <img
                      src="/pp_logo_1.png"
                      style={{ width: "110px", padding: "0px" }}
                    />
                  </div>
                </Link>

                <div
                  className="col-8 pl-5 d-flex justify-content-center align-items-center"
                  style={{ position: "relative" }}
                >
                  <input
                    className="w-100 px-2 bg-transparent border-1"
                    style={{
                      fontSize: "14px",
                      borderRadius: "4px",
                      paddingBlock: "8px",
                    }}
                    type="text"
                    placeholder="Search for Products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {searchProducts.length > 0 &&
                searchQuery.length >= 2 &&
                showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="dropdown-content"
                    style={{
                      position: "absolute",
                      backgroundColor: "#ffffff",
                      border: "1px solid #ccc",
                      maxWidth: "280px",
                      zIndex: "1000",
                      marginTop: "67px",
                      marginLeft: "147px",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {searchProducts.map((product, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "8px",
                          textTransform: "capitalize",
                          // borderRadius: "40px",
                          borderBottom:
                            index !== searchProducts.length - 1
                              ? "1px solid #ccc"
                              : "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          router.push(`/${product?.slug}`);
                          // Close the dropdown when a product is clicked
                          setShowDropdown(false);
                        }}
                      >
                        {product?.brand === "6557dbbc301ec4f2f4266107"
                          ? "flipkart"
                          : product?.brand === "6557dbcc301ec4f2f426610b"
                          ? "myntra"
                          : product?.brand === "6557dbad301ec4f2f4266103"
                          ? "amazon"
                          : product?.brand === "6582c8580ab82549a084894f"
                          ? "ajio"
                          : product?.brand === "6557dbf9301ec4f2f426611e"
                          ? "rollabel"
                          : product?.brand === "6557dc10301ec4f2f4266122"
                          ? "pack-secure"
                          : product?.brand === "6582c8750ab82549a0848953"
                          ? "PackPro"
                          : product?.brand}{" "}
                        {product.name} {product.model}
                      </div>
                    ))}
                  </div>
                )}

              <div className="col-7 m-0 p-0 d-flex align-items-center justify-content-center">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "30px",
                    fontSize: "18px",
                    fontFamily: "Montserrat",
                    fontWeight: "400",
                    lineHeight: "24px",
                  }}
                >
                  <Link
                    href="/corrugated-boxes"
                    onClick={handleClick}
                    style={{
                      textDecoration: "none solid rgb(51,51,51)",
                      color: "#333333",
                      fontWeight: "600",
                      fontSize: "14px",
                      lineHeight: "21px",
                    }}
                  >
                    <span>CORRUGATED BOXES</span>
                  </Link>

                  <Link
                    href="/paper-bags"
                    onClick={handleClickPaperBag}
                    style={{
                      textDecoration: "none solid rgb(51,51,51)",
                      color: "#333333",
                      fontWeight: "600",
                      fontSize: "14px",
                      lineHeight: "21px",
                    }}
                  >
                    <span>PAPER BAGS</span>
                  </Link>

                  <Link
                    href="/poly-bags"
                    onClick={handleClickPolyBag}
                    style={{
                      textDecoration: "none solid rgb(51,51,51)",
                      color: "#333333",
                      fontWeight: "600",
                      fontSize: "14px",
                      lineHeight: "21px",
                    }}
                  >
                    <span>POLY BAGS</span>
                  </Link>

                  <div
                    ref={dropdownRefSustainability}
                    style={{ position: "relative" }}
                  >
                    <div
                      onClick={toggleDropdownSustainability}
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "21px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>SUSTAINABLE PRODUCTS</span>
                      <ArrowDropDownIcon sx={{ color: "#333333" }} />
                    </div>

                    {isDropdownSustainabilityOpen && (
                      <div
                        style={{
                          position: "absolute",
                          backgroundColor: "white",
                          top: "25px",
                          left: "0",
                          border: "1px solid #ccc",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                          width: "200px",
                          zIndex: 9999,
                        }}
                      >
                        <Link
                          href="/carry-bags"
                          style={{
                            display: "block",
                            padding: "10px",
                            color: "#333",
                            textDecoration: "none",
                            fontWeight: "500",
                            borderBottom: "1px solid #ccc",
                            fontSize: "14px",
                          }}
                          onClick={() => setDropdownSustainabilityOpen(false)}
                        >
                          CARRY BAGS
                        </Link>
                      </div>
                    )}
                  </div>

                  <div
                    ref={dropdownRef}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "21px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        onClick={toggleDropdownTape}
                        // onClick={handleClickBrand}
                        style={{
                          textDecoration: "none solid rgb(51,51,51)",
                          color: "#333333",
                          fontWeight: "600",
                          fontSize: "14px",
                          lineHeight: "21px",
                        }}
                      >
                        OUR BRANDS
                      </span>
                    </div>
                    <div
                      onClick={toggleDropdownTape}
                      style={{
                        textDecoration: "none solid rgb(51,51,51)",
                        color: "#333333",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "21px",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <ArrowDropDownIcon sx={{ color: "#333333" }} />
                    </div>
                    {isDropdownTapeOpen && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          position: "absolute",
                          backgroundColor: "white",
                          top: "20px",
                          left: "45px",
                          border: "1px solid #ccc",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                          // gap: "10px",
                          width: "200px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link href="/packpro" onClick={handleCloseDropdown}>
                            <span
                              style={{
                                textDecoration: "none",
                                color: "#333",
                                fontWeight: 500,
                                fontSize: "14px",
                                marginRight: "10px",
                              }}
                            >
                              PACKPRO™
                            </span>
                          </Link>
                          <div
                            onClick={toggleDropdownBrand}
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "600",
                              fontSize: "14px",
                              lineHeight: "21px",
                              cursor: "pointer",
                            }}
                          >
                            <ArrowDropDownIcon sx={{ color: "#333333" }} />
                          </div>
                          {isDropdownBrandOpen && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                position: "absolute",
                                backgroundColor: "white",
                                top: "45px",
                                left: "45px",
                                border: "1px solid #ccc",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                // gap: "10px",
                                width: "200px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/bopp-tapes"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickBOPPTape();
                                  }}
                                >
                                  BOPP TAPES
                                </Link>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/paper-tapes"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickPaperTape();
                                  }}
                                >
                                  PAPER TAPES
                                </Link>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/void-tapes"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickCarryHandleTape();
                                  }}
                                >
                                  VOID TAPES
                                </Link>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/packpro-carry-handle-tapes"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickCarryHandleTape();
                                  }}
                                >
                                  CARRY HANDLE TAPES
                                </Link>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/packpro-food-wrapping-papers"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                    textAlign: "center",
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickFoodWrappingPaper();
                                  }}
                                >
                                  FOOD WRAPPING PAPERS
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #ccc",
                            paddingBlock: "10px",
                          }}
                        >
                          <Link
                            href="/rollabel"
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "21px",
                              marginRight: "10px", // add some space between text and dropdown icon
                            }}
                            onClick={() => {
                              handleCloseDropdown();
                              handleClickBOPPTape();
                            }}
                          >
                            ROLLABEL™
                          </Link>
                          <div
                            onClick={toggleDropdownBrand2}
                            style={{
                              textDecoration: "none solid rgb(51,51,51)",
                              color: "#333333",
                              fontWeight: "600",
                              fontSize: "14px",
                              lineHeight: "21px",
                              cursor: "pointer",
                            }}
                          >
                            <ArrowDropDownIcon sx={{ color: "#333333" }} />
                          </div>
                          {isDropdownBrand2Open && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                position: "absolute",
                                backgroundColor: "white",
                                top: "90px",
                                left: "45px",
                                border: "1px solid #ccc",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                // gap: "10px",
                                width: "200px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/direct-thermal-labels"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickDTL();
                                  }}
                                >
                                  DIRECT THERMAL LABELS
                                </Link>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderBottom: "1px solid #ccc",
                                  paddingBlock: "10px",
                                }}
                              >
                                <Link
                                  href="/chromo-labels"
                                  style={{
                                    textDecoration: "none solid rgb(51,51,51)",
                                    color: "#333333",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    marginRight: "10px", // add some space between text and dropdown icon
                                  }}
                                  onClick={() => {
                                    handleCloseDropdown();
                                    handleClickCL();
                                  }}
                                >
                                  CHROMO LABELS
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-2 p-0 mx-0">
                <div className="row h-100 m-0">
                  <div
                    className="col-9 p-0 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "#182C5A" }}
                  >
                    <Link
                      href={`tel:${phoneNumber}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      <span className="w-100 h-100 d-flex flex-column justify-content-center pt-3  bg-transparent">
                        <p
                          className="m-0 text-center"
                          style={{
                            color: "white",
                            fontSize: "14px",
                            fontFamily: "Montserrat",
                          }}
                        >
                          Talk to an expert
                        </p>
                        <p className={styles.whatsappNo}>{phoneNumber}</p>
                      </span>
                    </Link>
                  </div>
                  <div
                    className="col-3 d-flex justify-content-left align-items-center"
                    style={{ backgroundColor: "#E92227" }}
                  >
                    <Link
                      href="https://wa.me/8447247227?text=Hi"
                      target="_blank"
                    >
                      <WhatsAppIcon
                        fontSize="large"
                        sx={{ color: "#FFFFFF" }}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row p-0 m-0" style={{ height: "150px" }}>
            <div className="row h-50 p-0 m-0">
              <div className="col-4 m-0 p-0 d-flex justify-content-evenly align-items-center">
                <FontAwesomeIcon
                  icon={faNavicon}
                  style={{ color: "#182C5A", height: "25px", width: "25px" }}
                  onClick={changetranslate}
                />
                <Link href="/">
                  <HomeOutlinedIcon sx={{ fontSize: 33, color: "#182C5A" }} />
                </Link>
              </div>

              <div className="col-4 m-0 p-0 d-flex justify-content-center align-items-center">
                <Link
                  href="https://prempackaging.com"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <img src="pp_logo_1.png" width="90px" />
                </Link>
              </div>

              <div className="col-4 p-0 d-flex justify-content-evenly align-items-center m-0">
                <img src="outlineduser.png" width="31px" height="31px" />
                <Link
                  href="/my-cart"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <img
                    src="cartnumbered.png"
                    className=""
                    width="31px"
                    height="31px"
                  />
                </Link>
              </div>
            </div>
            <div className="row h-50 p-0 m-0">
              <div className="col m-0 p-0 d-flex justify-content-evenly align-items-center">
                <div
                  className="row w-100 mx-4"
                  style={{ height: "48px", backgroundColor: "#F5F5F5" }}
                >
                  <div className="col-1 d-flex justify-content-start align-items-center">
                    <img
                      src="Search.png"
                      style={{ height: "18px", width: "18px", padding: "0px" }}
                    />
                  </div>
                  <div
                    className="col-11 p-0 d-flex justify-content-center align-items-center"
                    style={{ position: "relative" }}
                  >
                    <input
                      className="w-100 px-2 bg-transparent border-0"
                      style={{ fontSize: "14px" }}
                      type="text"
                      placeholder="Search for Products"
                      value={searchQueryMobile}
                      onChange={(e) => {
                        setSearchQueryMobile(e.target.value);
                        if (e.target.value) {
                          handleSearchMobile(); // Call search function on two or more characters entry
                        } else {
                          setSearchProductsMobile([]); // Clear dropdown if less than two characters entered
                        }
                      }}
                    />
                  </div>

                  {searchProductsMobile.length > 0 &&
                    searchQueryMobile.length >= 2 &&
                    showDropdownMobile && (
                      <div
                        ref={dropdownRef}
                        className="dropdown-content"
                        style={{
                          position: "absolute",
                          backgroundColor: "#ffffff",
                          border: "1px solid #ccc",
                          maxWidth: "400px",
                          zIndex: "1000",
                          marginTop: "50px",
                          marginLeft: "0px",
                          maxHeight: "150px",
                          overflowY: "auto",
                        }}
                      >
                        {searchProductsMobile.map((product, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "8px",
                              textTransform: "capitalize",
                              // borderRadius: "40px",
                              borderBottom:
                                index !== searchProductsMobile.length - 1
                                  ? "1px solid #ccc"
                                  : "none",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              router.push(`/${product?.slug}`);
                              // Close the dropdown when a product is clicked
                              setShowDropdownMobile(false);
                            }}
                          >
                            {product?.brand === "6557dbbc301ec4f2f4266107"
                              ? "flipkart"
                              : product?.brand === "6557dbcc301ec4f2f426610b"
                              ? "myntra"
                              : product?.brand === "6557dbad301ec4f2f4266103"
                              ? "amazon"
                              : product?.brand === "6582c8580ab82549a084894f"
                              ? "ajio"
                              : product?.brand === "6557dbf9301ec4f2f426611e"
                              ? "rollabel"
                              : product?.brand === "6557dc10301ec4f2f4266122"
                              ? "pack-secure"
                              : product?.brand === "6582c8750ab82549a0848953"
                              ? "PackPro"
                              : product?.brand}{" "}
                            {product.name} {product.model}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
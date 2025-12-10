import styles from "../styles/page.module.css";
import { getService } from "../services/service";
import { useEffect, useRef, useState } from "react";
import LandingBrandCard from "../components/landing/landingBrandCard";
import DealsCard from "../components/landing/DealsCard";
import TopCard from "../components/landing/TopCard";
import TopCardMobile from "../components/landing/TopCardMobile";
import DealsCardMobile from "../components/landing/DealsCardMobile";
import Slider from "react-slick";
import Feedback from "../components/landing/feedback";
import { useRouter } from "next/router";
import Banner from "../components/landing/Banner";
import Brand from "../components/landing/Brand";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Loader from "../components/loader";
import CustomPackaging from "./CustomPackaging";
import { notification } from "antd";

export async function getServerSideProps(context) {
  const searchRes = await getService(`brand/all`);
  const prod = await getService("product/all");
  const deal = await getService("deal/all");
  return {
    props: {
      brand: searchRes?.data ? searchRes?.data?.data : [],
      product: prod?.data ? prod?.data?.data : [],
      deal: deal?.data ? deal?.data?.data : [],
    },
  };
}

export default function Home({ brand, product, deal }) {
  const router = useRouter();
  const [amazon, setAmazon] = useState([]);
  const [flipkart, setFlipkart] = useState([]);
  const [myntra, setMyntra] = useState([]);
  const [ajio, setAjio] = useState([]);
  const [deals, setDeals] = useState([]);
  const [top, setTop] = useState([]);
  const [type, setType] = useState();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sliderRef = useRef();
  const sliderRef1 = useRef();
  const sliderRef4 = useRef();

  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 1150,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          padding: 26,
        },
      },
    ],
  };

useEffect(() => {
  const timer = setTimeout(() => {
    notification.warning({
      message: "We’re currently improving your experience. Some features may be unavailable for a short time.",
      placement: "topRight",
      duration: 4,
    });
  }, 300); // small delay so hydration completes

  return () => clearTimeout(timer);
}, []);



  useEffect(() => {
    //console.log(product);
    if (product) {
      const filtered = product?.filter(
        (item) => item?.category?.name === "e-com"
      );
      const amazon = filtered?.filter((item) => item?.brand?.name === "Amazon");
      const flipkart = filtered?.filter(
        (item) => item?.brand?.name === "Flipkart"
      );
      const myntra = filtered?.filter((item) => item?.brand?.name === "Myntra");
      const ajio = filtered?.filter((item) => item?.brand?.name === "Ajio");
      const top = product?.filter((product) => product?.top_product === true);
      //console.log(top , "line 108")
      const deals = product?.filter(
        (product) => product?.deal_product === true
      );
      setAmazon(amazon);
      setFlipkart(flipkart);
      setMyntra(myntra);
      setAjio(ajio);
      setDeals(deals);
      setTop(top);
    }
    //console.log(top);
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setType("mobile");
      } else {
        setType("desktop");
      }
    }
  }, [product]);

  const handleClickAmazon = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/amazon");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickFlipkart = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/flipkart");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickMyntra = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/myntra");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickAjio = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/ajio");
      setIsLoading(false);
    }, 3500);
  };

  const handleClickCustom = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/custom-packaging");
      setIsLoading(false);
    }, 3500);
  };

  return (
    <>
      <Head>
        <title>Buy Packaging Product Online India | store.prempackaging</title>
        <meta name="title" content="Buy Packaging Product Online India" />
        <meta
          name="description"
          content="Buy packaging product online in India from our custom packaging store online. Visit our online ecommerce packaging store and Shop packaging product online."
        />

        <meta
          name="google-site-verification"
          content="google6b57cc2c5c60b7ce"
        />

        {/* <!-- Google tag (gtag.js) -->  */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-B5QF0YVXG5"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-B5QF0YVXG5');
    `,
          }}
        ></script>
        <style>{`
          iframe {
            width: 100%;
            height: 100%;
          }

          @media (min-width: 900px) {
            iframe {
              width: 700px;
              height: 450px;
            }
          }

          @media (min-width: 1200px) {
            iframe {
              width: 900px;
              height: 506px;
            }
          }

          .video-container {
            position: relative;
            padding-bottom: 50%;
            height: 0;
            overflow: hidden;
            max-width: 80%;
            background: white;
          }

          .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 80%;
            height: 80%;
            display: flex;
            justify-content: center;
            align-self: center;
          }
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                url: "https://www.store.prempackaging.com/",
                name: "Prem Packaging Store",
                description:
                  "Prem Packaging Store — Shop premium packaging products including boxes, tapes, bags, and labels online.",
                potentialAction: {
                  "@type": "SearchAction",
                  target:
                    "https://www.store.prempackaging.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Prem Packaging Store",
                url: "https://www.store.prempackaging.com/",
                logo: "https://www.store.prempackaging.com/Logohead.png",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+91-84472-47227",
                  contactType: "Customer Service",
                },
                sameAs: [
                  "https://www.facebook.com/PremIndustriesIndiaLimited/",
                  "https://www.instagram.com/prem_packaging/",
                  "https://www.linkedin.com/company/prem-packaging",
                ],
              },
            ]),
          }}
        />
      </Head>
      <div
        className="row m-0"
        style={{
          height: "fit-content",
          backgroundColor: "white",
          paddingTop: `${type === "mobile" ? "210px" : "120px"}`,
        }}
      >
        {/* Main body */}
        {isLoading && <Loader />}
        <div className="row p-0 m-0">
          <Banner />
          <div className={styles.mainbody}>
            {/* E-COMMERCE BRANDS */}
            <div className="row p-0">
              <div className="col my-4 p-0 text-center">
                <h1
                  className={styles.headerbrands}
                  style={{
                    fontSize: "40px",
                    color: "#182C5A",
                    textTransform: "uppercase",
                  }}
                >
                  we are authorised vendor for
                </h1>
                <div
                  style={{
                    marginTop: "16px",
                    height: "3px",
                    width: "234px",
                  }}
                ></div>
                <div>
                  <div>
                    <div className="container-fluid">
                      <div className="row mt-5 d-flex justify-content-right align-item-right">
                        <div className="col-md-1"></div>
                        <div className="col-md-3 pt-3">
                          <Link href="/amazon" onClick={handleClickAmazon}>
                            <Image
                              src="/amazon.jpg"
                              width={200}
                              height={110}
                            ></Image>
                          </Link>
                        </div>
                        <div className="col-md-4 pt-3">
                          <Link href="/flipkart" onClick={handleClickFlipkart}>
                            <Image
                              src="/flipkart.jpg"
                              width={200}
                              height={110}
                            ></Image>
                          </Link>
                        </div>
                        {/* <div className="col-md-3 pt-3">
                          <Link href="/myntra" onClick={handleClickMyntra}>
                            <Image
                              src="/myntra.png"
                              width={200}
                              height={110}
                            ></Image>
                          </Link>
                        </div> */}
                        <div className="col-md-3 pt-3">
                          <Link href="/ajio" onClick={handleClickAjio}>
                            <Image
                              src="/Ajio.png"
                              width={200}
                              height={110}
                            ></Image>
                          </Link>
                        </div>
                        <div className="col-md-1"></div>
                        <div className="d-flex justify-content-center align-item-center mt-5">
                          <Link
                            href="/custom-packaging"
                            onClick={handleClickCustom}
                            style={{
                              textDecoration: "none",
                              textAlign: "center",
                            }}
                          >
                            <button className={styles.packagebtn}>
                              Custom Packaging
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    {/* <Link href="/amazon" onClick={handleClickAmazon}>
                      <Image
                        src="/amazon_new.png"
                        width={150}
                        height={62}
                        style={{ marginTop: "16px" }}
                      ></Image>
                    </Link>

                    <Link href="/flipkart" onClick={handleClickFlipkart}>
                      <Image
                        src="/flipkart_new.png"
                        width={150}
                        height={162}
                      ></Image>
                    </Link>

                    <Link href="/myntra" onClick={handleClickMyntra}>
                      <Image
                        src="/myntra_new.png"
                        width={150}
                        height={90}
                      ></Image>
                    </Link>

                    <Link href="/ajio" onClick={handleClickAjio}>
                      <Image src="/ajio.jpeg" width={150} height={60}></Image>
                    </Link> */}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="container-fluid mt-4">
              <a
                href="https://visit.gulfoodmanufacturing.com/?utm_source=Exbmkt&utm_medium=Prem"
                target="_blank"
              >
                <img
                  src="/bannerimg2.jpg"
                  className="img-fluid"
                  alt="GULFOOD EXHIBITION"
                />
              </a>
            </div> */}
            {/* shop from top products */}
            <div className="container">
              <div className="row" style={{ marginTop: "50px" }}>
                <div className="col">
                  <div className="">
                    <div className="text-center">
                      <h2 className={styles.headerbrandsfirst}>
                        SHOP FROM TOP PRODUCTS
                      </h2>
                    </div>
                    {/* <div
                    className="d-flex flex-row align-items-center justify-content-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push("/listingpage")}
                  >
                    <p className="m-0">View All</p>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      style={{
                        color: "red",
                        width: "15px",
                        height: "15px",
                        paddingLeft: "4px",
                      }}
                    />
                  </div> */}
                  </div>
                  <div
                    className="d-flex align-items-right justify-content-right"
                    style={{
                      height: "3px",
                      width: "378px",
                    }}
                  ></div>
                  {type === "desktop" && top?.length > 5 && (
                    <>
                      <br />
                      <div
                        className={styles.arrowPrev}
                        style={{}}
                        onClick={() => sliderRef1.current.slickPrev()}
                      >
                        <img
                          src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_ssrdw2.svg"
                          className={styles.imageee}
                        ></img>
                      </div>
                      <div
                        className={styles.arrowNext}
                        onClick={() => sliderRef1.current.slickNext()}
                      >
                        <img
                          src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_1_irtfa7.svg"
                          className={styles.imageee}
                        ></img>
                      </div>
                    </>
                  )}

                  <div
                    className="mt-5 mb-2 ml-2 d-flex flex-row justify-content-start"
                    style={{ columnGap: "35px" }}
                  >
                    {top?.length <= 5 &&
                      type === "desktop" &&
                      top?.map((item, index) => {
                        return (
                          <div key={index}>
                            <TopCard item={item} />
                          </div>
                        );
                      })}
                  </div>

                  {type === "desktop" && top?.length > 5 && (
                    <Slider
                      {...settings}
                      ref={sliderRef1}
                      style={{ marginLeft: "20px" }}
                    >
                      {top?.map((item, index) => {
                        return (
                          <div style={{ marginLeft: "20px" }} key={index}>
                            <TopCard item={item} />
                          </div>
                        );
                      })}
                    </Slider>
                  )}

                  {type === "mobile" && top?.length > 5 && (
                    <>
                      <div
                        className={styles.arrowPrev1}
                        style={{ marginLeft: "1px" }}
                        onClick={() => sliderRef1.current.slickPrev()}
                      >
                        <img
                          src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_ssrdw2.svg"
                          className={styles.imageee}
                        ></img>
                      </div>
                      <div
                        className={styles.arrowNext1}
                        onClick={() => sliderRef1.current.slickNext()}
                      >
                        <img
                          src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_1_irtfa7.svg"
                          className={styles.imageee}
                        ></img>
                      </div>
                    </>
                  )}

                  <div>
                    {type === "mobile" && (
                      <Slider {...settings} ref={sliderRef1}>
                        {top?.map((item, index) => {
                          return (
                            <div key={index}>
                              <TopCardMobile item={item} />
                            </div>
                          );
                        })}
                      </Slider>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* BEST DEALS ON FEATURED PRODUCTS */}
            <div className="row" style={{ marginTop: "76px" }}>
              <div className="col">
                <div className="text-center">
                  <p className={styles.headerbrandsfirst}>
                    BEST DEALS ON FEATURED PRODUCTS
                  </p>
                  {/* <div
                    className="d-flex flex-row align-items-center justify-content-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push("/listingpage")}
                  >
                    <p className="m-0">View All</p>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      style={{
                        color: "red",
                        width: "15px",
                        height: "15px",
                        paddingLeft: "4px",
                      }}
                    />
                  </div> */}
                </div>
                <div
                  style={{
                    height: "3px",
                    width: "378px",
                  }}
                  className=" d-flex justify-content-right align-item-right"
                ></div>
                {type === "desktop" && deals?.length > 5 && (
                  <>
                    <div
                      className={styles.arrowPrev}
                      style={{}}
                      onClick={() => sliderRef4.current.slickPrev()}
                    >
                      <img
                        src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_ssrdw2.svg"
                        className={styles.imageee}
                      ></img>
                    </div>
                    <div
                      className={styles.arrowNext}
                      onClick={() => sliderRef4.current.slickNext()}
                    >
                      <img
                        src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_1_irtfa7.svg"
                        className={styles.imageee}
                      ></img>
                    </div>
                  </>
                )}

                <div
                  className="mt-5 mb-2 ml-2 d-flex flex-row justify-content-end"
                  style={{ columnGap: "35px" }}
                >
                  {deals?.length <= 5 &&
                    type === "desktop" &&
                    deals?.map((item, index) => {
                      return (
                        <div key={index}>
                          <DealsCard item={item} />
                        </div>
                      );
                    })}
                </div>

                {type === "desktop" && deals?.length > 5 && (
                  <Slider
                    {...settings}
                    ref={sliderRef4}
                    style={{ marginLeft: "20px" }}
                  >
                    {deals?.map((item, index) => {
                      return (
                        <div style={{ marginLeft: "20px" }} key={index}>
                          <DealsCard item={item} />
                        </div>
                      );
                    })}
                  </Slider>
                )}

                {type === "mobile" && deals?.length > 5 && (
                  <>
                    <div
                      className={styles.arrowPrev1}
                      style={{}}
                      onClick={() => sliderRef4.current.slickPrev()}
                    >
                      <img
                        src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_ssrdw2.svg"
                        className={styles.imageee}
                      ></img>
                    </div>
                    <div
                      className={styles.arrowNext1}
                      onClick={() => sliderRef4.current.slickNext()}
                    >
                      <img
                        src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_1_irtfa7.svg"
                        className={styles.imageee}
                      ></img>
                    </div>
                  </>
                )}

                <div>
                  {type === "mobile" && (
                    <Slider {...settings} ref={sliderRef4}>
                      {deals?.map((item, index) => {
                        return (
                          <div key={index}>
                            <DealsCardMobile item={item} />
                          </div>
                        );
                      })}
                    </Slider>
                  )}
                </div>
              </div>
            </div>
            {/* E-COMMERCE PACKAGING */}
            <div className="container">
              <CustomPackaging />
            </div>
            {/* E-com video */}
            <section className=" mb-3">
              <div className="container mt-5">
                <div className="row">
                  <div className="col-md-12">
                    <h1
                      className="text-center"
                      style={{
                        fontSize: "40px",
                        color: "#182c5a",
                        fontWeight: "700",
                      }}
                    >
                      E-COMMERCE VIDEO
                    </h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-1"></div>
                  <div className="col-md-10 text-center mt-5">
                    <iframe src="https://www.youtube.com/embed/7hIsUYzLc7U"></iframe>
                  </div>
                </div>
              </div>
            </section>
            {/* TESTIMONIALS */}
            <div className="row" style={{ marginTop: "72px" }}>
              <div className="col">
                <p className={styles.headerbrandssecond}>TESTIMONIALS</p>
                <div
                  style={{
                    width: "234px",
                  }}
                ></div>
              </div>
            </div>
            <Feedback />
          </div>
        </div>
      </div>
    </>
  );
}

import React from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";
import { useEffect, useRef } from "react";
import { postService, getService } from "../../services/service";
import RelatedCard from "./RelatedCard";
import Slider from "react-slick";
import { useRouter } from "next/router";

function RelatedSection({ product }) {
  const [products, setProducts] = useState([]);
  const [type, setType] = useState("desktop");
  const router = useRouter();
  const sliderRef1 = useRef();

  const getData = async () => {
    // const data = {
    //   category: [product?.category],
    //   brand: product?.brand?._id,
    // };
    // const res = await postService("/product/filter", data);
    // if (res?.data?.success) {
    //   setProducts(res?.data?.data?.slice(0, 5));
    // }
    const productIds = product?.relatedProducts?.map((item) => item._id);
    // console.log(productIds);

    if (productIds?.length > 0) {
      // console.log("check 1");
      const products = [];

      for (const productId of productIds) {
        // console.log("check 1", productId);
        const res = await getService(`product/image/single/${productId}`);
        if (res?.data?.message === "Product found") {
          const temp = res?.data?.data;
          // console.log(temp);
          products.push(temp);
        } else {
          // console.log("Error is res", res);
        }
      }

      setProducts(products);
    }
  };

  useEffect(() => {
    getData();
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setType("mobile");
      } else {
        setType("desktop");
      }
    }
  }, [product]);

  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
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
          dots: true,
          padding: 26,
          arrows: false,
        },
      },
    ],
  };

  // console.log(products);
  return (
    <div className="row mt-5 m-0">
      <div className="col mb-4">
        <div className="d-flex flex-row align-items-center justify-content-between">
          <p
            style={{
              color: "#3A5BA2",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: "700",
              lineHeight: "30px",
              textTransform: "uppercase",
            }}
          >
            RELATED PRODUCTS
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
            backgroundColor: "#3A5BA2",
            height: "3px",
            width: "265px",
          }}
        ></div>
        <div
          className="row m-0 mb-3"
          style={{ height: "1px", backgroundColor: "#EDEDED" }}
        ></div>

        {/* FOR MEDIUM TO LARGE SCREEN START ONLY */}

        {products.length > 5 ? (
          <>
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

            <Slider {...settings} ref={sliderRef1}>
              {products.map((x, i) => (
                <div
                  className="d-flex flex-column justify-content-start align-items-center mx-md-0"
                  style={{
                    width: "227px",
                    height: "300px",
                    border: "5px solid #EDEDED",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                  key={i}
                  onClick={() => router.push(`/${x?.slug}`)}
                >
                  <RelatedCard product={x} />
                </div>
              ))}
              {products.length === 0 && <div>No products found</div>}
            </Slider>
          </>
        ) : (
          <div
            className="mt-5"
            style={{
              marginBottom: "140px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(227px, 1fr))",
              gap: "20px",
            }}
          >
            {products.map((x, i) => (
              <div
                className="d-flex flex-column justify-content-start align-items-center mx-md-0 mx-5 mt-3"
                style={{
                  width: "227px",
                  height: "300px",
                  border: "1px solid #EDEDED",
                  cursor: "pointer",
                }}
                key={i}
                onClick={() => router.push(`/${x?.slug}`)}
              >
                <RelatedCard product={x} />
              </div>
            ))}
          </div>
        )}

        {/* FOR MEDIUM TO LARGE SCREEN END ONLY */}
        {/* FOR SMALL SCREEN START ONLY */}

        {/* {type === "mobile" && (
          <Slider {...settings}>
            {products?.map((x, i) => {
              return (
                <div
                  className="d-flex flex-column justify-content-start align-items-center mx-md-0"
                  style={{
                    width: "227px",
                    height: "300px",
                    border: "2px solid #E92227",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                  key={i}
                  onClick={() => router.push(`/${x?.slug}`)}
                >
                  <RelatedCard product={x} />
                </div>
              );
            })}
          </Slider>
        )} */}

        {/* FOR SMALL SCREEN END ONLY */}
      </div>
    </div>
  );
}

export default RelatedSection;

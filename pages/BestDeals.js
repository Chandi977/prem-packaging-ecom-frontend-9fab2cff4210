import styles from "../styles/page.module.css";
import { useEffect, useRef, useState } from "react";
import { getService } from "../services/service";
import Slider from "react-slick";
import DealsCard from "../components/landing/DealsCard";
import DealsCardMobile from "../components/landing/DealsCardMobile";

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
export default function BestDeals({ brand, product, deal }) {
  const sliderRef = useRef();
  const sliderRef1 = useRef();
  const sliderRef4 = useRef();
  const [type, setType] = useState();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    console.log("useEffect", product);
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
      console.log("BEST DEALS PAGE: ", deals);
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
  return (
    <>
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
    </>
  );
}

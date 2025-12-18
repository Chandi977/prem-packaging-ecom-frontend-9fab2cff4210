import React from "react";
import styles from "./page.module.css";
import { useEffect } from "react";
import { postService, getService } from "../../services/service";
import { useState } from "react";
import { addToCart } from "../../utils/cart";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CabinSharp } from "@mui/icons-material";

function BuySection({ product }) {
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [total, setTotal] = useState(0);
  const [stock, setStock] = useState(0);

  const getData = async () => {
    const productIds = product?.buyItWith?.map((item) => item._id);
    // console.log(productIds);

    if (productIds?.length > 0) {
      // console.log("check 1");
      const products = [];
      const prices = [];
      const quantities = [];
      let costForItem = 0;
      let stock;

      for (const productId of productIds) {
        // console.log("check 1", productId);
        const res = await getService(`product/image/single/${productId}`);
        if (res?.data?.message === "Product found") {
          const temp = res?.data?.data;
          // console.log(temp);
          products.push(temp);

          if (temp?.priceList?.length > 0) {
            const t = temp?.priceList[0]?.SP;
            const num = temp?.priceList[0]?.number;
            const pun = t / num;
            const p = pun.toFixed(1);
            quantities.push(num);
            prices.push(p);
            stock = temp?.priceList[0]?.stock_quantity;
          } else {
            quantities.push(1);
            prices.push(temp?.price);
          }

          // const costForItem =
          //   prices[prices.length - 1] * quantities[quantities.length - 1];
          // console.log("Cost per Item:", products);
          // totalCost += costForItem;
        } else {
          // console.log("Error is res", res);
        }
      }

      // Cal() total cost of all present products
      products.forEach((product) => {
        costForItem += product.priceList?.[0]?.SP || 0;
      });
      setProducts(products); // Product Details
      setPrices(prices); // Price per pc
      setQuantities(quantities); // Pack Size
      setStock(stock); // No idea
      setTotal(costForItem); // Wrong total cost and wrong seperate product cost
    }
  };

  useEffect(() => {
    getData();
  }, [product]);

  const getText = () => {
    if (selectedIndexes?.length === 3 || selectedIndexes?.length === 0) {
      return "Add all three to Cart";
    } else {
      return `Add ${selectedIndexes?.length} ${
        selectedIndexes?.length === 1 ? "item" : "items"
      } to Cart`;
    }
  };

  const handleAddOrRemove = (id) => {
    const temp = selectedIndexes?.indexOf(id);
    if (temp === -1 || temp === undefined || temp === null) {
      const tempArray = [...selectedIndexes];
      tempArray.push(id);
      setSelectedIndexes(tempArray);
    } else {
      const tempArray = [...selectedIndexes];
      tempArray.splice(temp, 1);
      setSelectedIndexes(tempArray);
    }
  };

  const handleCart = async (e) => {
    e.stopPropagation();

    const hasZeroOrLessStock = products.some(
      (product, i) => product?.priceList?.[0]?.stock_quantity <= 0
    );
    //console.log(hasZeroOrLessStock)
    if (hasZeroOrLessStock) {
      toast.error("Sorry, one or more products are out of stock.");
      return;
    }
    if (products?.[0]) {
      const result = await addToCart(
        products?.[0],
        1,
        products[0]?.priceList?.[0]?.SP,
        products[0]?.priceList?.[0]?.pack_weight,
        products[0]?.priceList?.[0]?.number,
        products[0]?.priceList?.[0]?.number,
        products[0]?.brand._id,
        products[0]?.category,
        products[0]?.priceList?.[0]?.stock_quantity
      );
    }
    if (products?.[1]) {
      const result2 = await addToCart(
        products?.[1],
        1,
        products[1]?.priceList?.[0]?.SP,
        products[1]?.priceList?.[0]?.pack_weight,
        products[1]?.priceList?.[0]?.number,
        products[1]?.priceList?.[0]?.number,
        products[1]?.brand._id,
        products[1]?.category,
        products[1]?.priceList?.[0]?.stock_quantity
      );
    }
    if (products?.[2]) {
      const result3 = await addToCart(
        products?.[2],
        1,
        products[2]?.priceList?.[0]?.SP,
        products[2]?.priceList?.[0]?.pack_weight,
        products[2]?.priceList?.[0]?.number,
        products[2]?.priceList?.[0]?.number,
        products[2]?.brand._id,
        products[2]?.category,
        products[2]?.priceList?.[0]?.stock_quantity
      );
    }
    if (products?.[3]) {
      const result4 = await addToCart(
        products?.[3],
        1,
        products[3]?.priceList?.[0]?.SP,
        products[3]?.priceList?.[0]?.pack_weight,
        products[3]?.priceList?.[0]?.number,
        products[3]?.priceList?.[0]?.number,
        products[3]?.brand._id,
        products[3]?.category,
        products[3]?.priceList?.[0]?.stock_quantity
      );
    }
    if (products?.[4]) {
      const result5 = await addToCart(
        products?.[4],
        1,
        products[4]?.priceList?.[0]?.SP,
        products[4]?.priceList?.[0]?.pack_weight,
        products[4]?.priceList?.[0]?.number,
        products[4]?.priceList?.[0]?.number,
        products[4]?.brand._id,
        products[4]?.category,
        products[4]?.priceList?.[0]?.stock_quantity
      );
    }
  };

  // console.log(products);

  const router = useRouter();
  return (
    <div className={"row mt-5 m-0 "}>
      <div className="col">
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
          BUY IT WITH
        </p>
        <div
          style={{
            backgroundColor: "#3A5BA2",
            height: "3px",
            width: "265px",
          }}
        ></div>
        {/* <div
          className="row m-0 mb-3"
          style={{ height: "1px", backgroundColor: "#EDEDED" }}
        ></div> */}
        <div className="mt-3 mb-2 d-flex flex-wrap justify-content-center align-items-center">
          {products?.map((x, i) => {
            return (
              <>
                <div
                  className="d-flex flex-column justify-content-center align-items-center shadow-sm"
                  style={{
                    width: "287px",
                    height: "300px",
                    border: "1px solid #EDEDED",
                    marginBottom: "10px", // Add some space between rows
                  }}
                  onClick={() => router.push(`/${x?.slug}`)}
                >
                  <div
                    className="d-flex justify-content-center align-items-center bg-light"
                    style={{
                      position: "relative",
                      height: "170px",
                      width: "287px",
                    }}
                  >
                    <img src={x?.images?.[0]?.image} width="180px" />
                    <div
                      className="d-flex flex-column justify-content-center align-items-center bg-danger"
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "8%",
                        borderBottomLeftRadius: "9px",
                      }}
                    ></div>
                  </div>
                  <div
                    className="d-flex flex-column justify-content-evenly align-items-between"
                    style={{ height: "170px", width: "227px" }}
                  >
                    <div className="row p-0 m-0" style={{ height: "50px" }}>
                      <p
                        className="d-flex flex-row justify-content-center align-items-center"
                        style={{
                          fontSize: "16px",
                          fontWeight: 400,
                          lineHeight: "21px",
                          textTransform: "capitalize",
                        }}
                      >
                        {x?.brand?.name} {x?.name} {x?.model}
                      </p>
                    </div>
                    <div className="row mx-3"></div>
                    <div
                      className="px-3 mt-4 d-flex flex-row align-items-center justify-content-start"
                      style={{ height: "50px" }}
                    >
                      <p className={styles.pricesecondtext}>
                        <span
                          style={{
                            fontSize: "16px",
                            textDecoration: "line-through",
                          }}
                        >
                          ₹ {Math.round(x?.priceList?.[0]?.MRP)}
                        </span>{" "}
                        <span style={{ fontSize: "20px", fontWeight: "500" }}>
                          &nbsp;&nbsp;₹{Math.round(x?.priceList?.[0]?.SP)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {i !== products?.length - 1 && (
                  <p
                    className={`my-0 mx-2 p-0 ${styles.plussign}`} // Using CSS Module styles
                    style={{
                      height: "fit-content",
                      color: "var(--h-eading, #222)",
                      textAlign: "right",
                      fontSize: "33.6px",
                      fontStyle: "normal",
                      fontWeight: "500",
                      lineHeight: "37.8px",
                    }}
                  >
                    +
                  </p>
                )}
              </>
            );
          })}

          <div
            className="mx-5 d-flex flex-column align-items-center justify-content-center"
            style={{ width: "225px" }}
          >
            <div className="d-flex">
              <p
                style={{
                  color: "var(--h-eading, #222)",
                  fontSize: "22px",
                  fontStyle: "normal",
                  fontWeight: "400",
                  lineHeight: "21px",
                }}
              >
                Total price:&nbsp;
              </p>
              <p
                style={{
                  color: "var(--h-eading, #222)",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: "600",
                  lineHeight: "25px",
                }}
                className="text-success"
              >
                ₹{total}
              </p>
            </div>
            <button
              className={styles.addtocartbtn}
              style={{ height: "60px", width: "100%" }}
              onClick={handleCart}
            >
              {getText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuySection;

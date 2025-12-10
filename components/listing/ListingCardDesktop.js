import React from "react";
import styles from "./listingcarddesktop.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { addToFav, getFav, removeFromFav } from "../../utils/favourites";
import { useEffect } from "react";
import { addToCart } from "../../utils/cart";

function ListingCardDesktop({ item }) {
  const [favourite, setFavourite] = useState([]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [final, setFinal] = useState(0);
  const checkFav = (id) => {
    const temp = favourite?.map((x) => x?.product?._id).indexOf(id);
    if (temp === -1 || temp === undefined || temp === null) {
      return false;
    } else {
      return true;
    }
  };

  const getFavourite = async () => {
    const result = await getFav();
    if (result !== null) {
      setFavourite(result);
    }
  };


  useEffect(()=>{
     getFavourite()
     if(item)
     {
      //console.log(item);
      if(item?.priceList?.length>0)
      {
       
       const price=item?.priceList?.[0]?.SP;
       const number=item?.priceList?.[0]?.number;
       const priceForOne=price/number;
        setPrice(priceForOne);
        setQuantity(item?.priceList[0]?.number);
        const ff=priceForOne*item?.priceList[0]?.number;
         setFinal(ff.toFixed(0));
      }
      else{
         setPrice(item?.price)
         setQuantity(1)
      }
     }
  },[item])

  const handleFavourite = async (e, product) => {
    e.stopPropagation();
    const temp = favourite?.map((x) => x?.product?._id).indexOf(product?._id);
    if (temp === -1 || temp === undefined || temp === null) {
      const c = await addToFav(product);
      getFavourite();
    } else {
      const c = await removeFromFav(product?._id);
      getFavourite();
    }
  };

  const handleCart=async(e)=>{
    e.stopPropagation();
    const result=await addToCart(item,quantity,price, );
  }
  const router = useRouter();
  return (
    <>
      <div
        className="col-4 d-flex flex-column align-items-center justify-content-center"
        style={{ cursor: "pointer" }}
        onClick={handleViewProduct}
      >
        <div className="p-0 d-flex flex-column align-items-start justify-content-start">
          <img src={item?.images?.[0]?.image} width="180px"/>
        </div>
      </div>
      <div className="col-8 py-4 px-0 d-flex flex-column align-items-start justify-content-start">
        <div className="p-0 m-0 w-100 d-flex flex-row justify-content-between">
          <p style={{ fontSize: "17px" }}>
            {item?.name} {item?.model}
            <br />
            {/* Box NC19 */}
          </p>
          {checkFav(item?._id) ? (
            <FontAwesomeIcon
            icon={faHeart}
            style={{
              color: "red",
              width: "15px",
              height: "15px",
              paddingRight: "15px",
              cursor: "pointer",
            }}
            onClick={(e) => handleFavourite(e, item)}
          />
          ) : (
            <FontAwesomeIcon
            icon={faHeart}
            style={{
              color: "grey",
              width: "15px",
              height: "15px",
              paddingRight: "15px",
              cursor: "pointer",
            }}
            onClick={(e) => handleFavourite(e, item)}
          />
          )}
        </div>

        <p className={styles.pricetext}>₹{final}</p>
        <button className={styles.addtocartbtn} onClick={handleViewProduct}>View Product</button>
      </div>
    </>
  );
}

export default ListingCardDesktop;

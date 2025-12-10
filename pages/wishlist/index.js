import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getFav, removeFromFav } from "../../utils/favourites";
import { addToCart } from "../../utils/cart";
import styles from "../../styles/page.module.css";
import Head from "next/head";
import { useRouter } from "next/router";

const FavoritesPage = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [final, setFinal] = useState(0);
  const [item, setItem] = useState(null); // Define 'item' state
  const [price, setPrice] = useState(0); // Define 'price' state
  const [quantity, setQuantity] = useState(0); // Define 'quantity' state
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favProducts = await getFav();
        if (favProducts) {
          setFavoriteProducts(favProducts);
          //console.log(favProducts);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    if (favoriteProducts.length > 0) {
      // Assuming you want to select the first item from favoriteProducts
      const selectedProduct = favoriteProducts[0];

      if (selectedProduct && selectedProduct.product) {
        const item = selectedProduct.product;

        if (item?.priceList?.length > 0) {
          const price = item?.priceList?.[0]?.SP;
          const number = item?.priceList?.[0]?.number;
          const priceForOne = price / number;
          setPrice(priceForOne); // Define 'setPrice'
          setQuantity(item?.priceList[0]?.number); // Define 'setQuantity'
          const ff = priceForOne * item?.priceList[0]?.number;
          setFinal(ff.toFixed(0)); // Define 'setFinal'
        } else {
          setPrice(item?.price);
          setQuantity(1);
        }
      }
    }
    // getFavourite();
  }, [favoriteProducts]);

  const handleRemoveFavorite = async (product) => {
    try {
      const removed = await removeFromFav(product._id);
      if (removed) {
        setFavoriteProducts((prevProducts) =>
          prevProducts.filter(
            (favProduct) => favProduct.product._id !== product._id
          )
        );
        toast.success("Item removed from favorites.");
      } else {
        toast.error("Failed to remove item from favorites.");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const handleCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(item, quantity, price);

    // Check if the item was successfully added to the cart
    if (result) {
      handleRemoveFavorite(item);
    }
  };

  return (
    <>
      <Head>
        <title>My Wishlist | store.prempackaging</title>
        <meta name="title" content="My Wishlist" />
        <meta
          name="description"
          content="Save your favourite packaging products to your Wishlist for quick access. Easily compare, track, and purchase your preferred items anytime."
        />
      </Head>
      <div style={{ marginTop: "0px", backgroundColor: "white" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "200px",
            flexDirection: "column",
          }}
        >
          <h1 style={{ color: "#182C5A" }}>Your Wishlist</h1>
          <div
            style={{
              width: "18%",
              height: "3px",
              backgroundColor: "rgb(233, 34, 39)",
            }}
          ></div>
        </div>
        {favoriteProducts.length === 0 ? (
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "100px",
              paddingTop: "50px",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            No products have been wishlisted yet.
          </p>
        ) : (
          <div style={{ padding: "30px" }}>
            {favoriteProducts.map((favProduct) => (
              <div
                key={favProduct.product._id}
                style={{ paddingBlock: "20px" }}
              >
                {/* {favProduct.product.name} */}

                <div
                  className="row px-2 m-0 d-flex flex-row justify-content-between align-items-center"
                  style={{ border: "1px solid", gap: "10px" }}
                >
                  <div className="col-6 d-flex flex-row justify-content-start align-items-center">
                    <div className="col-4 py-4">
                      <img
                        src={favProduct.product.images?.[0]?.image}
                        width={164}
                        height={130}
                      />
                    </div>
                    <div className="col-8">
                      <p
                        style={{
                          fontSize: "17px",
                          textTransform: "capitalize",
                        }}
                      >
                        {favProduct.product.brand.name}{" "}
                        {favProduct.product.name} {favProduct.product.model}
                      </p>
                      <p className={styles.pricetextwl}>₹{final}</p>
                    </div>
                  </div>
                  <div
                    className="col-6 d-flex flex-column justify-content-start align-items-center"
                    style={{ width: "fit-content" }}
                  >
                    <p style={{ width: "fit-content", fontSize: "16px" }}>
                      Item added on{" "}
                      {new Date(
                        favProduct.product.updatedAt
                      ).toLocaleDateString()}
                    </p>

                    <div className="d-flex flex-row justify-content-start align-items-center">
                      <button
                        className={styles.addtocartbtn}
                        onClick={() =>
                          router.push(`/product?id=${favProduct?.product?._id}`)
                        }
                        style={{
                          width: "180px",
                          height: "41px",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#182C5A",
                          border: "none",
                          color: "white",
                        }}
                      >
                        View Product
                      </button>
                      <button
                        className="m-0 mx-3"
                        style={{
                          width: "fit-content",
                          fontFeatureSettings: "'liga' off",
                          fontFamily: "Montserrat",
                          fontSize: "13px",
                          fontStyle: "normal",
                          fontWeight: "600",
                          lineHeight: "13.512px",
                          letterSpacing: "0.214px",
                          width: "180px",
                          height: "41px",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "rgb(233, 34, 39)",
                          color: "white",
                          border: "none",
                        }}
                        onClick={() => handleRemoveFavorite(favProduct.product)}
                      >
                        Remove from Favorites
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritesPage;

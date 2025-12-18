import { toast } from "react-toastify";

export const addToFav = async (product) => {
  const cart = localStorage.getItem("PIFav");
  if (cart) {
    const carts = JSON.parse(cart);
    const filteredProducts = carts?.filter(
      (x) => x?.product?._id === product?._id
    );
    if (filteredProducts?.length !== 0) {
      toast.info("item is already in favourites.");
      return true;
    } else {
      carts?.push({
        product: product,
      });
      localStorage.setItem("PIFav", JSON.stringify(carts));
      toast.success("Item added in favourites.");
      return true;
    }
  } else {
    const cartss = [];
    cartss.push({
      product: product,
    });
    localStorage.setItem("PIFav", JSON.stringify(cartss));
    toast.success("Item added in favourites.");
    return true;
  }
};

export const getFav = async () => {
  const cart = JSON.parse(localStorage.getItem("PIFav"));
  if (cart) {
    return cart;
  } else {
    return null;
  }
};

export const removeFromFav = async (product) => {
  const cart = JSON.parse(localStorage.getItem("PIFav"));
  if (cart) {
    const cart = JSON.parse(localStorage.getItem("PIFav"));
    const finalProducts = cart?.filter((x) => x?.product?._id !== product);
    localStorage.setItem("PIFav", JSON.stringify(finalProducts));
    return true;
  } else {
    return false;
  }
};

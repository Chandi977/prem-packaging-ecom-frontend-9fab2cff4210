import axios from "axios";
import { toast } from "react-toastify";
import { getService, postService } from "../services/service";

export const addToCart = async (
  product,
  quantity,
  price,
  selectedPackWeight,
  packSize,
  selectedNumber,
  brand,
  category, stock,
) => {
  //console.log("Selected Pack Size Inside addToCart:", packSize);
  const token = localStorage.getItem("PIToken");
  const totalPackWeight = quantity * selectedPackWeight; // Calculate totalPackWeight

  if (!token) {
    const cart = localStorage.getItem("PICart");

    if (cart) {
      const carts = JSON.parse(cart);
      const products = carts.products;

      const filteredProducts = products?.filter(
        (x) => x?.product?._id === product?._id
      );

      if (filteredProducts?.length !== 0) {
        toast.info("Item is already in the cart.");
        return true;
      } else {
        products?.push({
          product: product,
          quantity: Number(quantity),
          price: Number(price),
          selectedPackWeight: Number(selectedPackWeight),
          packSize: Number(selectedNumber),
          brand: brand,
          category: category,
        });

        carts.totalPackWeight = totalPackWeight; // Update totalPackWeight
        carts.products = products;
        carts.total_amount = products?.reduce((curr, acc) => {
          return curr + acc.price * acc.quantity;
        }, 0);
        carts.discount_amount = 0;
        localStorage.setItem("PICart", JSON.stringify(carts));
        toast.success("Item added to the cart.");
        return true;
      }
    } else {
      const cartss = {
        products: [
          {
            product: product,
            quantity: Number(quantity),
            price: Number(price),
            selectedPackWeight: Number(selectedPackWeight),
            packSize: Number(selectedNumber), // Include packSize
            brand: brand,
            category: category,
          },
        ],
        total_amount: price * quantity,
        discount_amount: 0,
        totalPackWeight: totalPackWeight, // Update totalPackWeight
      };

      localStorage.setItem("PICart", JSON.stringify(cartss));
      toast.success("Item added to the cart.");
      return true;
    }
  } else {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    localStorage.removeItem("PICart");

    const cartss = {
      product: {
        product: product?._id,
        quantity: Number(quantity),
        price: Number(price),
        totalPackWeight: Number(totalPackWeight),
        packSize: Number(selectedNumber), // Include packSize
        brand: brand,
        category: category,
        stock,
      },
      user: user?._id,
    };

    //console.log("93",cartss)

    // Include headers in the request
    const res = await postService("AddtoCart", cartss);

    if (res?.data?.success) {
      toast.success("Item added to the cart.");
    }
    return true;
  }
};

export const getCart = async () => {
  const token = localStorage.getItem("PIToken");
  if (token) {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    const res = await getService(`cart/${user?._id}`);
    return res?.data?.data;
  } else {
    const cart = JSON.parse(localStorage.getItem("PICart"));
    if (cart) {
      return cart;
    } else {
      return null;
    }
  }
};

export const getCartCount = async () => {
  const token = localStorage.getItem("PIToken");
  if (token) {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    const res = await getService(`cart/count/${user?._id}`);
    return res?.data?.data;
  } else {
    const cart = JSON.parse(localStorage.getItem("PICart"));
    if (cart) {
      return cart;
    } else {
      return null;
    }
  }
};

export const alterQuantity = async (product, quantity) => {
  const token = localStorage.getItem("PIToken");
  if (!token) {
    const cart = JSON.parse(localStorage.getItem("PICart"));
    const products = cart?.products;
    const index = products?.map((x) => x?.product?._id).indexOf(product);
    //console.log(products[index]);
    products[index]["quantity"] = quantity;
    const total_amount = products?.reduce((curr, acc) => {
      return curr + acc.price * acc.quantity;
    }, 0);
    const newCart = {
      ...cart,
      products: products,
      total_amount,
    };
    localStorage.setItem("PICart", JSON.stringify(newCart));
    return true;
  } else if (token) {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    const data = {
      user: user?._id,
      product,
      quantity,
    };
    const res = await postService("alterQunatity", data);
    if (res?.data?.success) {
      return true;
    }
  } else {
    return false;
  }
};

export const removeFromCart = async (product) => {
  //console.log("158", product);
  const token = localStorage.getItem("PIToken");
  if (!token) {
    //console.log("161", product);
    const cart = JSON.parse(localStorage.getItem("PICart"));
    const products = cart?.products;
    const finalProducts = products?.filter((x) => x?.product?._id !== product);
    const total_amount = finalProducts?.reduce((curr, acc) => {
      return curr + acc.price * acc.quantity;
    }, 0);
    const newCart = {
      ...cart,
      products: finalProducts,
      total_amount,
    };
    localStorage.setItem("PICart", JSON.stringify(newCart));
    return true;
  } else if (token) {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    //console.log("177", product);
    const data = {
      user: user?._id,
      product,
    };
    const res = await postService("/removefromcart", data);
    if (res?.status === 201) {
      return true;
    }
  } else {
    return false;
  }
};

export const emptyCart = async () => {
  const token = localStorage.getItem("PIToken");
  if (!token) {
    localStorage.removeItem("PICart");
  } else {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    const data = {
      id: user?._id,
    };
    await postService("emptyCart", data);
  }
};

export const updateCart = async (updates, couponCode, couponType, couponUse) => {
  const token = localStorage.getItem("PIToken");
  const user = JSON.parse(localStorage.getItem("PIUser"))?._id;

  const data = {
    user: user,
    appliedCoupon: true,
    appliedCouponName: couponCode,
    couponType: couponType,
    couponUse: couponUse,
    products: updates.map((update) => ({
      product: update.product,
      discountPrice: update.discountPrice,
    })),
  };

  try {
    //console.log("231", data)
    const res = await postService("updateCart", data);
    return res?.data?.success;
  } catch (error) {
    console.error("Error updating cart:", error);
    return false;
  }
};

export const updateShippingDiscount = async (
  shippingDiscountPrice,
  shippingDiscountPercentage,
  couponCode,
  couponType,
  maxCapDiscount,
  couponUse
) => {
  const token = localStorage.getItem("PIToken");
  const user = JSON.parse(localStorage.getItem("PIUser"))?._id;

  //console.log("248" , couponType);

  // console.log("Input Values - shippingDiscountPrice:", shippingDiscountPrice, "shippingDiscountPercentage:", shippingDiscountPercentage);

  const hasDiscountPrice =
    typeof shippingDiscountPrice === "number" && shippingDiscountPrice > 0;
  const hasDiscountPercentage =
    typeof shippingDiscountPercentage === "number" &&
    shippingDiscountPercentage > 0 &&
    shippingDiscountPercentage <= 100;

  // console.log("hasDiscountPrice:", hasDiscountPrice, "hasDiscountPercentage:", hasDiscountPercentage);

  if (hasDiscountPrice && hasDiscountPercentage) {
    // console.error("Cannot provide both shippingDiscountPrice and shippingDiscountPercentage. Please provide only one.");
    return false;
  }

  if (!hasDiscountPrice && !hasDiscountPercentage) {
    // console.error("Please provide either shippingDiscountPrice or shippingDiscountPercentage.");
    return false;
  }

  const discountData = {};
  if (hasDiscountPrice) {
    discountData.shippingDiscountPrice = shippingDiscountPrice;
  } else if (hasDiscountPercentage) {
    discountData.shippingDiscountPercentage = shippingDiscountPercentage;
  }

  const data = {
    user: user,
    appliedCouponName: couponCode,
    appliedCoupon: true,
    couponType: couponType,
    maxCapDiscount: maxCapDiscount,
    couponUse: couponUse,
    ...discountData,
  };

  // console.log("Request Data:", data);

  try {
    const res = await postService("updateShippingCoupon", data, token);
    return res?.data?.success;
  } catch (error) {
    console.error("Error updating shipping discount:", error);
    return false;
  }
};

export const updateAllDiscount = async (
  totalDiscountPrice,
  totalDiscountPercentage,
  couponCode,
  couponType,
  maxCapDiscount,
  couponUse
) => {
  const token = localStorage.getItem("PIToken");
  const user = JSON.parse(localStorage.getItem("PIUser"))?._id;

  // console.log("Input Values - shippingDiscountPrice:", shippingDiscountPrice, "shippingDiscountPercentage:", shippingDiscountPercentage);

  const hasDiscountPrice =
    typeof totalDiscountPrice === "number" && totalDiscountPrice > 0;
  const hasDiscountPercentage =
    typeof totalDiscountPercentage === "number" &&
    totalDiscountPercentage > 0 &&
    totalDiscountPercentage <= 100;

  // console.log("hasDiscountPrice:", hasDiscountPrice, "hasDiscountPercentage:", hasDiscountPercentage);

  if (hasDiscountPrice && hasDiscountPercentage) {
    // console.error("Cannot provide both shippingDiscountPrice and shippingDiscountPercentage. Please provide only one.");
    return false;
  }

  if (!hasDiscountPrice && !hasDiscountPercentage) {
    // console.error("Please provide either shippingDiscountPrice or shippingDiscountPercentage.");
    return false;
  }

  const discountData = {};
  if (hasDiscountPrice) {
    discountData.totalDiscountPrice = totalDiscountPrice;
  } else if (hasDiscountPercentage) {
    discountData.totalDiscountPercentage = totalDiscountPercentage;
  }

  const data = {
    user: user,
    appliedCouponName: couponCode,
    appliedCoupon: true,
    couponType: couponType,
    maxCapDiscount: maxCapDiscount,
    couponUse: couponUse,
    ...discountData,
  };

  // console.log("Request Data:", data);

  try {
    const res = await postService("updateAllDiscount", data, token);
    return res?.data?.success;
  } catch (error) {
    console.error("Error updating shipping discount:", error);
    return false;
  }
};

export const updateProductTypeAllDiscount = async (
  totalDiscountPrice,
  couponCode,
  couponType,
  couponUse,
) => {
  const token = localStorage.getItem("PIToken");
  const user = JSON.parse(localStorage.getItem("PIUser"))?._id;

  // console.log("Input Values - shippingDiscountPrice:", shippingDiscountPrice, "shippingDiscountPercentage:", shippingDiscountPercentage);

  const data = {
    user: user,
    appliedCouponName: couponCode,
    appliedCoupon: true,
    couponType: couponType,
    discount_amount: totalDiscountPrice,
    couponUse: couponUse,
  };

  // console.log("Request Data:", data);

  try {
    const res = await postService("/update/coupon/all", data, token);
    return res?.data?.success;
  } catch (error) {
    console.error("Error updating shipping discount:", error);
    return false;
  }
};

export const removeCouponCode = async () => {
  const token = localStorage.getItem("PIToken");
  if (!token) {
    localStorage.removeItem("PICart");
  } else {
    const user = JSON.parse(localStorage.getItem("PIUser"));
    const data = {
user: user?._id,
    };
    await postService("/remove/coupon", data);
  }
};

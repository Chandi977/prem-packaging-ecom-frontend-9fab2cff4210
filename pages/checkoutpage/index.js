"use client"; // This is a client component 👈🏽
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { indianStates } from "../../assets/data";
import Select from "react-select";
import { emptyCart, getCart } from "../../utils/cart";
import { getService, postService } from "../../services/service";
import AddressModal from "../../modals/AddressModal";
import Head from "next/head";
import { PRODUCTION } from "../../services/service";

const Checkoutpage = () => {
  const [widt, setWidt] = useState();
  const [token, setToken] = useState();
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState({});
  const [userAddresss, setUserAddresss] = useState([]);
  const [visible, setVisible] = useState(false);
  const [expressShip, setExpressShip] = useState(true);
  const [cart, setCart] = useState();
  const [pincode, setPincode] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [originalShippingCost, setOriginalShippingCost] = useState(0);
  const [totalCartValue, setTotalCartValue] = useState(0);
  const [radiobtn, setRadiobtn] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [address, setAddress] = useState();
  const [height, setHeight] = useState("auto");
  const [details, setDetails] = useState({
    name: "",
    mobile: "",
    gstin: "",
    address: "",
    pincode: "",
    landmark: "",
    town: "",
    email: "",
    state: "",
  });

  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  useEffect(() => {
    const temp = indianStates?.map((x) => {
      return { value: x, label: x };
    });
    setStates(temp);
  }, [indianStates]);

  const router = useRouter();
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

  const handleCart = async () => {
    const result = await getCart();
    setCart(result);
    // console.log(result);
  };
  const orderValueBeforeTax = shippingCost + cart?.total_amount;
  const orderValueBeforeTaxAllTypeDiscount =
    shippingCost + cart?.discount_amount;

  const orderValueBeforeTaxBothTypeDiscount = () => {
    if (cart?.totalDiscountPercentage) {
      const discountPercentage = cart?.totalDiscountPercentage;
      // console.log("total discount: " + cart?.totalDiscountPercentage);
      const maxCapDiscount = cart?.maxCapDiscount;

      const discount = (discountPercentage / 100) * orderValueBeforeTax;

      if (discount < maxCapDiscount) {
        const originalValue =
          orderValueBeforeTax -
          (discountPercentage / 100) * orderValueBeforeTax;

        //console.log("134", discountShippingCost);
        return originalValue;
      } else {
        const originalValue = orderValueBeforeTax - maxCapDiscount;
        return originalValue;
      }
    } else if (cart?.shippingDiscountPrice) {
      const discountPrice = cart?.shippingDiscountPrice;
      const originalValue = orderValueBeforeTax - discountPrice;
      return originalValue;
    }
  };

  const bothTypeDiscountOrderValueBeforeTax =
    orderValueBeforeTaxBothTypeDiscount();

  // console.log("105", bothTypeDiscountOrderValueBeforeTax);

  const getTaxableAmount = () => {
    // Ensure cart is not empty
    if (!cart) return 0;
    // Calculate TotalAmountForBox in cart items (ALL)
    let totalAmountForBox = 0;
    cart.products.forEach((item) => {
      if (item.product.name.toLowerCase() === "corrugated box") {
        totalAmountForBox += item.price * item.quantity;
      }
    });
    // Calculate taxable amount as 18% of the total amount
    if (cart?.discount_amount != 0) {
      const restAmount = orderValueBeforeTaxAllTypeDiscount - totalAmountForBox;
      const boxGST = (totalAmountForBox * 5) / 100;
      const restGST = (restAmount * 18) / 100;
      // const taxableAmount = (orderValueBeforeTaxAllTypeDiscount * 18) / 100;
      const taxableAmount = boxGST + restGST;
      return taxableAmount;
    } else if (cart?.couponType === "both") {
      const restAmount =
        bothTypeDiscountOrderValueBeforeTax - totalAmountForBox;
      const boxGST = (totalAmountForBox * 5) / 100;
      const restGST = (restAmount * 18) / 100;
      // const taxableAmount = (bothTypeDiscountOrderValueBeforeTax * 18) / 100;
      const taxableAmount = boxGST + restGST;
      return taxableAmount;
    } else {
      const restAmount = orderValueBeforeTax - totalAmountForBox;
      const boxGST = (totalAmountForBox * 5) / 100;
      const restGST = (restAmount * 18) / 100;
      // console.log("Order value before tax:" + orderValueBeforeTax);
      // console.log("Box total value:" + totalAmountForBox);
      // const taxableAmount = (orderValueBeforeTax * 18) / 100;
      const taxableAmount = boxGST + restGST;
      return taxableAmount;
    }
    // console.log("Final after all calculation: " + totalAmountForBox);
  };

  let isOutOfStock = false;

  const checkstocks = () => {
    cart?.products?.forEach((item) => {
      // console.log("cart product details: " + item.product);
      // console.log(" -- Quantity Selected in cart: " + item.quantity);
      // console.log(" -- > Packsize in cart: " + item.packSize);
      item.product.priceList.forEach((inneritem) => {
        if (inneritem.number == item.packSize) {
          // console.log("MATCHED: " + inneritem.number);
          if (inneritem.stock_quantity < item.quantity) {
            // console.log("ACCEPTED");
            isOutOfStock = true;
            return; // exit the inner loop
          }
        }
      });
      if (isOutOfStock) return; // exit the outer loop
    });
    return isOutOfStock;
  };

  const stockCheckResult = checkstocks();
  // console.log("FINAL RESULT: " + stockCheckResult); // will be true if "ACCEPTED" condition is met
  const gstTax = getTaxableAmount();
  // console.log("Final GST: " + gstTax);
  // console.log("IS OUT OF STOCK? : " + isOutOfStock);

  const getTotalOrderValue = () => {
    if (!cart) return 0;

    if (cart?.discount_amount != 0) {
      const totalOrderValue =
        orderValueBeforeTaxAllTypeDiscount + getTaxableAmount();
      return totalOrderValue;
    } else if (cart?.couponType === "both") {
      const totalOrderValue =
        bothTypeDiscountOrderValueBeforeTax + getTaxableAmount();
      return totalOrderValue;
    } else {
      const totalOrderValue = orderValueBeforeTax + getTaxableAmount();
      return totalOrderValue;
    }
  };
  const totalOrderValue = getTotalOrderValue();
  const orderValue = totalOrderValue;

  useEffect(() => {
    handleCart();
    if (typeof window !== "undefined") {
      const windowHeight = window.innerHeight;
      setHeight(windowHeight > 450 ? "325px" : "214px");
    }
  }, []);

  const getUser = async () => {
    const User = JSON.parse(localStorage.getItem("PIUser"));
    const user = await getService(`getuser/${User?._id}`);
    if (user?.data?.success) {
      setUserAddresss(user?.data?.data?.contact_address);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("PIToken");
    if (token) {
      getUser();
    }
    setToken(token);
  }, []);

  const calculateShippingCost = async () => {
    try {
      const response = await fetch(
        `https://server.prempackaging.com/premind/api/freight/get/one`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pincode: pincode,
            packweight: cart?.totalPackWeight,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Cart data: ", cart);
        // console.log("data: ", data);
        // console.log("Facility City: ", data.facilityCity); // useful
        if (expressShip) {
          // express method selected
          if (
            data.facilityCity === "Noida" ||
            data.facilityCity === "Ghaziabad" ||
            data.facilityCity === "Delhi" ||
            data.facilityCity === "Gurgaon"
          ) {
            setShippingCost(100);
            setOriginalShippingCost(100);
            document.getElementById("express").click();
          } else {
            toast.error("Pincode not availabe for Express Delivery");
            setPincode("");
          }
        } else {
          // Standard method selected
          setShippingCost(0);
          setOriginalShippingCost(0);
        }
        // if (cart?.shippingDiscountPercentage) {
        //   const discountPercentage = cart?.shippingDiscountPercentage; // 100%
        //   const maxCapDiscount = cart?.maxCapDiscount; // NULL
        //   const shippingCost = data.shippingCost; // 390 (for pin code 201301)
        //   const percentage = discountPercentage / 100;
        //   const discount = percentage * shippingCost;
        //   let discountShippingCost;
        //   console.log("discount: ", discount);

        //   if (discount < maxCapDiscount) {
        //     const discountShippingCost =
        //       shippingCost - (discountPercentage / 100) * shippingCost;

        //     // console.log("134", discountShippingCost);
        //     setShippingCost(discountShippingCost);
        //     setOriginalShippingCost(data.shippingCost);
        //   } else if (maxCapDiscount == null) {
        //     discountShippingCost = shippingCost - discount;
        //     setShippingCost(shippingCost - discount);
        //     setOriginalShippingCost(data.shippingCost);
        //   } else {
        //     discountShippingCost = shippingCost - maxCapDiscount;

        //     console.log("134", discountShippingCost);
        //     setShippingCost(discountShippingCost);
        //     setOriginalShippingCost(data.shippingCost);
        //   }
        // } else if (cart?.shippingDiscountPrice) {
        //   const discountPrice = cart?.shippingDiscountPrice;
        //   const shippingCost = data.shippingCost;
        //   const discountShippingCost = shippingCost - discountPrice;
        //   //console.log("134", discountShippingCost);
        //   setShippingCost(discountShippingCost);
        //   setOriginalShippingCost(data.shippingCost);
        // } else {
        //   setShippingCost(data.shippingCost);
        // }

        // setShippingCost(data.shippingCost);
        toast.success("Shipping Cost updated successfully ");
        //console.log("Shipping Cost: ", data.shippingCost);
      } else {
        // Handle API request error
        // console.error("Failed to fetch shipping cost");
        // toast.error("Please enter correct pincode");
      }
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = window.document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      window.document.body.appendChild(script);
    });
  };

  const displayRaxor = async (
    amount,
    name,
    number,
    email,
    address,
    orderId
  ) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    const amountInt = Math.round(parseInt(amount));
    if (!res) {
      alert("you are offline... failed to load razorpay");
      return;
    }
    //console.log("Amount", amountInt);
    //console.log("Amount", amountInt);
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: amountInt,
      currency: "INR",
      name: "Prem Packaging",
      description: "Test Transaction",
      image: "pp_logo_1.png",
      handler: async function (response) {
        const result = await fetch(
          `https://server.prempackaging.com/premind/api/order/update/payment/status`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              _id: orderId,
              paymentStatus: "Payment Verified",
              status: "Payment Verified",
            }),
          }
        );
        if (result?.data?.success) {
          toast.success("Order placed successfully");
          router.push("/");
          // if (window.location.pathname !== `/orderPlaced/${orderId}`) {
          //   dispatch(openLoader());
          // }
          await emptyCart();
        } else {
          toast.error("something wrong with payment");
          window.location.reload();
        }
      },
      prefill: {
        name: `${name}`,
        email: email,
        contact: number,
      },
      notes: {
        address: address,
      },
      theme: {
        color: "#0C4E9C",
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleOrder = async (totalcartval) => {
    // if(totalcartval >= 15000){

    // }
    // console.log("DETAILS HEREEEEE: ", details);
    if (!token) {
      if (!details.name) {
        toast.error("Please enter name");
        return;
      } else if (!details.address) {
        toast.error("Please enter Flat or house Number");
        return;
      } else if (!details.town) {
        toast.error("Please enter town or city");
        return;
      } else if (!details.email) {
        toast.error("Please enter email");
        return;
      }
      const items = cart?.products?.map((x) => {
        return {
          product: x?.product?._id,
          quantity: x?.quantity,
          price: x?.price,
          packSize: x?.packSize,
        };
      });

      if (pincode !== details.pincode) {
        console.log(pincode);
        toast.error(
          "Entered pincode does not match your selected address pincode."
        );
        return;
      }
      // console.log("place order button fired");
      if (shippingCost === 0) {
        //console.log(shippingCost);
        toast.error("Shipping cost cannot be zero. Please enter pincode.");
        return;
      }
      const data = {
        name: details.name,
        mobile: details.mobile,
        gstin: details.gstin,
        address: details.address,
        pincode: details.pincode,
        landmark: details.landmark,
        town: details.town,
        email: details.email,
        state: selectedState?.value,
        items: items,
        totalOrderValue: orderValue,
        totalCartValue: cart?.total_amount,
        shippingCost: shippingCost,
        taxableAmount: gstTax,
        paymentStatus: "Not Paid",
        utrNumber: "0",
      };
      const res = await postService("order/create", data);
      if (res?.data?.success) {
        const result = await emptyCart();
        toast.success("Order placed successfully");
        router.push("/payment");
      }
    } else {
      if (userAddresss?.length === 0) {
        toast.error(
          "No address selected. Please select an address or add a new one."
        );
        return;
      }
      const items = cart?.products?.map((x) => {
        return {
          product: x?.product?._id,
          quantity: x?.quantity,
          price: x?.price,
          packSize: x?.packSize,
        };
      });
      const data = {
        items: items,
        name: userAddresss[selectedIndex]?.name,
        mobile: userAddresss[selectedIndex]?.phone,
        gstin: userAddresss[selectedIndex]?.gstin,
        address: userAddresss[selectedIndex]?.address,
        pincode: userAddresss[selectedIndex]?.pincode,
        landmark: userAddresss[selectedIndex]?.landmark,
        town: userAddresss[selectedIndex]?.town,
        email: JSON.parse(localStorage.getItem("PIUser"))?.email_address,
        state: userAddresss[selectedIndex]?.state,
        user: JSON.parse(localStorage.getItem("PIUser"))?._id,
        totalOrderValue: orderValue,
        totalCartValue: cart?.total_amount,
        shippingCost: shippingCost,
        taxableAmount: gstTax,
        paymentStatus: "Not Paid",
        utrNumber: "0",
        couponCode: cart?.appliedCouponName,
      };
      console.log(userAddresss[selectedIndex]?.gstin.length);
      console.log(totalcartval);
      if (totalcartval > 1 && userAddresss[selectedIndex]?.gstin.length < 15) {
        toast.error("Please add a GST number for this order.");
        return;
      }
      if (pincode !== userAddresss[selectedIndex]?.pincode) {
        toast.error(
          "Entered pincode does not match your selected address pincode."
        );
        return;
      }

      if (cart?.couponUse === "single") {
        const userId = JSON.parse(localStorage.getItem("PIUser"))?._id;
        const couponCode = cart?.appliedCouponName;

        const data = {
          userId,
          couponCode,
        };
        const res = await postService("add/coupon", data);
        // console.log("428", res);
      }
      const res = await postService("order/create", data);
      if (res?.data?.success) {
        //console.log("OrderId", res?.data?.data?._id);
        await displayRaxor(
          data?.totalOrderValue * 100,
          data?.name,
          data?.mobile,
          data?.email,
          data?.address,
          res?.data?.data?._id
        );
        // const result = await emptyCart();
        // toast.success("Order placed successfully");
        // router.push("/payment");
      }
    }
  };

  const handleVisible = () => {
    setVisible(false);
    getUser();
  };

  const handleEdit = (e, x) => {
    e.stopPropagation();
    setVisible(true);
    setAddress(x);
  };

  const handleRemove = async (e, index) => {
    e.stopPropagation();
    const temp = userAddresss;
    temp.splice(index, 1);
    const User = JSON.parse(localStorage.getItem("PIUser"));
    const data = {
      id: User?._id,
      contact_address: temp,
    };
    const res = await postService("edituser", data);
    if (res?.data?.success) {
      toast.success("Address removed successfully");
      getUser();
    }
  };

  useEffect(() => {
    // console.log("Radio Btn: ", radiobtn);
  }, [radiobtn]);

  const handleShippingChange = (value) => {
    setRadiobtn(true);
    if (value === "express") {
      setExpressShip(true);
    } else {
      setExpressShip(false);
    }
    setPincode("");
    // calculateShippingCost();
  };

  const calculateFinalShipCost = async (pincodeValue) => {
    // Code to calculate all the value that we need!
    try {
      const response = await fetch(
        `https://server.prempackaging.com/premind/api/freight/get/one`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pincode: pincodeValue,
            packweight: cart?.totalPackWeight,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Cart data: ", cart);
        // console.log("data GETTING: ", data);
        // console.log("Facility City: ", data.facilityCity); // useful
        // console.log("PINCODE VALUE GETTING: ", pincodeValue);
        if (expressShip) {
          // express method selected
          if (
            pincodeValue === "122022" ||
            pincodeValue === "201015" ||
            pincodeValue === "121000" ||
            pincodeValue === "110066" ||
            pincodeValue === "122234" ||
            pincodeValue === "110101" ||
            pincodeValue === "201306" ||
            pincodeValue === "124505" ||
            pincodeValue === "122002" ||
            pincodeValue === "110007" ||
            pincodeValue === "122010" ||
            pincodeValue === "110080" ||
            pincodeValue === "122016" ||
            pincodeValue === "110022" ||
            pincodeValue === "110079" ||
            pincodeValue === "121001" ||
            pincodeValue === "201313" ||
            pincodeValue === "110084" ||
            pincodeValue === "122001" ||
            pincodeValue === "110102" ||
            pincodeValue === "201014" ||
            pincodeValue === "110069" ||
            pincodeValue === "110039" ||
            pincodeValue === "110119" ||
            pincodeValue === "110605" ||
            pincodeValue === "110043" ||
            pincodeValue === "123507" ||
            pincodeValue === "110049" ||
            pincodeValue === "110030" ||
            pincodeValue === "201318" ||
            pincodeValue === "122100" ||
            pincodeValue === "110065" ||
            pincodeValue === "121010" ||
            pincodeValue === "110011" ||
            pincodeValue === "110025" ||
            pincodeValue === "122207" ||
            pincodeValue === "122007" ||
            pincodeValue === "121004" ||
            pincodeValue === "110067" ||
            pincodeValue === "122003" ||
            pincodeValue === "201301" ||
            pincodeValue === "201106" ||
            pincodeValue === "122055" ||
            pincodeValue === "201007" ||
            pincodeValue === "122004" ||
            pincodeValue === "110073" ||
            pincodeValue === "110086" ||
            pincodeValue === "201018" ||
            pincodeValue === "110003" ||
            pincodeValue === "201021" ||
            pincodeValue === "110078" ||
            pincodeValue === "122220" ||
            pincodeValue === "110047" ||
            pincodeValue === "201206" ||
            pincodeValue === "110051" ||
            pincodeValue === "201316" ||
            pincodeValue === "110503" ||
            pincodeValue === "110013" ||
            pincodeValue === "121005" ||
            pincodeValue === "121102" ||
            pincodeValue === "245304" ||
            pincodeValue === "201002" ||
            pincodeValue === "110031" ||
            pincodeValue === "201019" ||
            pincodeValue === "122231" ||
            pincodeValue === "122226" ||
            pincodeValue === "110016" ||
            pincodeValue === "124508" ||
            pincodeValue === "110090" ||
            pincodeValue === "110089" ||
            pincodeValue === "203208" ||
            pincodeValue === "110036" ||
            pincodeValue === "110014" ||
            pincodeValue === "110608" ||
            pincodeValue === "201102" ||
            pincodeValue === "110085" ||
            pincodeValue === "110505" ||
            pincodeValue === "110104" ||
            pincodeValue === "110103" ||
            pincodeValue === "110059" ||
            pincodeValue === "122230" ||
            pincodeValue === "110054" ||
            pincodeValue === "122012" ||
            pincodeValue === "122102" ||
            pincodeValue === "110100" ||
            pincodeValue === "110042" ||
            pincodeValue === "123003" ||
            pincodeValue === "201101" ||
            pincodeValue === "110052" ||
            pincodeValue === "110020" ||
            pincodeValue === "110091" ||
            pincodeValue === "110604" ||
            pincodeValue === "110504" ||
            pincodeValue === "110401" ||
            pincodeValue === "110098" ||
            pincodeValue === "110012" ||
            pincodeValue === "110048" ||
            pincodeValue === "201012" ||
            pincodeValue === "122011" ||
            pincodeValue === "110301" ||
            pincodeValue === "122006" ||
            pincodeValue === "110403" ||
            pincodeValue === "110015" ||
            pincodeValue === "201020" ||
            pincodeValue === "110607" ||
            pincodeValue === "122101" ||
            pincodeValue === "201309" ||
            pincodeValue === "122206" ||
            pincodeValue === "110063" ||
            pincodeValue === "121003" ||
            pincodeValue === "110096" ||
            pincodeValue === "201304" ||
            pincodeValue === "110046" ||
            pincodeValue === "122203" ||
            pincodeValue === "111112" ||
            pincodeValue === "110019" ||
            pincodeValue === "122227" ||
            pincodeValue === "110110" ||
            pincodeValue === "110117" ||
            pincodeValue === "201312" ||
            pincodeValue === "122009" ||
            pincodeValue === "111120" ||
            pincodeValue === "121011" ||
            pincodeValue === "110507" ||
            pincodeValue === "121014" ||
            pincodeValue === "201005" ||
            pincodeValue === "201016" ||
            pincodeValue === "201017" ||
            pincodeValue === "201315" ||
            pincodeValue === "110609" ||
            pincodeValue === "110071" ||
            pincodeValue === "110058" ||
            pincodeValue === "201006" ||
            pincodeValue === "122232" ||
            pincodeValue === "201307" ||
            pincodeValue === "110108" ||
            pincodeValue === "110113" ||
            pincodeValue === "122005" ||
            pincodeValue === "110088" ||
            pincodeValue === "110094" ||
            pincodeValue === "122215" ||
            pincodeValue === "122223" ||
            pincodeValue === "201300" ||
            pincodeValue === "121013" ||
            pincodeValue === "122208" ||
            pincodeValue === "110502" ||
            pincodeValue === "110033" ||
            pincodeValue === "122211" ||
            pincodeValue === "110005" ||
            pincodeValue === "110057" ||
            pincodeValue === "110006" ||
            pincodeValue === "110083" ||
            pincodeValue === "110040" ||
            pincodeValue === "122013" ||
            pincodeValue === "110115" ||
            pincodeValue === "201009" ||
            pincodeValue === "110125" ||
            pincodeValue === "201000" ||
            pincodeValue === "110072" ||
            pincodeValue === "124501" ||
            pincodeValue === "110018" ||
            pincodeValue === "110402" ||
            pincodeValue === "121101" ||
            pincodeValue === "122210" ||
            pincodeValue === "122218" ||
            pincodeValue === "110076" ||
            pincodeValue === "110093" ||
            pincodeValue === "201303" ||
            pincodeValue === "122017" ||
            pincodeValue === "210005" ||
            pincodeValue === "110092" ||
            pincodeValue === "201305" ||
            pincodeValue === "201317" ||
            pincodeValue === "110017" ||
            pincodeValue === "110037" ||
            pincodeValue === "110029" ||
            pincodeValue === "110053" ||
            pincodeValue === "110510" ||
            pincodeValue === "122204" ||
            pincodeValue === "122019" ||
            pincodeValue === "201003" ||
            pincodeValue === "110026" ||
            pincodeValue === "121012" ||
            pincodeValue === "110024" ||
            pincodeValue === "110027" ||
            pincodeValue === "110118" ||
            pincodeValue === "110050" ||
            pincodeValue === "122209" ||
            pincodeValue === "121015" ||
            pincodeValue === "110302" ||
            pincodeValue === "110009" ||
            pincodeValue === "110508" ||
            pincodeValue === "110095" ||
            pincodeValue === "110116" ||
            pincodeValue === "110501" ||
            pincodeValue === "110060" ||
            pincodeValue === "122213" ||
            pincodeValue === "122214" ||
            pincodeValue === "110114" ||
            pincodeValue === "210003" ||
            pincodeValue === "201013" ||
            pincodeValue === "110028" ||
            pincodeValue === "201103" ||
            pincodeValue === "110112" ||
            pincodeValue === "110044" ||
            pincodeValue === "110512" ||
            pincodeValue === "110099" ||
            pincodeValue === "110511" ||
            pincodeValue === "110105" ||
            pincodeValue === "121009" ||
            pincodeValue === "110106" ||
            pincodeValue === "110001" ||
            pincodeValue === "110034" ||
            pincodeValue === "110082" ||
            pincodeValue === "110056" ||
            pincodeValue === "124507" ||
            pincodeValue === "201008" ||
            pincodeValue === "203207" ||
            pincodeValue === "110097" ||
            pincodeValue === "122015" ||
            pincodeValue === "110062" ||
            pincodeValue === "110121" ||
            pincodeValue === "201314" ||
            pincodeValue === "110603" ||
            pincodeValue === "122217" ||
            pincodeValue === "110068" ||
            pincodeValue === "110509" ||
            pincodeValue === "110008" ||
            pincodeValue === "110077" ||
            pincodeValue === "110606" ||
            pincodeValue === "122228" ||
            pincodeValue === "110120" ||
            pincodeValue === "121006" ||
            pincodeValue === "122224" ||
            pincodeValue === "201310" ||
            pincodeValue === "201311" ||
            pincodeValue === "122098" ||
            pincodeValue === "110124" ||
            pincodeValue === "122021" ||
            pincodeValue === "110075" ||
            pincodeValue === "110506" ||
            pincodeValue === "122225" ||
            pincodeValue === "110081" ||
            pincodeValue === "110045" ||
            pincodeValue === "122020" ||
            pincodeValue === "121002" ||
            pincodeValue === "110122" ||
            pincodeValue === "122216" ||
            pincodeValue === "110064" ||
            pincodeValue === "110010" ||
            pincodeValue === "110070" ||
            pincodeValue === "110087" ||
            pincodeValue === "110002" ||
            pincodeValue === "122233" ||
            pincodeValue === "122109" ||
            pincodeValue === "110021" ||
            pincodeValue === "110074" ||
            pincodeValue === "122229" ||
            pincodeValue === "122000" ||
            pincodeValue === "121008" ||
            pincodeValue === "110109" ||
            pincodeValue === "124506" ||
            pincodeValue === "110004" ||
            pincodeValue === "122018" ||
            pincodeValue === "201302" ||
            pincodeValue === "110107" ||
            pincodeValue === "110023" ||
            pincodeValue === "110061" ||
            pincodeValue === "110038" ||
            pincodeValue === "110601" ||
            pincodeValue === "110055" ||
            pincodeValue === "110032" ||
            pincodeValue === "110602" ||
            pincodeValue === "201004" ||
            pincodeValue === "201010" ||
            pincodeValue === "122219" ||
            pincodeValue === "201001" ||
            pincodeValue === "110035" ||
            pincodeValue === "201308" ||
            pincodeValue === "110041" ||
            pincodeValue === "201011" ||
            pincodeValue === "121007" ||
            pincodeValue === "122008" ||
            pincodeValue === "122014"
          ) {
            setShippingCost(100);
            setOriginalShippingCost(100);
            document.getElementById("express").click();
            toast.success("Express Delivery Applied!");
          } else {
            toast.error("Pincode not availabe for Express Delivery");
            setPincode("");
          }
        } else {
          // Standard method selected
          if (pincodeValue === "232108") {
            toast.error("Pincode not availabe for Delivery");
            setPincode("");
          } else {
            toast.success("Standard Delivery Applied!");
            setShippingCost(0);
            setOriginalShippingCost(0);
          }
        }
        // if (cart?.shippingDiscountPercentage) {
        //   const discountPercentage = cart?.shippingDiscountPercentage; // 100%
        //   const maxCapDiscount = cart?.maxCapDiscount; // NULL
        //   const shippingCost = data.shippingCost; // 390 (for pin code 201301)
        //   const percentage = discountPercentage / 100;
        //   const discount = percentage * shippingCost;
        //   let discountShippingCost;
        //   console.log("discount: ", discount);

        //   if (discount < maxCapDiscount) {
        //     const discountShippingCost =
        //       shippingCost - (discountPercentage / 100) * shippingCost;

        //     // console.log("134", discountShippingCost);
        //     setShippingCost(discountShippingCost);
        //     setOriginalShippingCost(data.shippingCost);
        //   } else if (maxCapDiscount == null) {
        //     discountShippingCost = shippingCost - discount;
        //     setShippingCost(shippingCost - discount);
        //     setOriginalShippingCost(data.shippingCost);
        //   } else {
        //     discountShippingCost = shippingCost - maxCapDiscount;

        //     console.log("134", discountShippingCost);
        //     setShippingCost(discountShippingCost);
        //     setOriginalShippingCost(data.shippingCost);
        //   }
        // } else if (cart?.shippingDiscountPrice) {
        //   const discountPrice = cart?.shippingDiscountPrice;
        //   const shippingCost = data.shippingCost;
        //   const discountShippingCost = shippingCost - discountPrice;
        //   //console.log("134", discountShippingCost);
        //   setShippingCost(discountShippingCost);
        //   setOriginalShippingCost(data.shippingCost);
        // } else {
        //   setShippingCost(data.shippingCost);
        // }

        // setShippingCost(data.shippingCost);
        // toast.success("Shipping Cost updated successfully ");
        //console.log("Shipping Cost: ", data.shippingCost);
      } else {
        // Handle API request error
        console.error("Failed to fetch shipping cost");
        // toast.error("Please enter correct pincode");
      }
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout | store.prempackaging</title>
        <meta name="title" content="Checkout" />
        <meta
          name="description"
          content="Complete your order securely with our simple checkout. Multiple payment options and fast confirmation ensure a smooth shopping experience."
        />
      </Head>
      <div style={{ paddingTop: `${widt > breakpoint ? "120px" : "150px"}` }}>
        <div className="row p-0 m-0">
          <div className={"container-fluid" + styles.mainbody}>
            <div className={"row bg-white mb-3 mt-3  " + styles.billinglayout}>
              <div className="col-12 col-md-6">
                <div className="mt-1">
                  <span
                    className="p-0 mx-0"
                    style={{
                      color: "#3A5BA2",
                      fontSize: "30px",
                      fontStyle: "normal",
                      fontWeight: "700",
                      lineHeight: "48px",
                    }}
                  >
                    BILLING DETAILS
                  </span>
                </div>
                {token && (
                  <div
                    className="container p-0 m-0 mb-3"
                    style={{ width: "auto", minHeight: "auto" }}
                  >
                    <p
                      className="p-0"
                      style={{
                        color: "var(--heading, #1D1D1D)",
                        fontSize: "17px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        fontFamily: "Montserrat",
                      }}
                    >
                      Select Address:
                    </p>
                    <div className="mt-3 d-flex flex-wrap flex-row justify-content-between align-items-center">
                      {userAddresss?.map((x, index) => {
                        return (
                          <div
                            className={
                              "px-2 py-1 mt-3 bg-white d-flex flex-column justify-content-start align-items-start " +
                              styles.addressdetailcard
                            }
                            key={index}
                            style={{
                              border: `${
                                selectedIndex === index
                                  ? "2px solid blue"
                                  : "0.795px solid #E6E6E6"
                              }`,
                              cursor: "pointer",
                            }}
                            onClick={() => setSelectedIndex(index)}
                          >
                            <p className="p-0 m-0" style={{ fontSize: "16px" }}>
                              <strong>{x?.name}</strong>
                            </p>
                            <p
                              className="p-0 m-0 w-100 mt-2"
                              style={{ fontSize: "13px" }}
                            >
                              <strong>Street : </strong>
                              {x?.address}
                            </p>
                            {x?.landmark && (
                              <p
                                className="p-0 m-0 w-100 mt-1"
                                style={{ fontSize: "13px" }}
                              >
                                <strong>Landmark: </strong> {x?.landmark}
                              </p>
                            )}
                            <p
                              className="p-0 m-0 w-100 mt-1"
                              style={{ fontSize: "13px" }}
                            >
                              <strong>City : </strong>
                              <span style={{ fontWeight: "600" }}>
                                {x?.town}
                              </span>
                            </p>
                            {x?.state && (
                              <p
                                className="p-0 m-0 w-100 mt-1"
                                style={{ fontSize: "13px" }}
                              >
                                <strong>State: </strong>
                                {x?.state}
                              </p>
                            )}
                            {x?.pincode && (
                              <p
                                className="p-0 m-0 w-100 mt-1"
                                style={{ fontSize: "13px" }}
                              >
                                <strong>Zip code: </strong> {x?.pincode}
                              </p>
                            )}
                            {x?.mobile && (
                              <p
                                className="p-0 m-0 w-100 mt-1"
                                style={{ fontSize: "13px" }}
                              >
                                <strong>Phone number: </strong> {x?.mobile}
                              </p>
                            )}
                            <p
                              className="p-0 m-0 w-100 mt-1"
                              style={{ fontSize: "13px" }}
                            >
                              <strong>Email : </strong>
                              {x?.email}
                            </p>
                            {x?.gstin && (
                              <p
                                className="p-0 m-0 w-100 mt-1"
                                style={{ fontSize: "13px" }}
                              >
                                <strong>GSTIN: </strong> {x?.gstin}
                              </p>
                            )}

                            <div className="mt-2 d-flex flex-row justify-content-start align-items-center">
                              <p
                                className="p-0 m-0 mt-1"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => handleEdit(e, x)}
                              >
                                Edit
                              </p>
                              <div
                                className="p-0"
                                style={{
                                  textAlign: "center",
                                  marginLeft: "12px",
                                  height: "14px",
                                  borderLeft: "2px solid #D9D9D9",
                                }}
                              ></div>
                              <p
                                className="p-0 m-0 mt-1 mx-2"
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => handleRemove(e, index)}
                              >
                                Remove
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div
                        className={
                          "mt-2 bg-white d-flex flex-column justify-content-center align-items-center " +
                          styles.addressdetailcard
                        }
                        style={{
                          border: "0.795px solid #E6E6E6",
                          cursor: "pointer",
                        }}
                        onClick={() => setVisible(true)}
                      >
                        <FontAwesomeIcon
                          icon={faAdd}
                          style={{
                            color: "#ddd",
                            width: "40px",
                            height: "40px",
                          }}
                        />
                        <p>
                          <strong>Add address</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!token && (
                  <form
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "0px",
                      margin: "0px",
                      marginLeft: "0px",
                      marginTop: "30px",
                    }}
                    onSubmit={handleOrder}
                  >
                    <>
                      <label className="p-0 mt-0">Full Name*</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        required
                        value={details.name}
                        onChange={(e) =>
                          setDetails({ ...details, name: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">Mobile Number</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        value={details.mobile}
                        onChange={(e) =>
                          setDetails({ ...details, mobile: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">GSTIN</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        value={details.gstin}
                        onChange={(e) =>
                          setDetails({ ...details, gstin: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">
                        Flat, House no., Building, Apartment*
                      </label>
                      <input
                        placeholder="House number and street name"
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        required
                        value={details.address}
                        onChange={(e) =>
                          setDetails({ ...details, address: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">Pin Code</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        value={details.pincode}
                        onChange={(e) =>
                          setDetails({ ...details, pincode: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">Landmark</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        value={details.landmark}
                        onChange={(e) =>
                          setDetails({ ...details, landmark: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">Town/City*</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        required
                        value={details.town}
                        onChange={(e) =>
                          setDetails({ ...details, town: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">Email address*</label>
                      <input
                        style={{
                          width: "100%",
                          height: "48px",
                          backgroundColor: "white",
                          border: "1px solid #EBEBEB",
                          padding: "10px",
                        }}
                        value={details.email}
                        onChange={(e) =>
                          setDetails({ ...details, email: e.target.value })
                        }
                      />
                      <label className="p-0 mt-3">State</label>
                      <Select
                        options={states}
                        placeholder="choose a state"
                        value={selectedState}
                        onChange={setSelectedState}
                      ></Select>
                    </>
                  </form>
                )}
              </div>
              <div
                className={
                  "col-12 col-md-6 mx-0 mt-2 px-0" + styles.biling_right
                }
              >
                <p
                  className="p-0"
                  style={{
                    color: "#3A5BA2",
                    fontSize: "30px",
                    fontStyle: "normal",
                    fontWeight: "700",
                    lineHeight: "48px",
                    marginBottom: "52px",
                  }}
                >
                  YOUR ORDER
                </p>
                <div
                  className="row p-0 m-0 "
                  style={{
                    border: "1px solid #EBEBEB",
                    borderRight: "none",
                    paddingTop: "20px",
                  }}
                >
                  <div className="col-6 w-75 p-0">
                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p className="m-0 px-3">
                        <strong>Product</strong>
                      </p>
                    </div>
                    {cart?.products?.map((x, index) => {
                      return (
                        <div
                          className="w-100 d-flex justify-content-start align-items-center m-0"
                          style={{
                            height: "66px",
                            border: "1px solid #EBEBEB",
                            borderTop: "none",
                            borderLeft: "none",
                          }}
                          key={index}
                        >
                          <img
                            className="h-100 p-2"
                            src={x?.product?.images?.[0]?.image}
                          />
                          <p className={"m-0 px-3 " + styles.ordertext}>
                            {x?.product?.name} {x?.product?.model} (Pack of{" "}
                            {x?.packSize} pcs) (Qty {x?.quantity} )
                          </p>
                        </div>
                      );
                    })}

                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p
                        className="m-0 px-3"
                        style={{ fontWeight: "600", fontFamily: "Montserrat" }}
                      >
                        {" "}
                        Total Cart Value
                      </p>
                    </div>

                    <div
                      className="w-100  m-0"
                      style={{
                        // height: "88px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p
                        className="my-2 px-3"
                        style={{ fontWeight: "600", fontFamily: "Montserrat" }}
                      >
                        {" "}
                        Choose Delivery Method
                      </p>
                      <div className="container">
                        <input
                          type="radio"
                          id="express"
                          name="shipping"
                          value="express"
                          onChange={(e) => handleShippingChange(e.target.value)}
                        />
                        <label for="express">
                          <h5 style={{ fontSize: "18px" }}>
                            Express Delivery (2-3 Working Days) &#8205; &#8205;
                            &#8205; &#8205; &#8205; &#8205; &#8205; &#8205;
                            &#8205; &#8205; &#8205; &#8205; &#8205; &#8205;
                            &#8205; &#8205; &#8205; &#8205; &#8205; &#8205;
                            &#8205; &#8205; &#8205; &#8205;
                            <span style={{ color: "grey" }}>{"Rs.100"}</span>
                          </h5>
                        </label>
                        <p>
                          <i style={{ fontSize: "14px", color: "grey" }}>
                            Applicable for Delhi NCR
                          </i>
                        </p>
                        <input
                          type="radio"
                          id="standard"
                          name="shipping"
                          value="standard"
                          onChange={(e) => handleShippingChange(e.target.value)}
                        />
                        <label for="standard">
                          <h5 style={{ fontSize: "18px" }}>
                            Standard Delivery (7-10 Working Days) &#8205;
                            &#8205; &#8205; &#8205; &#8205; &#8205; &#8205;
                            &#8205; &#8205; &#8205; &#8205; &#8205; &#8205;
                            &#8205; &#8205; &#8205; &#8205; &#8205; &#8205;
                            &#8205; &#8205; &#8205;
                            <span style={{ color: "grey" }}>{"Free"}</span>
                          </h5>
                        </label>
                        <p>
                          <i style={{ fontSize: "14px", color: "grey" }}>
                            Applicable Pan India
                          </i>
                        </p>
                      </div>
                      <div className="my-2 px-3">
                        {radiobtn ? (
                          <div className={styles.lastlayoutfirsthalf}>
                            <input
                              style={{ paddingLeft: "10px" }}
                              placeholder="Enter Pincode"
                              className={styles.lastlayoutcouponinput}
                              value={pincode}
                              maxLength={6}
                              pattern="[0-9]*"
                              onChange={(e) => {
                                const enteredValue = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                setPincode(enteredValue);
                                if (enteredValue.length === 6) {
                                  console.log("ENTERED_VALUE: ", enteredValue);
                                  calculateFinalShipCost(enteredValue);
                                }
                              }}
                            />
                            {/* <button
                              className={styles.lastlayoutcouponbtn}
                              onClick={calculateShippingCost}
                            >
                              Submit
                            </button> */}
                          </div>
                        ) : (
                          <div style={{ color: "red", marginTop: "12px" }}>
                            <p>&#8205;</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p
                        className="m-0 px-3"
                        style={{ fontWeight: "600", fontFamily: "Montserrat" }}
                      >
                        {" "}
                        Total Cart Value + Delivery Charges
                      </p>
                    </div>

                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p
                        className="m-0 px-3"
                        style={{ fontWeight: "600", fontFamily: "Montserrat" }}
                      >
                        GST{" "}
                        <sup
                          onClick={togglePopup}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src="/circleinfo.svg"
                            alt=""
                            height={15}
                            width={15}
                            // style={{ position: "relative" }}
                          />
                        </sup>
                      </p>
                      {showPopup && (
                        <div className="popup">
                          For corrugated boxes, GST is 5%. For all other
                          products, GST is 18%
                        </div>
                      )}
                    </div>

                    {/* Coupon Code */}
                    {cart?.appliedCoupon && (
                      <div
                        className="w-100 d-flex justify-content-start align-items-center m-0"
                        style={{
                          height: "66px",
                          border: "1px solid #EBEBEB",
                          borderTop: "none",
                          borderLeft: "none",
                          borderBottom: "1px solid #EBEBEB",
                        }}
                      >
                        <p
                          className="m-0 px-3"
                          style={{
                            fontWeight: "600",
                            fontFamily: "Montserrat",
                          }}
                        >
                          Coupon Code Applied
                        </p>
                      </div>
                    )}

                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "10px",
                        borderBottom: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p
                        className="m-0 px-3"
                        style={{ fontWeight: "600", fontFamily: "Montserrat" }}
                      >
                        Total Payable Amount
                      </p>
                    </div>
                  </div>

                  <div className="col-6 w-25 p-0">
                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p className="m-0 px-3">
                        <strong>Total</strong>
                      </p>
                    </div>
                    {cart?.products?.map((x, index) => {
                      return (
                        <div
                          className="w-100 d-flex justify-content-start align-items-center m-0"
                          style={{
                            height: "66px",
                            border: "1px solid #EBEBEB",
                            borderTop: "none",
                            borderLeft: "none",
                          }}
                          key={index}
                        >
                          {/* <p className="m-0 px-3">
                            ₹{Math.round(x?.price * x?.quantity)}
                          </p> */}
                          <p className="m-0 px-3">
                            {cart?.appliedCoupon &&
                            cart?.couponType === "product" &&
                            x?.discountPrice ? (
                              <>
                                <s>₹{Math.round(x?.price * x?.quantity)}</s>
                                <span className="ml-1 fs-5 fw-normal">
                                  ₹{Math.round(x?.discountPrice * x?.quantity)}
                                </span>
                              </>
                            ) : (
                              <>₹{Math.round(x?.price * x?.quantity)}</>
                            )}
                          </p>
                        </div>
                      );
                    })}
                    <div
                      className="w-100 d-flex justify-content-start align-items-center pt-2"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      {cart?.discount_amount === 0 ? (
                        <>
                          <span className="ml-3">
                            {" "}
                            ₹{Math.round(cart?.total_amount)}
                          </span>
                        </>
                      ) : (
                        <>
                          <s className="ml-3">
                            ₹{Math.round(cart?.total_amount)}
                          </s>
                          <span className="ml-2 fs-5 fw-normal">
                            ₹{Math.round(cart?.discount_amount)}
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      className={
                        ("w-100 d-flex justify-content-start align-items-center mt-2",
                        styles.deliverycostdiv)
                      }
                      // style={{
                      //   height: "214px",
                      //   // height: "325px",
                      //   border: "1px solid #EBEBEB",
                      //   borderTop: "none",
                      //   borderLeft: "none",
                      // }}
                    >
                      {cart?.appliedCoupon &&
                      cart?.couponType === "shipping" ? (
                        <>
                          <s className="ml-3">
                            ₹{Math.round(originalShippingCost)}
                          </s>
                          <span className="ml-2 fs-5 fw-normal">
                            ₹{Math.round(shippingCost)}
                          </span>
                        </>
                      ) : (
                        <span className="ml-3">
                          {" "}
                          ₹{Math.round(shippingCost)}
                        </span>
                      )}
                    </div>

                    <div
                      className="w-100 d-flex justify-content-start align-items-center pt-2"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      {cart?.discount_amount != 0 ? (
                        <>
                          <span className="ml-3">
                            ₹{Math.round(orderValueBeforeTaxAllTypeDiscount)}
                          </span>
                        </>
                      ) : cart?.couponType === "both" ? (
                        <>
                          <s className="ml-3">
                            ₹{Math.round(orderValueBeforeTax)}
                          </s>
                          <span className="ml-2 fs-5 fw-normal">
                            ₹{Math.round(bothTypeDiscountOrderValueBeforeTax)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="ml-3">
                            ₹{Math.round(orderValueBeforeTax)}
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      className="w-100 d-flex justify-content-start align-items-center mt-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p className="m-0 px-3">₹{Math.round(gstTax)}</p>
                    </div>

                    {cart?.appliedCoupon && (
                      <div
                        className="w-100 d-flex justify-content-start align-items-center mt-0"
                        style={{
                          height: "66px",
                          border: "1px solid #EBEBEB",
                          borderTop: "none",
                          borderLeft: "none",
                        }}
                      >
                        <p className="m-0 px-3">
                          {/* { cart?.couponType === "shipping" ? (
                            <>
                              <>
                               - ₹{Math.round(originalShippingCost - shippingCost)} 
                              </>
                              <span className="ml-2 fs-5 fw-normal">
                               
                              </span>
                            </>
                          ) : (
                            <> ₹{Math.round(shippingCost)}</>
                          )} */}
                          {cart?.appliedCouponName}
                        </p>
                      </div>
                    )}

                    <div
                      className="w-100 d-flex justify-content-start align-items-center m-0"
                      style={{
                        height: "66px",
                        border: "1px solid #EBEBEB",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <p className="m-0 px-3">
                        <strong>₹{Math.round(totalOrderValue)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="row mt-5 my-5 m-0"
                  style={{ border: "1px solid #EBEBEB" }}
                >
                  <div
                    className="row p-0 px-5 m-0 mt-4"
                    style={{
                      height: "100px",
                      backgroundColor: "#FBFBFB",
                      border: "1px solid #EBEBEB",
                    }}
                  >
                    <div className="p-0 d-flex justify-content-center align-items-center">
                      <p className={"m-0 " + styles.placeordertext}>
                        Only Prepaid Orders accepted . For payment , use this{" "}
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "18px",
                          }}
                        >
                          premindustriesecom@hsbc
                        </span>{" "}
                        UPI ID for payment. Once we receive your payment , we
                        will update your order status and an Email Confirmation
                        will be sent.
                      </p>
                    </div>
                  </div>
                  <div
                    className="row p-0 mx-0 mb-5 m-0 mt-4"
                    style={{ height: "77px" }}
                  >
                    <div className="p-0 d-flex justify-content-center align-items-center">
                      {stockCheckResult ? (
                        <p className="text-danger">
                          Some Items are out of stock, Cannot Place Order!
                        </p>
                      ) : (
                        <button
                          className={styles.placeorderbtn}
                          style={{
                            height: "48px",
                            color: "white",
                            borderRadius: "4px",
                            border: "0px",
                          }}
                          // onClick={handleOrder}
                          onClick={() => handleOrder(cart?.total_amount)}
                        >
                          PLACE ORDER
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AddressModal
          visible={visible}
          handleVisible={handleVisible}
          prev={userAddresss}
          address={address}
        ></AddressModal>
      </div>
    </>
  );
};

export default Checkoutpage;

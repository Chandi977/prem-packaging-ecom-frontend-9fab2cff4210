import axios from "axios";
import { toast } from "react-toastify";

// BASE URLS
export const DEV =
  "https://prem-packaging-ecom-backend-2.onrender.com/premind/api/";
export const PRODUCTION = "http://localhost:5000/premind/api/";

// Core request handler with auto-retry
const requestWithRetry = async (method, url, payload) => {
  try {
    // 1️⃣ Try PRODUCTION first
    const res = await axios({
      method,
      url: PRODUCTION + url,
      ...(payload && { data: payload }),
    });
    console.log("Running on local server");

    return res;
  } catch (error) {
    console.warn("PRODUCTION failed, retrying with DEV…", error?.message);

    try {
      // 2️⃣ Retry with DEV
      const retryRes = await axios({
        method,
        url: DEV + url,
        ...(payload && { data: payload }),
      });

      return retryRes;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      return null;
    }
  }
};

export const getService = async (url, params) => {
  return await requestWithRetry("get", url, params);
};

export const postService = async (url, data) => {
  return await requestWithRetry("post", url, data);
};

export const putService = async (url, data) => {
  return await requestWithRetry("put", url, data);
};

// services/service.js
import axios from "axios";
import { toast } from "react-toastify";

// BASE URLS (kept exactly as you provided)
// export const DEV =
//   "https://prem-packaging-ecom-backend-2.onrender.com/premind/api/";
export const PRODUCTION =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/premind/api/"
    : "https://prem-packaging-ecom-backend-2.onrender.com/premind/api/";

// Core request handler with auto-retry
// NOTE: kept the same retry order (PRODUCTION first, DEV second)
const requestWithRetry = async (method, url, payload, axiosConfig = {}) => {
  try {
    // Build axios options for PRODUCTION
    const prodOptions = {
      method,
      url: PRODUCTION + url,
      ...axiosConfig,
    };

    // For GET requests we expect payload to be 'params' (backwards-compatible)
    if (method.toLowerCase() === "get") {
      if (payload && typeof payload === "object") {
        prodOptions.params = payload;
      }
    } else {
      // for post/put, payload is request body
      if (payload !== undefined) prodOptions.data = payload;
    }

    const res = await axios(prodOptions);
    console.log("Running on local server");
    return res;
  } catch (error) {
    console.warn("PRODUCTION failed, retrying with DEV…", error?.message);

    try {
      const devOptions = {
        method,
        url: DEV + url,
        ...axiosConfig,
      };

      if (method.toLowerCase() === "get") {
        if (payload && typeof payload === "object") {
          devOptions.params = payload;
        }
      } else {
        if (payload !== undefined) devOptions.data = payload;
      }

      const retryRes = await axios(devOptions);
      return retryRes;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      return null;
    }
  }
};

/*
  Exported helpers — keep signatures same so you don't break other pages:

  - getService(url, paramsOrConfig)
      * If you pass a plain object as second arg, it's treated as GET params (query).
      * If you pass an axios config object and want to include params/signal etc, pass it as third arg:
          getService("product/get", { page: 1 }, { signal: controller.signal })
      * Backwards compatibility: getService("product/all") still works.

  - postService(url, data, config)
  - putService(url, data, config)
*/

export const getService = async (url, paramsOrConfig, maybeConfig) => {
  // Backwards-compatible behavior:
  // If only two args provided and the second arg contains axios config keys
  // we allow both styles:
  // 1) getService("product/all")
  // 2) getService("product/get", { page: 1 })   // treated as params
  // 3) getService("product/get", { page: 1 }, { signal })
  // 4) getService("product/get", undefined, { signal })  // signal only
  let params = undefined;
  let axiosConfig = {};

  if (maybeConfig) {
    // three-arg style: second is params, third is axios config
    params = paramsOrConfig;
    axiosConfig = maybeConfig;
  } else {
    // two-arg style: we need to decide if paramsOrConfig is params or axios config
    if (!paramsOrConfig) {
      params = undefined;
      axiosConfig = {};
    } else {
      // Heuristic: if it has typical axios config keys treat as axiosConfig, otherwise treat as params
      const configLikeKeys = ["signal", "headers", "timeout", "auth", "params"];
      const looksLikeConfig = Object.keys(paramsOrConfig).some((k) =>
        configLikeKeys.includes(k)
      );
      if (looksLikeConfig) {
        axiosConfig = paramsOrConfig;
        params = paramsOrConfig.params; // if user passed params inside config
      } else {
        // treat as params
        params = paramsOrConfig;
        axiosConfig = {};
      }
    }
  }

  // pass params via payload so requestWithRetry can put them into axios GET params
  return await requestWithRetry("get", url, params, axiosConfig);
};

export const postService = async (url, data, axiosConfig = {}) => {
  // signature unchanged: postService(url, data)
  return await requestWithRetry("post", url, data, axiosConfig);
};

export const putService = async (url, data, axiosConfig = {}) => {
  // signature unchanged: putService(url, data)
  return await requestWithRetry("put", url, data, axiosConfig);
};

import axios from "axios";
import { toast } from "react-toastify";

export const PRODUCTION = "https://server.prempackaging.com/premind/api/";
// export const DEV = "http://15.207.107.52:3000/api/";
export const DEV = "https://server.prempackaging.com/premind/api/";

//https://server.prempackaging.com/premind/api/
//https://server.prempackaging.com/premind/api/

export const getService = async (url, params) => {
  const res = await axios
    .get(PRODUCTION + url, params)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      toast.error(err?.response?.data?.message);
    });
  return res;
};

export const postService = async (url, data) => {
  const res = await axios
    .post(PRODUCTION + url, {
      ...data,
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      toast.error(err?.response?.data?.message);
    });
  return res;
};

export const putService = async (url, data) => {
  const res = await axios
    .put(PRODUCTION + url, {
      ...data,
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      toast.error(err?.response?.data?.message);
    });
  return res;
};

import React, { useEffect, useState } from "react";
import { getService } from "../../services/service";

function Brand({ item, index }) {
  const [images, setImages] = useState();
  const makecall = async (image) => {
    const result = await getService(`getImage?image=${item?.image}`);
    //console.log('Result:', result);
    return result?.data?.data?.url;
  };

  const getIMage = async () => {
    const image = await makecall();
    setImages(image);
  };

  useEffect(() => {
    getIMage();
  }, []);
  return (
    <img
      src={images}
      className="my-2"
      style={{ width: "120px", height: "50px", objectFit: "cover" }}
      key={index}
    />
  );
}

export default Brand;

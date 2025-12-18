import React, { useEffect, useState } from "react";
import styles from "./share.module.css";
import { toast } from "react-toastify";
import { AiFillCloseCircle } from "react-icons/ai";
import {
  FacebookShareButton,
  InstagramShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from "react-share";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";

function ShareModal({ data, handleClose }) {
  const [shareUrl, setShareUrl] = useState("");
  const [title, setTitle] = useState("");

  const handleProduce = () => {
    const productSlug = data?.slug.replace(/\s/g, "%20");
    const url = `https://store.prempackaging.com/${productSlug}`;
    setShareUrl(url);
    setTitle(data?.name);
  };

  useEffect(() => {
    handleProduce();
  }, [data]);

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success("URL copied to clipboard"))
        .catch((error) => console.error("Failed to copy URL: ", error));
    } else {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert("URL copied to clipboard. You can now paste it manually.");
    }
  };

  return (
    <div className={styles.share_main}>
      <div className={styles.modal_inner}>
        <div className={styles.ineera}>
          <span className={styles.heading}>Share this product</span>
          <i onClick={handleClose}>
            <AiFillCloseCircle style={{ color: "#D9D9D9" }} />
          </i>
        </div>
        <div className={styles.linkisss}>
          <FacebookShareButton url={shareUrl} quote={title}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} title={title}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <LinkedinShareButton url={shareUrl} title={title}>
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <WhatsappShareButton url={shareUrl} title={title}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
          <EmailShareButton
            url={shareUrl}
            subject={title}
            body="Check out this product"
          >
            <EmailIcon size={32} round />
          </EmailShareButton>
          <div
            style={{
              border: "1px solid grey",
              borderRadius: "50%",
              padding: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "grey",
              marginBottom:"2px",
              height:"32px",
              width:"32px"
            }}
          >
            <ContentCopyRoundedIcon
              sx={{ color: "white" , fontSize:"17px"}}
              
              onClick={handleCopyUrl}
            />
          </div>
          {/* <button onClick={handleCopyUrl}>Copy URL</button> */}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;

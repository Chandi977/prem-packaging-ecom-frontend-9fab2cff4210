import React from "react";
import styles from "./corrugatedBanner.module.scss";
import Link from "next/link";

function DTLBanner() {
  return (
    <div
      className={"container-fluid p-0 m-0 " + styles.displayimage}
      style={{
        position: "relative",
        // minHeight: "400px",
        // backgroundColor: "black",
      }}
    >
      <div className="w-100 h-100">
        <img
          src="BannerLabel.jpg"
          className={"p-0" + styles.mobileImage}
          style={{
            width: "100%",
            objectFit: "cover",
            background: "#2E436F",
            // opacity: "0.36000001430511475",
            background: "#2E436F",
          }}
        />
      </div>
      <div className={styles.content}>
        <div className="d-flex flex-column justify-content-start">
          <h1 className={styles.corrugatedHeader}>DIRECT THERMAL LABELS</h1>
        </div>
      </div>
    </div>
  );
}

export default DTLBanner;

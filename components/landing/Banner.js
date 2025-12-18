import React from "react";
import styles from "./banner.module.scss";
import Link from "next/link";

function Banner() {
  return (
    <div
      className={"container-fluid p-0 m-0 " + styles.displayimage}
      style={{
        position: "relative",
        minHeight: "450px",
        backgroundColor: "black",
      }}
    >
      <div className="w-100 h-100">
        <img
          src="backgroundslider.png"
          className="p-0 h-100"
          style={{
            width: "100%",
            objectFit: "cover",
            background: "#2E436F",
            opacity: "0.76000001430511475",
            // opacity: "0.36000001430511475",
            background: "#2E436F",
          }}
        />
      </div>
      <div className={styles.content}>
        <div>
          <h1 className={styles.sliderheader}>
            IT’S ALL IN THE
            <br /> PACKAGING
          </h1>
          <p className={styles.slidertext}>
            Your product deserves the best packaging that we offer at <br /> our
            world-class infrastructure.
          </p>
          <Link
            href="https://prempackaging.com/innovation"
            style={{ textDecoration: "none" }}
            target="_blank"
            className="btn"
          >
            <button
              className="btn"
              style={{
                backgroundColor: "#182c5a",
                padding: "12px",
                color: "white",
                fontFamily: "Montserrat",
              }}
            >
              ABOUT OUR INNOVATIVE PACKAGING
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Banner;

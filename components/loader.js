// Loader.js
import React from "react";
import styles from "./loader.module.css";

const Loader = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.loader}></div>
      <div className={styles.heading}>LOADING..</div>
    </div>
  );
};

export default Loader;

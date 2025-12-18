// VerifyOTP.js
import React, { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/router"; // Import useRouter from next/router
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Head from "next/head";
import { PRODUCTION } from "../../services/service";

const EmailVerification = () => {
  const [otp, setOTP] = useState("");
  const router = useRouter();

  // Extract email from query parameters
  const { email_address } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const otpNumber = otp;

      const response = await axios.post(`${PRODUCTION}/verify/email`, {
        otp: otpNumber,
        email_address,
      });

      // Check if the request was successful
      if (response.status === 200) {
        toast.success("Token verified successfully");

        router.push({
          pathname: "/login",
        });
      } else {
        toast.error("Please enter correct Token.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Please enter correct Token.");
    }
  };

  return (
    <>
      <Head>
        <title>
          Email Verification - Prem Industries India Limited - Innovation In
          Action
        </title>
      </Head>
      <div
        className="container-fluid py-5 d-flex justify-content-center align-items-center p-0 m-0 bg-white mt-5"
        style={{ minHeight: "50vh" }}
      >
        <div
          className="row rounded-3 px-3 bg-white mt-5"
          style={{ width: "420px" }}
        >
          <p
            className="p-0 m-0"
            style={{
              color: "#000",
              fontFeatureSettings: "'liga' off",
              fontFamily: "Montserrat",
              fontSize: "40.944px",
              fontStyle: "normal",
              fontWeight: "700",
              lineHeight: "68.852px",
              letterSpacing: "0.819px",
            }}
          >
            Verify Email
          </p>
          <p
            className="p-0"
            style={{
              color: "#000",
              fontFamily: "Montserrat",
              fontSize: "16.378px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "normal",
            }}
          >
            Enter the verification token sent to your registered Email Address{" "}
          </p>
          <form onSubmit={handleSubmit}>
            <label className="p-0 mt-2">OTP</label>
            <div
              className="row p-0 m-0"
              style={{ height: "48px", border: "1px solid #EBEBEB" }}
            >
              <div className="col-12 px-0 d-flex justify-content-start align-items-center">
                <input
                  className="px-1 w-100 h-100 bg-transparent border-0"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                />
              </div>
            </div>

            <div className="row p-0 mx-0 mt-4">
              <button type="submit" className={styles.loginbtn}>
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmailVerification;

import React from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faUser } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useEffect } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { postService } from "../../services/service";
import { useRouter } from "next/router";
import Head from "next/head";

const Loginpage = () => {
  const [widt, setWidt] = useState();
  const [showPassword, setShowPassword] = useState(false);
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
  const router = useRouter();

  const [login, setLogin] = useState({
    email_address: "",
    password: "",
  });

  const handelSignin = async (e) => {
    e.preventDefault();
    const res = await postService("signin", login);
    if (res?.data?.success) {
      localStorage.setItem("PIToken", res.data.data?.Token);
      localStorage.setItem("PIUser", JSON.stringify(res?.data?.data?.user));
      //console.log(res?.data?.data?.user);

      // Use router.push to navigate to the desired location
      router.push("/").then(() => {
        // Reload the page once the navigation is complete
        window.location.reload();
      });
    }
  };
  return (
    <>
      <body className="bg-white" style={{ backgroundColor: "white" }}></body>
      <Head>
        <title>
          Login - Prem Industries India Limited - Innovation In Action
        </title>
      </Head>
      <div
        className="container-fluid bg-white"
        style={{ backgroundColor: "white" }}
      >
        <div className="container" style={{ paddingTop: "200px" }}>
          <div className="row d-flex justify-content-center align-item-center">
            <div className="col-md-12 text-center mb-3 mt-2">
              <h1 style={{ fontSize: "40px", color: "#182C5A" }}>User Login</h1>
            </div>
            <div className="col-md-6">
              <form onSubmit={handelSignin}>
                <div className="mb-3">
                  <label
                    for="exampleInputEmail1"
                    className="form-label"
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                  >
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="row">
                    <div className="col-md-12">
                      <input
                        type="email"
                        required
                        className="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        placeholder="Enter your registered email"
                        value={login.email_address}
                        onChange={(e) =>
                          setLogin({ ...login, email_address: e.target.value })
                        }
                      />
                      <div className="row mt-2">
                        <Link
                          href="/re-verify-email"
                          style={{ color: "#182C5A" }}
                        >
                          <p
                            className="p-0"
                            style={{
                              // textAlign: "end",
                              color: "#1A1B22",
                              // textAlign: "right",
                              fontFamily: "Montserrat",
                              fontSize: "16px",
                              fontStyle: "italic",
                              fontWeight: "400",
                              lineHeight: "normal",
                              textDecoration: "none",
                            }}
                          >
                            Re-verify Email
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    for="exampleInputPassword1"
                    className="form-label"
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                  >
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="row">
                    <div className="col-md-11">
                      <input
                        className="form-control"
                        required
                        id="exampleInputPassword1"
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        value={login.password}
                        onChange={(e) =>
                          setLogin({ ...login, password: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-1">
                      <div
                        style={{
                          cursor: "pointer",
                          marginBottom: "25px",
                        }}
                      >
                        <i
                          style={{
                            position: "absolute",
                            // marginLeft: "-30px",
                            marginTop: "-5px",
                            fontSize: "25px",
                          }}
                        >
                          {showPassword ? (
                            <AiFillEye
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          ) : (
                            <AiFillEyeInvisible
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          )}
                        </i>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <Link href="/forget-password" style={{ color: "#182C5A" }}>
                      <p
                        className="p-0"
                        style={{
                          // textAlign: "end",
                          color: "#182C5A",
                          // textAlign: "right",
                          fontFamily: "Montserrat",
                          fontSize: "16px",
                          fontStyle: "italic",
                          fontWeight: "400",
                          lineHeight: "normal",
                          textDecoration: "none",
                        }}
                      >
                        Forgot Password?
                      </p>
                    </Link>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-12 d-flex justify-content-center">
                    <button
                      type="submit"
                      className="btn btn-lg w-50"
                      style={{ backgroundColor: "#182C5A", color: "white" }}
                    >
                      Login
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <p
                      className="p-0 mt-3 text-center"
                      style={{
                        color: "#182C5A",
                        fontFamily: "Montserrat",
                        fontSize: "16px",
                        // fontStyle: "italic",
                        fontWeight: "400",
                        lineHeight: "normal",
                      }}
                    >
                      Not a member yet?&nbsp;
                      <Link
                        href="/sign-up"
                        style={{
                          color: "#182C5A",
                          fontFamily: "Montserrat",
                          fontSize: "16px",
                          fontStyle: "italic",
                          fontWeight: "400",
                          lineHeight: "normal",
                        }}
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-md-6 text-center mb-3">
              <img src="/loginpageimg.png" alt="..." height={350} width={350} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loginpage;

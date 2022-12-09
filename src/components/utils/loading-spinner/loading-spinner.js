import React from "react";
import "./styles.css";
import logo from "../../../assets/crosspay_loading_1.gif";

export default function LoadingSpinner(props) {
  return (
    <div className="spinner-container">
      <div className="loading-spinner">
        <img src={logo} alt="loading..." />
      </div>
    </div>
  );
}
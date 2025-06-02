import React from 'react'
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const Protect = ({ children }) => {
  const token = Cookies.get("authToken");
  const isTokenValid = token && token !== "undefined" && token.trim() !== "";

  if (!isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protect;
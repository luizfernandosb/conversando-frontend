/* eslint-disable react/prop-types */

import { useAuth } from "../contexts/AuthContext";
import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { isAuthentic } = useAuth();

  if (!isAuthentic) {
    return <Navigate to="/" />;
  }
  return children;
}

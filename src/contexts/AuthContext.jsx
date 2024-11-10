/* eslint-disable react/prop-types */
import React from "react";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthentic, setIsAuthentic] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthentic(!!token);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthentic, setIsAuthentic }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

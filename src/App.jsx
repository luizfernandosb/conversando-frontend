import React from "react";

import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";

export default function App() {
  const { isAuthentic } = useAuth(); 
  return (
    // <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={isAuthentic ? <Chat /> : <Login />} />
          <Route path="/register" element={<Register />}/>
          <Route path="/login" element={<Login />}/>
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    // </AuthProvider>
  );
}

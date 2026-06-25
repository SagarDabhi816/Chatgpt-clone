import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
  let mounted = true;

  axios
    .get("https://chatgpt-clone-1-h5yx.onrender.com/api/auth/me", {
      withCredentials: true,
    })
    .then(() => {
      if (mounted) setChecking(false);
    })
    .catch(() => {
      if (mounted) setChecking(false);
      navigate("/login", { replace: true });
    });

  return () => {
    mounted = false;
  };
}, [navigate]);

  if (checking)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking authentication...
      </div>
    );

  return children;
};

export default RequireAuth;

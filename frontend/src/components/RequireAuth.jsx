import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Quick client-side cookie check: if there's no token cookie, redirect immediately.
    const hasTokenCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith("token="));
    if (!hasTokenCookie) {
      if (mounted) setChecking(false);
      navigate("/login", { replace: true });
      return;
    }

    axios
      .get("https://chatgpt-clone-6ihx.onrender.com/api/chat/", {
        withCredentials: true,
      })
      .then(() => {
        if (mounted) setChecking(false);
      })
      .catch((err) => {
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

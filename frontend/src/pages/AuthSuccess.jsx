import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../api";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Save token to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("casebridge_token", token);

      // 2. Fetch user profile so AuthContext recognizes the session
      authAPI.me()
        .then((res) => {
          const userData = res.data.data;
          localStorage.setItem("casebridge_user", JSON.stringify(userData));

          // 3. Full page reload to re-initialize AuthContext with saved data
          window.location.href = "/dashboard";
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("casebridge_token");
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate("/login"), 2000);
        });
    } else {
      navigate("/login");
    }
  }, []);

  if (error) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>{error}</div>;
  }

  return <div style={{ padding: "2rem", textAlign: "center" }}>Logging you in...</div>;
}

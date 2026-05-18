import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("casebridge_token", token); // Critical fallback safeguard for existing API client requests

      // redirect to dashboard
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Logging in...</div>;
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      console.log("Login response:", response.data);

      /*
        Check your backend response.
        We handle common token names here.
      */
      const accessToken =
        response.data?.accessToken ||
        response.data?.data?.accessToken ||
        response.data?.token ||
        response.data?.data?.token;

      if (!accessToken) {
        setError("Login successful, but access token was not received.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      if (response.data?.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.data.user)
        );
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <Smartphone
              size={32}
              className="text-white"
            />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Ganesh Mobile Shop
          </h1>

          <p className="text-slate-400 mt-2">
            Mobile Shop Management System
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome Back
          </h2>

          <p className="text-slate-400 mb-6">
            Login to your account
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="mb-5">

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
              />

            </div>

            {/* Password */}
            <div className="mb-6">

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2026 Ganesh Mobile Shop
        </p>

      </div>

    </div>
  );
};

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Package,
  FileText,
  MessageCircle,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const features = [
    { icon: Package, label: "Manage Products" },
    { icon: Smartphone, label: "Track Inventory" },
    { icon: FileText, label: "Generate Invoices" },
    { icon: MessageCircle, label: "Send WhatsApp Bills" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const data = response.data;

      const token =
        data?.accessToken ||
        data?.token ||
        data?.data?.accessToken ||
        data?.data?.token;

      const user = data?.user || data?.data?.user || null;

      if (!token) {
        throw new Error(
          "No login token received. Please check your backend response."
        );
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      otherStorage.removeItem("accessToken");
      otherStorage.removeItem("token");
      otherStorage.removeItem("user");

      storage.setItem("accessToken", token);

      if (user) {
        storage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101416] text-white">
      {/* Shared dark background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_15%,rgba(248,201,86,0.12),transparent_35%),radial-gradient(ellipse_at_85%_80%,rgba(248,201,86,0.06),transparent_35%),linear-gradient(135deg,#191a17_0%,#101416_48%,#101416_100%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ================= LEFT BRAND SECTION ================= */}
        <section className="relative flex min-h-[720px] flex-col overflow-hidden px-6 py-7 sm:px-10 lg:min-h-screen lg:px-12 lg:py-8 xl:px-14">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-400/[0.07] blur-[100px]" />
          <div className="pointer-events-none absolute bottom-20 right-10 h-64 w-64 rounded-full bg-amber-400/[0.05] blur-[100px]" />

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 flex items-center gap-4"
          >
            <motion.div
              whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 250 }}
              style={{ transformPerspective: 500 }}
              className="flex h-13 w-13 h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f8c956] text-black shadow-lg shadow-amber-400/20"
            >
              <Store size={29} strokeWidth={2.5} />
            </motion.div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Ganesh Mobile Shop
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Shop Management System
              </p>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative z-20 mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200"
          >
            <span className="h-2 w-2 rounded-full bg-[#f8c956]" />
            Smart Shop Management
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative z-20 mt-12 max-w-[560px] lg:mt-14"
          >
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
              Manage your
              <span className="block text-[#f8c956]">
                mobile shop
              </span>
              smarter.
            </h1>

            <p className="mt-5 max-w-[460px] text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Manage products, inventory, customers, sales, payments,
              and invoices from one powerful dashboard.
            </p>
          </motion.div>

          {/* ================= 3D PHONE ILLUSTRATION ================= */}
          <div className="pointer-events-none absolute bottom-[115px] right-1 z-0 hidden h-[290px] w-[205px] sm:block lg:bottom-[120px] lg:right-3 lg:h-[315px] lg:w-[225px] xl:right-6">
            {/* Rear phone */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotateY: [-8, 2, -8],
                rotateX: [2, 0, 2],
                rotateZ: [-2, -4, -2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformPerspective: 900,
                transformStyle: "preserve-3d",
              }}
              className="absolute bottom-1 left-2 h-[235px] w-[103px] rounded-[25px] border-[5px] border-slate-600 bg-gradient-to-br from-slate-600 via-slate-900 to-black shadow-2xl lg:h-[265px] lg:w-[115px]"
            >
              <div className="absolute inset-[5px] rounded-[18px] bg-gradient-to-br from-[#263445] via-[#10151c] to-black" />
              <div className="absolute left-1/2 top-2 h-3 w-11 -translate-x-1/2 rounded-full bg-black" />
              <div className="absolute left-[-5px] top-16 h-10 w-1 rounded-l bg-slate-500" />
              <div className="absolute bottom-7 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-500/50" />
            </motion.div>

            {/* Front gold phone */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotateY: [7, -3, 7],
                rotateX: [0, 3, 0],
                rotateZ: [3, 1, 3],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              style={{
                transformPerspective: 900,
                transformStyle: "preserve-3d",
              }}
              className="absolute bottom-0 right-1 h-[260px] w-[125px] rounded-[27px] border-[5px] border-[#e5c995] bg-gradient-to-br from-[#f5e5c4] via-[#bca078] to-[#665039] shadow-[0_25px_50px_rgba(0,0,0,0.55)] lg:h-[290px] lg:w-[138px]"
            >
              <div className="absolute inset-[5px] rounded-[20px] bg-gradient-to-br from-[#d7c19b] via-[#a58b65] to-[#493a2a]" />

              {/* Camera module */}
              <div className="absolute left-2 top-2 grid grid-cols-2 gap-1 rounded-2xl border border-black/10 bg-[#c1aa84] p-2">
                <span className="h-6 w-6 rounded-full border-[3px] border-[#292929] bg-black lg:h-7 lg:w-7" />
                <span className="h-6 w-6 rounded-full border-[3px] border-[#292929] bg-black lg:h-7 lg:w-7" />
                <span className="h-6 w-6 rounded-full border-[3px] border-[#292929] bg-black lg:h-7 lg:w-7" />
                <span className="h-3 w-3 self-center rounded-full bg-amber-100" />
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-3xl text-black/70">
                ●
              </div>

              <div className="absolute right-[-5px] top-16 h-12 w-1 rounded-r bg-[#8c7658]" />
            </motion.div>

            <div className="absolute -bottom-2 left-0 right-0 h-12 rounded-full bg-amber-400/20 blur-2xl" />
          </div>

          {/* Feature cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.2,
                },
              },
            }}
            className="relative z-10 mt-8 grid max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2 sm:pr-20 lg:mt-9 lg:pr-24"
          >
            {features.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -3,
                  rotateX: -2,
                  backgroundColor: "rgba(255,255,255,0.09)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{ transformPerspective: 600 }}
                className="flex min-h-[64px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8c956]/15 text-[#f8c956]">
                  <Icon size={19} />
                </div>

                <span className="text-sm font-semibold text-slate-100">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <footer className="relative z-20 mt-auto flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center lg:mt-7">
            <span>© {new Date().getFullYear()} Ganesh Mobile Shop</span>
            <span>Shop Smarter, Grow Faster.</span>
          </footer>
        </section>

        {/* ================= RIGHT LOGIN SECTION ================= */}
        <section className="flex min-h-[600px] items-center justify-center px-5 py-8 sm:px-8 lg:min-h-screen lg:px-8">
          {/* Small 3D entrance + gentle floating animation */}
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              rotateX: 5,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: [0, -4, 0],
              rotateX: [0, 1, 0],
              rotateY: [0, -1, 0],
              scale: 1,
            }}
            transition={{
              opacity: { duration: 0.45 },
              scale: { duration: 0.45 },
              y: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotateX: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotateY: {
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }}
            className="w-full max-w-[410px]"
          >
            {/* Login card */}
            <motion.div
              whileHover={{
                boxShadow: "0 28px 65px rgba(0,0,0,0.30)",
              }}
              transition={{ duration: 0.25 }}
              className="rounded-[22px] border border-slate-200/80 bg-[#fffdfa] px-6 py-7 text-[#111416] shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:px-8 sm:py-8"
            >
              {/* Login icon */}
              <motion.div
                initial={{ scale: 0.9, rotateY: 20 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
                style={{ transformPerspective: 500 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101416] text-[#f8c956] shadow-lg shadow-black/10"
              >
                <LockKeyhole size={24} />
              </motion.div>

              <div className="mt-6">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Welcome Back
                </h2>

                <p className="mt-1.5 text-sm text-slate-500">
                  Login to your account
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold"
                  >
                    Email
                  </label>

                  <div className="group flex h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-[#eaf1ff] px-4 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10">
                    <Mail
                      size={18}
                      className="shrink-0 text-slate-400 group-focus-within:text-amber-600"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-full w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold"
                  >
                    Password
                  </label>

                  <div className="group flex h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-[#eaf1ff] px-4 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10">
                    <LockKeyhole
                      size={18}
                      className="shrink-0 text-slate-400 group-focus-within:text-amber-600"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-full w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="shrink-0 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      className="h-4 w-4 accent-[#101416]"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-slate-500 transition hover:text-amber-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Animated login button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={
                    loading
                      ? {}
                      : {
                          y: -3,
                          scale: 1.015,
                          rotateX: -2,
                          boxShadow: "0 12px 25px rgba(0,0,0,0.22)",
                        }
                  }
                  whileTap={loading ? {} : { scale: 0.97, y: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                  style={{ transformPerspective: 800 }}
                  className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#101416] px-5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#252b2e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Register */}
              <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?
                </p>

                <Link
                  to="/register"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#111416] transition hover:text-amber-700"
                >
                  Create an account
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Security */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} />
                Secure access to your shop
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

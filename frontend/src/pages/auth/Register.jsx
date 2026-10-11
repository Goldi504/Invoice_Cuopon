
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Package,
  FileText,
  Users,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const features = [
    { icon: Package, label: "Manage Products" },
    { icon: Smartphone, label: "Track Inventory" },
    { icon: Users, label: "Manage Customers" },
    { icon: FileText, label: "Generate Invoices" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Keep this endpoint aligned with your backend.
      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101416] text-white">
      {/* Full-page dark background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_15%,rgba(248,201,86,0.12),transparent_35%),radial-gradient(ellipse_at_85%_80%,rgba(248,201,86,0.06),transparent_35%),linear-gradient(135deg,#191a17_0%,#101416_48%,#101416_100%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT BRAND SECTION */}
        <section className="relative flex min-h-[650px] flex-col overflow-hidden px-6 py-6 sm:px-10 lg:min-h-screen lg:px-12 lg:py-7 xl:px-14">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-400/[0.07] blur-[100px]" />

          <div className="pointer-events-none absolute bottom-20 right-10 h-64 w-64 rounded-full bg-amber-400/[0.05] blur-[100px]" />

          {/* Logo and shop name */}
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
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8c956] text-black shadow-lg shadow-amber-400/20 sm:h-14 sm:w-14"
            >
              <Store size={27} strokeWidth={2.5} />
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
            className="relative z-20 mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200"
          >
            <span className="h-2 w-2 rounded-full bg-[#f8c956]" />
            Start Managing Smarter
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative z-20 mt-10 max-w-[550px] lg:mt-12"
          >
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
              Build your
              <span className="block text-[#f8c956]">shop</span>
              smarter.
            </h1>

            <p className="mt-4 max-w-[460px] text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Create your account and manage your mobile shop products,
              inventory, customers and sales easily.
            </p>
          </motion.div>

          {/* Animated 3D phones */}
          <div className="pointer-events-none absolute bottom-[105px] right-1 z-0 hidden h-[270px] w-[190px] sm:block lg:bottom-[115px] lg:right-3 lg:h-[295px] lg:w-[210px] xl:right-6">
            {/* Back phone */}
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
              className="absolute bottom-1 left-2 h-[220px] w-[96px] rounded-[25px] border-[5px] border-slate-600 bg-gradient-to-br from-slate-600 via-slate-900 to-black shadow-2xl lg:h-[250px] lg:w-[108px]"
            >
              <div className="absolute inset-[5px] rounded-[18px] bg-gradient-to-br from-[#263445] via-[#10151c] to-black" />
              <div className="absolute left-1/2 top-2 h-3 w-10 -translate-x-1/2 rounded-full bg-black" />
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
              className="absolute bottom-0 right-1 h-[245px] w-[118px] rounded-[27px] border-[5px] border-[#e5c995] bg-gradient-to-br from-[#f5e5c4] via-[#bca078] to-[#665039] shadow-[0_25px_50px_rgba(0,0,0,0.55)] lg:h-[275px] lg:w-[132px]"
            >
              <div className="absolute inset-[5px] rounded-[20px] bg-gradient-to-br from-[#d7c19b] via-[#a58b65] to-[#493a2a]" />

              <div className="absolute left-2 top-2 grid grid-cols-2 gap-1 rounded-2xl border border-black/10 bg-[#c1aa84] p-2">
                <span className="h-6 w-6 rounded-full border-[3px] border-[#292929] bg-black lg:h-7 lg:w-7" />
                <span className="h-6 w-6 rounded-full border-[3px] border-[#292929] bg-black lg:h-7 lg:w-7" />
                <span className="h-6 w-6 rounded-full border-[3px] border-[#292929] bg-black lg:h-7 lg:w-7" />
                <span className="h-3 w-3 self-center rounded-full bg-amber-100" />
              </div>

              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-3xl text-black/70">
                ●
              </div>
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
            className="relative z-10 mt-7 grid max-w-[550px] grid-cols-1 gap-3 sm:grid-cols-2 sm:pr-20 lg:mt-8 lg:pr-24"
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
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                }}
                style={{ transformPerspective: 600 }}
                className="flex min-h-[60px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3"
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
          <footer className="relative z-20 mt-auto flex flex-col justify-between gap-2 border-t border-white/10 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center lg:mt-6">
            <span>© {new Date().getFullYear()} Ganesh Mobile Shop</span>
            <span>Shop Smarter, Grow Faster.</span>
          </footer>
        </section>

        {/* RIGHT REGISTRATION SECTION */}
        <section className="flex min-h-[580px] items-center justify-center px-4 py-6 sm:px-6 lg:min-h-screen lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              rotateX: 4,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: [0, -3, 0],
              rotateX: [0, 0.6, 0],
              rotateY: [0, -0.6, 0],
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
            className="w-full max-w-[370px]"
          >
            <motion.div
              whileHover={{
                boxShadow: "0 24px 50px rgba(0,0,0,0.28)",
              }}
              transition={{ duration: 0.25 }}
              className="rounded-[20px] border border-slate-200/80 bg-[#fffdfa] px-5 py-5 text-[#111416] shadow-[0_20px_45px_rgba(0,0,0,0.25)] sm:px-6 sm:py-6"
            >
              {/* Register icon */}
              <motion.div
                initial={{ scale: 0.9, rotateY: 20 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{ transformPerspective: 500 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#101416] text-[#f8c956] shadow-lg shadow-black/10"
              >
                <UserRound size={22} />
              </motion.div>

              <div className="mt-4">
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Create Account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create your shop admin account
                </p>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* Success message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                  className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700"
                >
                  {success}
                </motion.div>
              )}

              {/* Registration form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">

                {/* Full name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-bold"
                  >
                    Full Name
                  </label>

                  <div className="group flex h-[43px] items-center gap-3 rounded-xl border border-slate-200 bg-[#eaf1ff] px-3.5 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10">
                    <UserRound
                      size={17}
                      className="shrink-0 text-slate-400 group-focus-within:text-amber-600"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-full w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-bold"
                  >
                    Email
                  </label>

                  <div className="group flex h-[43px] items-center gap-3 rounded-xl border border-slate-200 bg-[#eaf1ff] px-3.5 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10">
                    <Mail
                      size={17}
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
                    className="mb-1.5 block text-sm font-bold"
                  >
                    Password
                  </label>

                  <div className="group flex h-[43px] items-center gap-3 rounded-xl border border-slate-200 bg-[#eaf1ff] px-3.5 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10">
                    <LockKeyhole
                      size={17}
                      className="shrink-0 text-slate-400 group-focus-within:text-amber-600"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
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
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-bold"
                  >
                    Confirm Password
                  </label>

                  <div className="group flex h-[43px] items-center gap-3 rounded-xl border border-slate-200 bg-[#eaf1ff] px-3.5 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/10">
                    <LockKeyhole
                      size={17}
                      className="shrink-0 text-slate-400 group-focus-within:text-amber-600"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-full w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="shrink-0 text-slate-400 transition hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Create account button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={
                    loading
                      ? {}
                      : {
                          y: -2,
                          scale: 1.01,
                          rotateX: -2,
                          boxShadow: "0 10px 22px rgba(0,0,0,0.2)",
                        }
                  }
                  whileTap={loading ? {} : { scale: 0.97, y: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                  style={{ transformPerspective: 800 }}
                  className="mt-1 flex h-[46px] w-full items-center justify-center gap-3 rounded-xl bg-[#101416] px-5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#252b2e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login link */}
              <div className="mt-5 border-t border-slate-100 pt-5 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#111416] transition hover:text-amber-700"
                >
                  Login to your account
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Security note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} />
                Your information is securely stored
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

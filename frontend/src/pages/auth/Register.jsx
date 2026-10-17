
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

      const response = await api.post("/auth/register-admin", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccess(
        response.data?.message ||
          "Account created successfully. Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (err.response?.status === 404
            ? "Registration route not found. Check your backend API URL."
            : err.response?.status === 409
              ? "An account with this email already exists."
              : err.response?.status === 400
                ? "Please check your details and try again."
                : "Unable to create your account. Please check your connection and try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[#101416] text-white lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_5%_10%,rgba(248,201,86,0.20),transparent_35%),radial-gradient(ellipse_at_90%_40%,rgba(56,130,150,0.18),transparent_38%),radial-gradient(ellipse_at_65%_95%,rgba(248,201,86,0.12),transparent_35%),linear-gradient(135deg,#22221d_0%,#101416_48%,#171c1e_100%)]" />

      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-400/[0.08] blur-[100px]" />

      {/* Header */}
      <header className="relative z-20 mx-auto flex h-[76px] max-w-[1600px] items-center gap-3 px-5 sm:px-10 lg:px-12 xl:px-16">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffe69a] via-[#f8c956] to-[#dca72e] text-black shadow-lg shadow-amber-400/20 sm:h-12 sm:w-12">
          <Store size={25} strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">
            Ganesh Mobile Shop
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
            Shop Management System
          </p>
        </div>
      </header>

      {/* Main layout */}
      <div className="relative mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-8 px-5 py-7 sm:px-10 lg:h-[calc(100dvh-76px)] lg:min-h-0 lg:grid-cols-[1.08fr_0.92fr] lg:gap-5 lg:px-10 lg:py-2 xl:gap-8 xl:px-14">
        {/* Left content */}
        <section className="relative z-10 flex min-w-0 flex-col justify-center py-3 lg:h-full lg:min-h-0">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-200/[0.07] px-4 py-2 text-xs text-slate-200 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#f8c956] shadow-[0_0_10px_rgba(248,201,86,0.7)]" />
              Start Managing Smarter
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl xl:text-6xl">
              Build your
              <span className="mt-1 block bg-gradient-to-r from-[#ffe69a] via-[#f8c956] to-[#e6aa35] bg-clip-text pb-1 text-transparent">
                shop
              </span>
              <span className="block">smarter.</span>
            </h1>

            <p className="mt-4 max-w-[460px] text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Create your account and manage your mobile shop products,
              inventory, customers and sales easily.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.07,
                  delayChildren: 0.2,
                },
              },
            }}
            className="mt-6 grid max-w-[500px] grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-5"
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
                  borderColor: "rgba(248,201,86,0.3)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 18,
                }}
                className="flex min-h-[56px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/10 bg-amber-300/10 text-[#f8c956]">
                  <Icon size={18} />
                </div>
                <span className="text-sm font-semibold text-slate-100">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <footer className="mt-6 border-t border-white/10 pt-3 text-xs text-slate-400 lg:mt-5">
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                © {new Date().getFullYear()} Ganesh Mobile Shop
              </span>
              <span>Shop Smarter, Grow Faster.</span>
            </div>
          </footer>
        </section>

        {/* Right content: fixed phone */}
        <section className="relative flex min-w-0 items-center justify-center py-5 lg:h-full lg:min-h-0 lg:overflow-visible">
          {/* Static gold divider */}
          <svg
            aria-hidden="true"
            viewBox="0 0 160 800"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -left-6 top-0 hidden h-full w-[100px] overflow-visible lg:block"
          >
            <path
              d="M5,-30 C145,100 140,220 65,340 C5,450 20,535 95,650 C135,710 145,770 80,830"
              fill="none"
              stroke="#f8c956"
              strokeOpacity="0.12"
              strokeWidth="32"
            />
            <path
              d="M5,-30 C145,100 140,220 65,340 C5,450 20,535 95,650 C135,710 145,770 80,830"
              fill="none"
              stroke="#f8c956"
              strokeOpacity="0.35"
              strokeWidth="2"
            />
          </svg>

          {/* Phone remains stationary */}
          <div className="relative z-10 flex w-full items-center justify-center lg:pl-7">
            <div
              style={{
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }}
              className="relative w-[min(82vw,330px)] sm:w-[330px] lg:w-[285px] lg:scale-[0.84] xl:w-[320px] xl:scale-[0.9] 2xl:scale-100"
            >
              {/* Static glow */}
              <div className="pointer-events-none absolute inset-5 rounded-full bg-amber-400/20 blur-3xl" />

              {/* Phone body */}
              <div className="relative rounded-[43px] border-[5px] border-[#62615b] bg-gradient-to-br from-[#a9a79c] via-[#292e2e] to-[#090d0e] p-[5px] shadow-[0_30px_80px_rgba(0,0,0,0.48)]">
                <div className="pointer-events-none absolute inset-0 rounded-[38px] border border-white/20" />

                <div className="absolute -right-[8px] top-24 h-12 w-[4px] rounded-r-md bg-[#77756b]" />
                <div className="absolute -left-[8px] top-20 h-9 w-[4px] rounded-l-md bg-[#77756b]" />

                {/* Phone screen */}
                <div className="relative overflow-hidden rounded-[33px] bg-[#101719]">
                  <div className="relative flex h-8 items-center justify-between bg-[#1b2426] px-4 text-[9px] text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f8c956]" />
                      Ganesh Shop
                    </span>

                    <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-1 ring-white/10" />

                    <span>9:41</span>
                  </div>

                  <div className="relative bg-gradient-to-b from-[#172123] via-[#11191b] to-[#101416] px-5 pb-4 pt-3">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_50%_0%,rgba(248,201,86,0.16),transparent_70%)]" />

                    {/* Static account icon */}
                    <div className="relative flex h-[75px] flex-col items-center justify-center">
                      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-amber-300/25 bg-gradient-to-br from-[#323b39] to-[#151b1c] text-[#f8c956] shadow-xl">
                        <UserRound size={27} />
                      </div>
                    </div>

                    <div className="relative mt-1">
                      <h2 className="text-center text-2xl font-extrabold tracking-tight text-white">
                        Create Account
                      </h2>

                      <p className="mt-1 text-center text-[11px] text-slate-400">
                        Create your shop admin account
                      </p>

                      {error && (
                        <div
                          role="alert"
                          className="mt-3 break-words rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-[10px] leading-4 text-red-200"
                        >
                          {error}
                        </div>
                      )}

                      {success && (
                        <div
                          role="status"
                          className="mt-3 break-words rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[10px] leading-4 text-emerald-200"
                        >
                          {success}
                        </div>
                      )}

                      <form
                        onSubmit={handleSubmit}
                        className="mt-3 space-y-2.5"
                      >
                        {/* Full name */}
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-1 block text-[11px] font-semibold text-slate-300"
                          >
                            Full Name
                          </label>

                          <div className="group flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 transition focus-within:border-[#f8c956]/80 focus-within:ring-2 focus-within:ring-[#f8c956]/10">
                            <UserRound
                              size={14}
                              className="shrink-0 text-slate-400 group-focus-within:text-[#f8c956]"
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
                              className="h-full w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-1 block text-[11px] font-semibold text-slate-300"
                          >
                            Email
                          </label>

                          <div className="group flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 transition focus-within:border-[#f8c956]/80 focus-within:ring-2 focus-within:ring-[#f8c956]/10">
                            <Mail
                              size={14}
                              className="shrink-0 text-slate-400 group-focus-within:text-[#f8c956]"
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
                              className="h-full w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label
                            htmlFor="password"
                            className="mb-1 block text-[11px] font-semibold text-slate-300"
                          >
                            Password
                          </label>

                          <div className="group flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 transition focus-within:border-[#f8c956]/80 focus-within:ring-2 focus-within:ring-[#f8c956]/10">
                            <LockKeyhole
                              size={14}
                              className="shrink-0 text-slate-400 group-focus-within:text-[#f8c956]"
                            />
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Create password"
                              value={formData.password}
                              onChange={handleChange}
                              minLength={6}
                              required
                              className="h-full w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword((previous) => !previous)
                              }
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              className="shrink-0 text-slate-400 transition hover:text-[#f8c956]"
                            >
                              {showPassword ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="mb-1 block text-[11px] font-semibold text-slate-300"
                          >
                            Confirm Password
                          </label>

                          <div className="group flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 transition focus-within:border-[#f8c956]/80 focus-within:ring-2 focus-within:ring-[#f8c956]/10">
                            <LockKeyhole
                              size={14}
                              className="shrink-0 text-slate-400 group-focus-within:text-[#f8c956]"
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
                              className="h-full w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
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
                              className="shrink-0 text-slate-400 transition hover:text-[#f8c956]"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Create account */}
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={loading ? {} : { y: -2, scale: 1.01 }}
                          whileTap={loading ? {} : { scale: 0.98 }}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffe69a] via-[#f8c956] to-[#dca72e] px-3 text-xs font-extrabold text-[#171914] shadow-lg shadow-amber-900/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {loading ? (
                            <>
                              <LoaderCircle size={15} className="animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight size={15} />
                            </>
                          )}
                        </motion.button>
                      </form>

                      {/* Login link */}
                      <div className="mt-3 border-t border-white/10 pt-3 text-center">
                        <p className="text-[10px] text-slate-400">
                          Already have an account?
                        </p>

                        <Link
                          to="/login"
                          className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#f8c956] transition hover:text-[#ffe69a]"
                        >
                          Login to your account
                          <ArrowRight size={13} />
                        </Link>
                      </div>

                      {/* Security message */}
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        Your information is securely stored
                      </div>
                    </div>
                  </div>

                  {/* Phone navigation */}
                  <div className="flex h-7 items-center justify-center gap-12 bg-[#080b0c]">
                    <span className="h-2.5 w-2.5 rotate-45 border-b-2 border-l-2 border-slate-300" />
                    <span className="h-2.5 w-2.5 rounded-full border border-slate-300" />
                    <span className="h-2.5 w-2.5 rounded-sm border border-slate-300" />
                  </div>
                </div>
              </div>

              {/* Static bottom glow */}
              <div className="pointer-events-none absolute -bottom-5 left-8 right-8 h-7 rounded-full bg-amber-400/20 blur-xl" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const features = [
    "Manage Products",
    "Track Inventory",
    "Manage Customers",
    "Generate Invoices",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       * This endpoint matches your backend route:
       *
       * POST /api/auth/register-admin
       *
       * Use this only if this page is for creating
       * the first/admin account.
       */

      const response = await api.post(
        "/auth/register-admin",
        {
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      console.log("REGISTER RESPONSE:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Registration failed."
        );
      }

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);

    } catch (err) {
      console.error("Register Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shop-cream flex">

      {/* ================= LEFT ================= */}

      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="
          hidden
          lg:flex
          lg:w-[52%]
          bg-shop-black
          text-white
          relative
          overflow-hidden
          px-14
          py-12
          flex-col
          justify-between
        "
      >

        <div
          className="
            absolute
            -top-32
            -left-32
            w-96
            h-96
            rounded-full
            bg-shop-gold/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-40
            right-[-100px]
            w-96
            h-96
            rounded-full
            bg-shop-gold/5
            blur-3xl
          "
        />

        <div className="relative z-10">

          {/* BRAND */}

          <div className="flex items-center gap-4">

            <motion.div
              whileHover={{
                rotate: 8,
                scale: 1.08,
                y: -3,
              }}
              className="
                w-12
                h-12
                rounded-xl
                bg-shop-gold
                text-shop-black
                flex
                items-center
                justify-center
                shadow-lg
              "
            >
              <Store size={25} strokeWidth={2.5} />
            </motion.div>

            <div>
              <h1 className="text-xl font-bold">
                Ganesh Mobile Shop
              </h1>

              <p className="text-sm text-slate-400">
                Shop Management System
              </p>
            </div>

          </div>

          {/* BADGE */}

          <div
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-slate-200
            "
          >
            <span className="h-2 w-2 rounded-full bg-shop-gold" />

            Start Managing Smarter
          </div>

          {/* HERO */}

          <div className="mt-14 max-w-xl">

            <h2
              className="
                text-5xl
                xl:text-6xl
                font-extrabold
                leading-[1.05]
              "
            >
              Build your

              <span className="block text-shop-gold">
                shop
              </span>

              smarter.
            </h2>

            <p
              className="
                mt-7
                max-w-lg
                text-lg
                leading-8
                text-slate-400
              "
            >
              Create your account and manage your
              mobile shop products, inventory,
              customers and sales easily.
            </p>

          </div>

          {/* FEATURES */}

          <div
            className="
              mt-10
              grid
              grid-cols-2
              gap-4
              max-w-2xl
            "
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3 + index * 0.1,
                }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                }}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-4
                  transition
                  hover:border-shop-gold/30
                  hover:bg-white/[0.07]
                "
              >

                <div
                  className="
                    h-8
                    w-8
                    rounded-lg
                    bg-shop-gold/15
                    text-shop-gold
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Check size={17} />
                </div>

                <span className="text-sm text-slate-200">
                  {feature}
                </span>

              </motion.div>
            ))}
          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
            border-t
            border-white/10
            pt-5
            text-sm
            text-slate-500
          "
        >
          <span>© 2026 Ganesh Mobile Shop</span>

          <span>Shop Smarter, Grow Faster</span>
        </div>

      </motion.div>

      {/* ================= RIGHT ================= */}

      <div
        className="
          flex-1
          flex
          items-center
          justify-center
          px-6
          py-10
          bg-shop-cream
        "
      >

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{ duration: 0.6 }}
          className="
            w-full
            max-w-[500px]
            rounded-[24px]
            bg-white
            border
            border-slate-200
            shadow-card
            p-8
            sm:p-10
          "
        >

          {/* ICON */}

          <motion.div
            whileHover={{
              rotate: -5,
              scale: 1.05,
            }}
            className="
              mb-6
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-shop-black
              text-shop-gold
              shadow-lg
            "
          >
            <User size={25} />
          </motion.div>

          {/* TITLE */}

          <h2
            className="
              text-3xl
              font-bold
              text-shop-text
            "
          >
            Create Account
          </h2>

          <p className="mt-2 text-sm text-shop-muted">
            Create your shop admin account
          </p>

          {/* ERROR */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mt-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </motion.div>
          )}

          {/* SUCCESS */}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mt-5
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-600
              "
            >
              {success}
            </motion.div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >

            {/* NAME */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-shop-text
                "
              >
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your name"
                  autoComplete="name"
                  disabled={loading}
                  className="
                    h-13
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-blue-50
                    pl-12
                    pr-4
                    text-sm
                    outline-none
                    transition-all
                    duration-300
                    focus:border-shop-gold
                    focus:bg-white
                    focus:ring-4
                    focus:ring-shop-gold/10
                    disabled:opacity-60
                  "
                />

              </div>
            </div>

            {/* EMAIL */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-shop-text
                "
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  className="
                    h-13
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-blue-50
                    pl-12
                    pr-4
                    text-sm
                    outline-none
                    transition-all
                    duration-300
                    focus:border-shop-gold
                    focus:bg-white
                    focus:ring-4
                    focus:ring-shop-gold/10
                    disabled:opacity-60
                  "
                />

              </div>
            </div>

            {/* PASSWORD */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-shop-text
                "
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Create password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="
                    h-13
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-blue-50
                    pl-12
                    pr-12
                    text-sm
                    outline-none
                    transition-all
                    duration-300
                    focus:border-shop-gold
                    focus:bg-white
                    focus:ring-4
                    focus:ring-shop-gold/10
                    disabled:opacity-60
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-shop-black
                  "
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-shop-text
                "
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="
                    h-13
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-blue-50
                    pl-12
                    pr-12
                    text-sm
                    outline-none
                    transition-all
                    duration-300
                    focus:border-shop-gold
                    focus:bg-white
                    focus:ring-4
                    focus:ring-shop-gold/10
                    disabled:opacity-60
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-shop-black
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>
            </div>

            {/* REGISTER BUTTON */}

            <motion.button
              whileHover={{
                scale: 1.015,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              disabled={loading}
              className="
                group
                relative
                mt-2
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-xl
                bg-shop-black
                text-sm
                font-bold
                text-white
                shadow-soft
                transition-all
                duration-300
                hover:bg-shop-dark
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >

              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  bg-shop-gold/10
                  transition-transform
                  duration-500
                  group-hover:translate-x-0
                "
              />

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="
                      relative
                      z-10
                      animate-spin
                    "
                  />

                  <span className="relative z-10">
                    Creating account...
                  </span>
                </>
              ) : (
                <>
                  <span className="relative z-10">
                    Create Account
                  </span>

                  <ArrowRight
                    size={19}
                    className="
                      relative
                      z-10
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </>
              )}

            </motion.button>

          </form>

          {/* LOGIN LINK */}

          <div
            className="
              mt-6
              border-t
              border-slate-100
              pt-6
              text-center
            "
          >

            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="
                mt-2
                inline-flex
                items-center
                gap-1
                text-sm
                font-bold
                text-shop-black
                transition
                hover:text-shop-gold
              "
            >
              Login to your account
              <ArrowRight size={15} />
            </Link>

          </div>

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-slate-400
            "
          >
            <ShieldCheck size={14} />

            Your information is securely stored
          </div>

        </motion.div>

      </div>
    </div>
  );
}

export default Register;
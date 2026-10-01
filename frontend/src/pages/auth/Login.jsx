import { useState } from "react";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    // API login will be connected here
  };

  const features = [
    "Manage Products",
    "Track Inventory",
    "Generate Invoices",
    "Send WhatsApp Bills",
  ];

  return (
    <div className="min-h-screen bg-shop-cream flex">

      {/* LEFT SECTION */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="
          hidden lg:flex
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

        {/* Glow */}
        <div className="
          absolute
          -top-32
          -left-32
          w-96
          h-96
          rounded-full
          bg-shop-gold/10
          blur-3xl
        " />

        <div className="relative z-10">

          {/* BRAND */}
          <div className="flex items-center gap-4">

            <div className="
              w-12
              h-12
              rounded-xl
              bg-shop-gold
              text-shop-black
              flex
              items-center
              justify-center
            ">
              <Store size={25} strokeWidth={2.5} />
            </div>

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
          <div className="
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
          ">
            <span className="
              h-2
              w-2
              rounded-full
              bg-shop-gold
            />

            Smart Shop Management
          </div>

          {/* HERO */}
          <div className= "mt-14 max-w-xl">

            <h2 className="
              text-5xl
              xl:text-6xl
              font-extrabold
              leading-[1.05]
            ">
              Manage your
              <span className="
                block
                text-shop-gold
              ">
                mobile shop
              </span>
              smarter.
            </h2>

            <p className="
              mt-7
              max-w-lg
              text-lg
              leading-8
              text-slate-400
            ">
              Manage products, inventory, customers, sales,
              payments and invoices from one powerful dashboard.
            </p>

          </div>

          {/* FEATURES */}
          <div className="
            mt-10
            grid
            grid-cols-2
            gap-4
            max-w-2xl
          ">

            {features.map((feature) => (
              <motion.div
                key={feature}
                whileHover={{ y: -4 }}
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
                "
              >
                <div className="
                  h-8
                  w-8
                  rounded-lg
                  bg-shop-gold/15
                  text-shop-gold
                  flex
                  items-center
                  justify-center
                ">
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
        <div className="
          relative
          z-10
          flex
          justify-between
          border-t
          border-white/10
          pt-5
          text-sm
          text-slate-500
        ">
          <span>© 2026 Ganesh Mobile Shop</span>

          <span>
            Shop Smarter, Grow Faster
          </span>
        </div>

      </motion.div>


      {/* RIGHT SECTION */}
      <div className="
        flex-1
        flex
        items-center
        justify-center
        px-6
        py-10
      ">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            w-full
            max-w-[480px]
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
          <div className="
            mb-7
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-shop-black
            text-shop-gold
          ">
            <Lock size={25} />
          </div>

          <h2 className="
            text-3xl
            font-bold
            text-shop-text
          ">
            Welcome Back
          </h2>

          <p className="
            mt-2
            text-sm
            text-shop-muted
          ">
            Login to your account
          </p>

          {/* ERROR */}
          {error && (
            <div className="
              mt-6
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            ">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >

            {/* EMAIL */}
            <div>
              <label className="
                mb-2
                block
                text-sm
                font-semibold
              ">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="
                    h-14
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-blue-50
                    pl-12
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-shop-gold
                    focus:ring-4
                    focus:ring-shop-gold/10
                  "
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div>

              <label className="
                mb-2
                block
                text-sm
                font-semibold
              ">
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="
                    h-14
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-blue-50
                    pl-12
                    pr-12
                    text-sm
                    outline-none
                    transition
                    focus:border-shop-gold
                    focus:ring-4
                    focus:ring-shop-gold/10
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* REMEMBER */}
            <div className="
              flex
              items-center
              justify-between
            ">

              <label className="
                flex
                items-center
                gap-2
                text-sm
                text-slate-600
              ">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="
                    h-4
                    w-4
                    accent-shop-gold
                  "
                />

                Remember me

              </label>

              <button
                type="button"
                className="
                  text-sm
                  font-medium
                  text-slate-500
                  hover:text-shop-black
                "
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN BUTTON */}
            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              className="
                group
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-shop-black
                text-sm
                font-bold
                text-white
                shadow-soft
                transition
                hover:bg-shop-dark
              "
            >

              Login

              <ArrowRight
                size={19}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />

            </motion.button>

          </form>

          {/* BOTTOM */}
          <div className="
            mt-7
            border-t
            border-slate-100
            pt-6
            text-center
            text-xs
            text-slate-400
          ">
            Secure access to your shop management system
          </div>

        </motion.div>

      </div>

    </div>
  );
}

export default Login;
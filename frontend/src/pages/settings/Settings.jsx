
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Store,
  UserRound,
  ReceiptText,
  Bell,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Mail,
  Phone,
  MapPin,
  FileText,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

const initialSettings = {
  shopName: "Ganesh Mobile Shop",
  phone: "",
  email: "admin@gmail.com",
  address: "Bhopal, Madhya Pradesh",
  currency: "INR",
  invoicePrefix: "INV-",
  taxRate: "0",
  warranty: "As per manufacturer warranty.",
  invoiceNote: "Thank you for shopping with us!",
  lowStockAlerts: true,
  paymentAlerts: true,
  saleAlerts: true,
};

const sections = [
  { id: "shop", label: "Shop Profile", icon: Store },
  { id: "business", label: "Business", icon: IndianRupee },
  { id: "invoice", label: "Invoice", icon: ReceiptText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function Field({ label, icon: Icon, ...props }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={props.id}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        <input
          {...props}
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 ${
            Icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

function Toggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeSection, setActiveSection] = useState("shop");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (name, value) => {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
    setNotice("");
    setError("");
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setNotice("");
    setError("");
  };

  const saveSettings = async () => {
    setSaving(true);
    setNotice("");
    setError("");

    try {
      /*
       * Connect this to your actual settings endpoint when available.
       * No settings endpoint has been confirmed yet.
       */
      const response = await api.get("/settings");

      if (response.data) {
        setError(
          "Settings data loaded, but the save endpoint and accepted fields need to be confirmed before saving."
        );
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "The settings API endpoint is not available yet. Your changes are currently only in this page."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Could not connect to the settings API. Your changes have not been saved."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const sectionTitle =
    sections.find((section) => section.id === activeSection)?.label ||
    "Settings";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-gray-900">
      <Sidebar />

      <main className="min-h-screen min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-[250px] lg:p-8">
        <div className="mx-auto w-full max-w-[1400px]">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              

              <h1 className="text-2xl font-bold sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage your shop profile and preferences.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:border-gray-400"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4c64e] px-5 py-3 text-sm font-bold text-gray-900 transition hover:bg-[#e9b933] disabled:opacity-60"
              >
                <Save size={17} />
                {saving ? "Checking..." : "Save Changes"}
              </button>
            </div>
          </motion.header>

          {/* Status messages */}
          {notice && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              {notice}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">

            {/* Settings navigation */}
            <aside className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <p className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                General Settings
              </p>

              <nav className="flex gap-2 overflow-x-auto lg:flex-col">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const active = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        active
                          ? "bg-[#f4c64e] font-semibold text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Settings content */}
            <motion.section
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold">{sectionTitle}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your {sectionTitle.toLowerCase()} preferences.
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-6">

                {activeSection === "shop" && (
                  <>
                    <div className="flex items-center gap-4 rounded-xl bg-amber-50 p-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f4c64e] text-gray-900">
                        <Store size={27} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold">{settings.shopName}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Shop profile and contact information
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field
                        id="shopName"
                        label="Shop Name"
                        icon={Store}
                        value={settings.shopName}
                        onChange={(e) => updateField("shopName", e.target.value)}
                      />

                      <Field
                        id="shopPhone"
                        label="Phone Number"
                        icon={Phone}
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="Enter shop phone number"
                      />

                      <Field
                        id="shopEmail"
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />

                      <Field
                        id="shopAddress"
                        label="Shop Address"
                        icon={MapPin}
                        value={settings.address}
                        onChange={(e) => updateField("address", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {activeSection === "business" && (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="currency" className="mb-2 block text-sm font-semibold text-gray-700">
                        Currency
                      </label>
                      <select
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => updateField("currency", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#d4af37]"
                      >
                        <option value="INR">INR - Indian Rupee (₹)</option>
                        <option value="USD">USD - US Dollar ($)</option>
                      </select>
                    </div>

                    <Field
                      id="invoicePrefix"
                      label="Invoice Prefix"
                      icon={FileText}
                      value={settings.invoicePrefix}
                      onChange={(e) => updateField("invoicePrefix", e.target.value)}
                    />

                    <Field
                      id="taxRate"
                      label="Tax Rate (%)"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.taxRate}
                      onChange={(e) => updateField("taxRate", e.target.value)}
                    />

                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-gray-800">
                        Business preferences
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        These values currently remain in page state until
                        a settings save API is connected.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "invoice" && (
                  <div className="space-y-5">
                    <Field
                      id="invoicePrefixField"
                      label="Invoice Prefix"
                      icon={FileText}
                      value={settings.invoicePrefix}
                      onChange={(e) => updateField("invoicePrefix", e.target.value)}
                    />

                    <div>
                      <label htmlFor="warranty" className="mb-2 block text-sm font-semibold text-gray-700">
                        Warranty Information
                      </label>
                      <textarea
                        id="warranty"
                        rows={3}
                        value={settings.warranty}
                        onChange={(e) => updateField("warranty", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label htmlFor="invoiceNote" className="mb-2 block text-sm font-semibold text-gray-700">
                        Default Invoice Note
                      </label>
                      <textarea
                        id="invoiceNote"
                        rows={3}
                        value={settings.invoiceNote}
                        onChange={(e) => updateField("invoiceNote", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Preview
                      </p>
                      <p className="font-bold">{settings.shopName}</p>
                      <p className="mt-2 text-sm text-gray-600">{settings.warranty}</p>
                      <p className="mt-2 text-sm text-gray-600">{settings.invoiceNote}</p>
                    </div>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="divide-y divide-gray-100">
                    <Toggle
                      title="Low Stock Alerts"
                      description="Get notified when product stock is running low."
                      checked={settings.lowStockAlerts}
                      onChange={(value) => updateField("lowStockAlerts", value)}
                    />

                    <Toggle
                      title="Payment Notifications"
                      description="Show notifications for payment activity."
                      checked={settings.paymentAlerts}
                      onChange={(value) => updateField("paymentAlerts", value)}
                    />

                    <Toggle
                      title="Sales Notifications"
                      description="Show notifications when a sale is recorded."
                      checked={settings.saleAlerts}
                      onChange={(value) => updateField("saleAlerts", value)}
                    />
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <ShieldCheck size={22} className="mt-0.5 shrink-0 text-blue-700" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Account security
                        </p>
                        <p className="mt-1 text-xs leading-5 text-blue-800">
                          Password changes must be connected to your existing
                          authentication backend before they can be saved.
                        </p>
                      </div>
                    </div>

                    <Field
                      id="adminEmail"
                      label="Admin Email"
                      icon={UserRound}
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />

                    <div>
                      <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password change is not connected yet"
                          disabled
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          aria-label="Toggle password visibility"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      No password is changed or sent by this page.
                    </p>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-gray-500">
                  Changes are local until backend saving is implemented.
                </p>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4c64e] px-5 py-3 text-sm font-bold text-gray-900 transition hover:bg-[#e9b933] disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Checking..." : "Save Changes"}
                </button>
              </div>
            </motion.section>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Ganesh Mobile Shop · Settings
          </p>
        </div>
      </main>
    </div>
  );
}

export default Settings;

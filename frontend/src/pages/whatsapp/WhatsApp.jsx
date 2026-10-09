import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  Send,
  Smartphone,
  FileText,
  UserRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Paperclip,
  Store,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

const DEFAULT_MESSAGE = "Thank you for shopping with us!";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getList = (data, keys) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
};

const getCustomerName = (customer) =>
  customer?.name ||
  customer?.fullName ||
  customer?.customerName ||
  "Customer";

const getCustomerPhone = (customer) =>
  customer?.mobileNumber ||
  customer?.phone ||
  customer?.phoneNumber ||
  customer?.mobile ||
  "";

const getCustomerId = (customer) =>
  customer?._id || customer?.id || "";

const getInvoiceNumber = (invoice) =>
  invoice?.invoiceNumber ||
  invoice?.invoiceNo ||
  invoice?.sale?.invoiceNumber ||
  invoice?.number ||
  "";

const getInvoiceId = (invoice) =>
  invoice?._id || invoice?.id || "";

const getInvoiceTotal = (invoice) =>
  invoice?.totalAmount ??
  invoice?.grandTotal ??
  invoice?.total ??
  invoice?.sale?.totalAmount ??
  invoice?.sale?.grandTotal ??
  invoice?.amount ??
  0;

const getInvoiceCustomerId = (invoice) => {
  const customer =
    invoice?.customer ||
    invoice?.sale?.customer ||
    invoice?.sale?.customerId;

  return typeof customer === "object"
    ? getCustomerId(customer)
    : customer || "";
};

function StatCard({ title, value, icon: Icon, tone, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${tone}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </motion.div>
  );
}

function WhatsApp() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const [customerResponse, invoiceResponse] =
        await Promise.all([
          api.get("/customers"),
          api.get("/invoices"),
        ]);

      const customerList = getList(customerResponse.data, [
        "customers",
        "data",
        "results",
      ]);

      const invoiceList = getList(invoiceResponse.data, [
        "invoices",
        "data",
        "results",
      ]);

      setCustomers(customerList);
      setInvoices(invoiceList);

      setCustomerId((current) =>
        customerList.some(
          (item) => getCustomerId(item) === current
        )
          ? current
          : getCustomerId(customerList[0]) || ""
      );

      setInvoiceId((current) =>
        invoiceList.some(
          (item) => getInvoiceId(item) === current
        )
          ? current
          : getInvoiceId(invoiceList[0]) || ""
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customers and invoices. Check the API routes and server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) => getCustomerId(customer) === customerId
      ) || null,
    [customers, customerId]
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        getInvoiceNumber(invoice).toLowerCase().includes(query);

      const linkedCustomerId = getInvoiceCustomerId(invoice);

      const matchesCustomer =
        !customerId ||
        !linkedCustomerId ||
        linkedCustomerId === customerId;

      return matchesSearch && matchesCustomer;
    });
  }, [invoices, search, customerId]);

  const selectedInvoice = useMemo(
    () =>
      invoices.find(
        (invoice) => getInvoiceId(invoice) === invoiceId
      ) || null,
    [invoices, invoiceId]
  );

  const previewText = useMemo(() => {
    const name = getCustomerName(selectedCustomer);
    const invoiceNumber = selectedInvoice
      ? getInvoiceNumber(selectedInvoice) || "Invoice"
      : "your invoice";

    const amount = selectedInvoice
      ? formatMoney(getInvoiceTotal(selectedInvoice))
      : "Select an invoice";

    return `Hello ${name},

Here is your invoice ${invoiceNumber}

Total Amount: ${amount}

${message.trim() || DEFAULT_MESSAGE}

Ganesh Mobile Shop
Bhopal, Madhya Pradesh`;
  }, [selectedCustomer, selectedInvoice, message]);

  const handleCustomerChange = (value) => {
    setCustomerId(value);
    setError("");
    setNotice("");

    const firstMatchingInvoice = invoices.find((invoice) => {
      const linkedCustomerId = getInvoiceCustomerId(invoice);

      return (
        !linkedCustomerId ||
        linkedCustomerId === value
      );
    });

    setInvoiceId(
      firstMatchingInvoice
        ? getInvoiceId(firstMatchingInvoice)
        : ""
    );
  };

  const handleSend = () => {
    setError("");
    setNotice("");

    if (!selectedCustomer) {
      setError("Please select a customer first.");
      return;
    }

    if (!selectedInvoice) {
      setError("Please select an invoice first.");
      return;
    }

    const rawPhone = String(
      getCustomerPhone(selectedCustomer)
    );

    const phone = rawPhone.replace(/\D/g, "");

    if (!phone) {
      setError("This customer does not have a phone number.");
      return;
    }

    const internationalPhone =
      phone.length === 10 ? `91${phone}` : phone;

    if (internationalPhone.length < 11) {
      setError("Please check the customer's phone number.");
      return;
    }

    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(
      previewText
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");

    setNotice(
      "WhatsApp opened with your prefilled message. Review it and press Send in WhatsApp."
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f7f8] text-gray-900">
      {/* Keep the existing sidebar unchanged. */}
      <Sidebar />

      {/* Page-specific layout correction */}
      <main className="min-h-screen min-w-0 w-full md:ml-[272px] md:w-[calc(100%-272px)]">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">

          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-xl bg-green-100 p-2.5 text-green-700">
                  <MessageCircle size={22} />
                </span>
                <span className="text-sm font-semibold text-green-700">
                  Customer communication
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Send Invoice via WhatsApp
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Send invoice details directly to your customer.
              </p>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:border-[#d4af37] disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh data
            </motion.button>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="break-words">{error}</p>
              </motion.div>
            )}

            {notice && (
              <motion.div
                key="notice"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />
                <p className="break-words">{notice}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Customers"
              value={customers.length}
              icon={UserRound}
              tone="bg-blue-50 text-blue-700"
              index={0}
            />

            <StatCard
              title="Available Invoices"
              value={invoices.length}
              icon={FileText}
              tone="bg-amber-50 text-amber-700"
              index={1}
            />

            <StatCard
              title="Matching Invoices"
              value={filteredInvoices.length}
              icon={MessageCircle}
              tone="bg-green-50 text-green-700"
              index={2}
            />
          </div>

          {/* Form and preview */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 2xl:grid-cols-2">

            {/* Left: invoice form */}
            <motion.section
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="min-w-0 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold">
                  Invoice details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a customer and invoice to share.
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-6">

                {/* Customer */}
                <div>
                  <label
                    htmlFor="whatsapp-customer"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Customer
                  </label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      id="whatsapp-customer"
                      value={customerId}
                      onChange={(event) =>
                        handleCustomerChange(event.target.value)
                      }
                      disabled={loading || customers.length === 0}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 disabled:bg-gray-50"
                    >
                      <option value="">
                        {loading
                          ? "Loading customers..."
                          : "Select a customer"}
                      </option>

                      {customers.map((customer) => (
                        <option
                          key={getCustomerId(customer)}
                          value={getCustomerId(customer)}
                        >
                          {getCustomerName(customer)}
                          {getCustomerPhone(customer)
                            ? ` - ${getCustomerPhone(customer)}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {selectedCustomer && (
                    <div className="mt-3 flex min-w-0 items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7e6b0] font-bold text-gray-800">
                        {getCustomerName(selectedCustomer)
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {getCustomerName(selectedCustomer)}
                        </p>
                        <p className="mt-0.5 break-words text-xs text-gray-500">
                          {getCustomerPhone(selectedCustomer) ||
                            "No phone number available"}
                        </p>
                      </div>

                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-green-600"
                      />
                    </div>
                  )}
                </div>

                {/* Invoice */}
                <div>
                  <label
                    htmlFor="whatsapp-invoice-search"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Invoice
                  </label>

                  <div className="relative mb-3">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="whatsapp-invoice-search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search invoice number..."
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10"
                    />
                  </div>

                  <div className="relative">
                    <FileText
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      value={invoiceId}
                      onChange={(event) => {
                        setInvoiceId(event.target.value);
                        setError("");
                        setNotice("");
                      }}
                      disabled={loading || filteredInvoices.length === 0}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 disabled:bg-gray-50"
                    >
                      <option value="">
                        {loading
                          ? "Loading invoices..."
                          : filteredInvoices.length
                            ? "Select an invoice"
                            : "No matching invoices"}
                      </option>

                      {filteredInvoices.map((invoice) => (
                        <option
                          key={getInvoiceId(invoice)}
                          value={getInvoiceId(invoice)}
                        >
                          {getInvoiceNumber(invoice) || "Invoice"} —{" "}
                          {formatMoney(getInvoiceTotal(invoice))}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {selectedInvoice && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f1dfad] bg-[#fffaf0] p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500">
                          Selected invoice
                        </p>
                        <p className="mt-1 break-words text-sm font-bold">
                          {getInvoiceNumber(selectedInvoice) || "Invoice"}
                        </p>
                      </div>

                      <div className="min-w-0 text-left sm:text-right">
                        <p className="text-xs text-gray-500">
                          Total amount
                        </p>
                        <p className="mt-1 break-words text-sm font-bold">
                          {formatMoney(getInvoiceTotal(selectedInvoice))}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="whatsapp-message"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Message (Optional)
                    </label>

                    <button
                      type="button"
                      onClick={() => setMessage(DEFAULT_MESSAGE)}
                      className="text-xs font-semibold text-gray-500 transition hover:text-gray-900"
                    >
                      Reset message
                    </button>
                  </div>

                  <textarea
                    id="whatsapp-message"
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="Write a short message for your customer..."
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {message.length}/500 characters
                  </p>
                </div>

                {/* Send button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#16a34a] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/15 transition hover:bg-[#128c3e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageCircle size={21} />
                  Send via WhatsApp
                  <ExternalLink size={16} />
                </motion.button>

                <p className="text-center text-xs leading-5 text-gray-400">
                  WhatsApp opens in a new tab. Review and send the
                  message from WhatsApp.
                </p>
              </div>
            </motion.section>

            {/* Right: live preview */}
            <motion.section
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="min-w-0 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold">
                    Message preview
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Preview your message before sending.
                  </p>
                </div>

                <span className="shrink-0 rounded-xl bg-green-50 p-3 text-green-700">
                  <Smartphone size={21} />
                </span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[28px] border-[5px] border-[#252525] bg-[#efe8dd] shadow-xl">

                  {/* Phone header */}
                  <div className="flex items-center gap-3 bg-[#075e54] px-3 py-4 text-white sm:px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5dfa2] text-gray-900">
                      <Store size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        Ganesh Mobile Shop
                      </p>
                      <p className="mt-0.5 text-xs text-white/75">
                        Business Account
                      </p>
                    </div>

                    <MessageCircle size={20} className="shrink-0" />
                  </div>

                  {/* Chat background */}
                  <div
                    className="min-h-[350px] p-3 sm:min-h-[420px] sm:p-4"
                    style={{
                      backgroundColor: "#efe8dd",
                      backgroundImage:
                        "radial-gradient(rgba(110,100,80,0.08) 1px, transparent 1px)",
                      backgroundSize: "17px 17px",
                    }}
                  >
                    <div className="mb-4 text-center">
                      <span className="rounded-lg bg-[#e2d9cb] px-3 py-1.5 text-[10px] font-medium text-gray-600">
                        TODAY
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${customerId}-${invoiceId}-${message}`}
                        initial={{
                          opacity: 0,
                          y: 8,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="ml-auto max-w-[96%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] p-3 shadow-sm sm:p-4"
                      >
                        <p className="mb-3 text-[11px] font-bold text-[#075e54]">
                          Ganesh Mobile Shop
                        </p>

                        <p className="whitespace-pre-wrap break-words text-[12px] leading-[1.75] text-gray-800 sm:text-[13px]">
                          {previewText}
                        </p>

                        <div className="mt-3 flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-gray-500">
                            {new Date().toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <CheckCircle2
                            size={13}
                            className="text-blue-500"
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-5 flex items-center justify-center gap-2 rounded-full bg-white/80 px-3 py-2 text-center text-[10px] text-gray-500 shadow-sm sm:text-[11px]">
                      <Paperclip size={13} className="shrink-0" />
                      Invoice details shown in message
                    </div>
                  </div>

                  {/* Chat input preview */}
                  <div className="flex items-center gap-2 bg-[#f7f7f7] p-2 sm:p-3">
                    <div className="min-w-0 flex-1 rounded-full bg-white px-3 py-3 text-xs text-gray-400 sm:px-4">
                      Type a message
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-white">
                      <Send size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-green-700"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-green-900">
                      Live message preview
                    </p>
                    <p className="mt-1 text-xs leading-5 text-green-800/80">
                      Changing the customer, invoice, or message
                      automatically updates the preview.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Ganesh Mobile Shop · Shop Smarter, Grow Faster
          </p>
        </div>
      </main>
    </div>
  );
}

export default WhatsApp;
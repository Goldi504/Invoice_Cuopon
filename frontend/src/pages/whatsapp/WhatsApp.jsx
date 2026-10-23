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

const PAGE_BG = "#F4F0E6";
const CARD_BG = "#FFFEFA";
const BORDER_COLOR = "#E6D9BD";
const TEXT_COLOR = "#171914";
const MUTED_COLOR = "#746D5E";
const GOLD_COLOR = "#E9B83F";

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

const getCustomerId = (customer) =>
  String(customer?._id || customer?.id || "");

const getCustomerName = (customer) =>
  customer?.name ||
  customer?.fullName ||
  customer?.customerName ||
  "Customer";

const getCustomerPhone = (customer) =>
  customer?.mobile ||
  customer?.mobileNumber ||
  customer?.phone ||
  customer?.phoneNumber ||
  "";

const getInvoiceId = (invoice) =>
  String(invoice?._id || invoice?.id || "");

const getInvoiceNumber = (invoice) =>
  invoice?.invoiceNumber ||
  invoice?.invoiceNo ||
  invoice?.number ||
  "";

const getInvoiceTotal = (invoice) =>
  invoice?.totalAmount ??
  invoice?.grandTotal ??
  invoice?.total ??
  invoice?.amount ??
  0;

const getInvoiceDate = (invoice) => {
  const date = invoice?.invoiceDate || invoice?.createdAt;

  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getProductDetails = (invoice) =>
  invoice?.productDetails || {};

const getInvoiceCustomer = (invoice, selectedCustomer) => {
  if (
    invoice?.customerDetails &&
    typeof invoice.customerDetails === "object"
  ) {
    return invoice.customerDetails;
  }

  if (
    invoice?.customerId &&
    typeof invoice.customerId === "object"
  ) {
    return invoice.customerId;
  }

  return selectedCustomer || {};
};

const getInvoiceCustomerId = (invoice) => {
  const customer = invoice?.customerId;

  if (customer && typeof customer === "object") {
    return String(customer._id || customer.id || "");
  }

  return String(customer || "");
};

const addMessageLine = (label, value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  return `${label}: ${String(value).trim()}`;
};

function StatCard({ title, value, icon: Icon, tone, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 24px rgba(184,134,11,0.10)",
      }}
      className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm transition-colors sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#746D5E]">
          {title}
        </p>

        <div className={`rounded-xl p-2.5 ${tone}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-[#171914]">
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
          : getCustomerId(customerList[0])
      );

      setInvoiceId((current) =>
        invoiceList.some(
          (item) => getInvoiceId(item) === current
        )
          ? current
          : getInvoiceId(invoiceList[0])
      );
    } catch (err) {
      console.error("WhatsApp page data error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers and invoices. Check your API routes and server."
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

  const selectedInvoice = useMemo(
    () =>
      invoices.find(
        (invoice) => getInvoiceId(invoice) === invoiceId
      ) || null,
    [invoices, invoiceId]
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceNumber =
        getInvoiceNumber(invoice).toLowerCase();

      const matchesSearch =
        !query || invoiceNumber.includes(query);

      const linkedCustomerId = getInvoiceCustomerId(invoice);

      const matchesCustomer =
        !customerId ||
        !linkedCustomerId ||
        linkedCustomerId === String(customerId);

      return matchesSearch && matchesCustomer;
    });
  }, [invoices, search, customerId]);  // ================================================
  // SELECT CUSTOMER
  // ================================================

  const handleCustomerChange = (event) => {
    const nextCustomerId = event.target.value;

    setCustomerId(nextCustomerId);
    setInvoiceId("");
    setSearch("");
    setNotice("");
    setError("");
  };

  // ================================================
  // SELECT INVOICE
  // ================================================

  const handleInvoiceChange = (event) => {
    setInvoiceId(event.target.value);
    setNotice("");
    setError("");
  };

  // ================================================
  // GENERATE INVOICE MESSAGE
  // ================================================

  const generatedMessage = useMemo(() => {
    if (!selectedInvoice) {
      return message.trim();
    }

    const invoiceCustomer = getInvoiceCustomer(
      selectedInvoice,
      selectedCustomer
    );

    const invoiceNumber =
      getInvoiceNumber(selectedInvoice) || "N/A";

    const invoiceDate =
      getInvoiceDate(selectedInvoice) || "N/A";

    const invoiceTotal = formatMoney(
      getInvoiceTotal(selectedInvoice)
    );

    const product = getProductDetails(selectedInvoice);

    const productName =
      product?.productName ||
      product?.model ||
      selectedInvoice?.productName ||
      selectedInvoice?.product?.model ||
      selectedInvoice?.product?.name ||
      "";

    const imei =
      product?.imei ||
      selectedInvoice?.imei ||
      selectedInvoice?.serialNumber ||
      "";

    const lines = [
      "Hello " +
        getCustomerName(invoiceCustomer) +
        ",",
      "",
      "Thank you for shopping with Ganesh Mobile Shop!",
      "",
      "Here are your invoice details:",
      "",
      addMessageLine("Invoice Number", invoiceNumber),
      addMessageLine("Invoice Date", invoiceDate),
      addMessageLine("Product", productName),
      addMessageLine("IMEI / Serial Number", imei),
      addMessageLine("Total Amount", invoiceTotal),
      "",
      message.trim() || DEFAULT_MESSAGE,
    ];

    return lines.filter((line) => line !== "").join("\n");
  }, [selectedInvoice, selectedCustomer, message]);

  // ================================================
  // VALIDATE WHATSAPP NUMBER
  // ================================================

  const getWhatsAppNumber = () => {
    const phone = getCustomerPhone(selectedCustomer);

    if (!phone) {
      setError(
        "This customer does not have a registered mobile number."
      );
      return null;
    }

    let number = String(phone).replace(/\D/g, "");

    // Convert a standard Indian 10-digit number to country code format.
    if (number.length === 10) {
      number = `91${number}`;
    } else if (
      number.length === 11 &&
      number.startsWith("0")
    ) {
      number = `91${number.slice(1)}`;
    }

    if (number.length < 11 || number.length > 15) {
      setError(
        "The customer's mobile number is invalid. Please check the saved number."
      );
      return null;
    }

    return number;
  };

  // ================================================
  // OPEN WHATSAPP WITH MESSAGE
  // ================================================

  const handleSendWhatsApp = () => {
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

    const number = getWhatsAppNumber();

    if (!number) return;

    const text = encodeURIComponent(generatedMessage);

    const whatsappUrl =
      `https://wa.me/${number}?text=${text}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setNotice(
      "WhatsApp opened with the invoice message. Review it and press Send in WhatsApp."
    );
  };

  // ================================================
  // COPY MESSAGE
  // ================================================

  const handleCopyMessage = async () => {
    setError("");
    setNotice("");

    if (!selectedCustomer || !selectedInvoice) {
      setError(
        "Select a customer and invoice before copying the message."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedMessage
      );

      setNotice("Invoice message copied successfully.");
    } catch (err) {
      console.error("Copy message error:", err);

      setError(
        "Unable to copy automatically. Please select and copy the message manually."
      );
    }
  };

  // ================================================
  // PAGE COUNTS
  // ================================================

  const matchingInvoiceCount = filteredInvoices.length;

  const selectedPhone = selectedCustomer
    ? getCustomerPhone(selectedCustomer)
    : "";

  const selectedInvoiceCustomer = selectedInvoice
    ? getInvoiceCustomer(
        selectedInvoice,
        selectedCustomer
      )
    : null;
      // ================================================
  // PAGE UI
  // ================================================

  return (
    <div
      className="min-h-screen w-full text-[#171914]"
      style={{ backgroundColor: PAGE_BG }}
    >
      <Sidebar />

      <main
        className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[250px] lg:px-8"
        style={{ backgroundColor: PAGE_BG }}
      >
        <motion.div
          variants={pageAnimation}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[1600px] space-y-6"
        >
          {/* PAGE HEADER */}

          <motion.header
            variants={itemAnimation}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                <div className="rounded-xl bg-green-100 p-2">
                  <MessageCircle size={19} />
                </div>

                Customer Communication
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#171914] sm:text-3xl">
                Send Invoice via WhatsApp
              </h1>

              <p className="mt-2 text-sm text-[#746D5E] sm:text-base">
                Send invoice details directly to your customer.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={loadData}
              disabled={loading}
              whileHover={{
                y: -3,
                scale: 1.02,
              }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] px-4 py-3 text-sm font-semibold text-[#171914] shadow-sm transition hover:bg-[#FFF6D9] disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh data
            </motion.button>
          </motion.header>

          {/* ERROR AND SUCCESS MESSAGES */}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span className="flex-1">{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="font-bold"
                >
                  ×
                </button>
              </motion.div>
            )}

            {!error && notice && (
              <motion.div
                key="notice"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span className="flex-1">{notice}</span>

                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss notice"
                  className="font-bold"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUMMARY CARDS */}

          <motion.div
            variants={pageAnimation}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <StatCard
              title="Total Customers"
              value={customers.length}
              icon={UserRound}
              tone="bg-blue-50 text-blue-600"
              index={0}
            />

            <StatCard
              title="Available Invoices"
              value={invoices.length}
              icon={FileText}
              tone="bg-[#FFF6D9] text-[#9B7613]"
              index={1}
            />

            <StatCard
              title="Matching Invoices"
              value={matchingInvoiceCount}
              icon={MessageCircle}
              tone="bg-green-50 text-green-700"
              index={2}
            />
          </motion.div>

          {/* MAIN FORM CARD */}

          <motion.section
            variants={itemAnimation}
            whileHover={{
              boxShadow:
                "0 14px 32px rgba(184,134,11,0.06)",
            }}
            transition={spring}
            className="overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-sm"
          >
            {/* CARD HEADER */}

            <div className="border-b border-[#EEE5D2] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#171914]">
                Invoice details
              </h2>

              <p className="mt-1 text-sm text-[#746D5E]">
                Choose a customer and invoice to share.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* CUSTOMER SELECTOR */}

              <section>
                <label
                  htmlFor="whatsapp-customer"
                  className="mb-2 block text-sm font-semibold text-[#171914]"
                >
                  Customer
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#948A76]"
                  />

                  <select
                    id="whatsapp-customer"
                    value={customerId}
                    onChange={handleCustomerChange}
                    disabled={loading}
                    className="w-full appearance-none rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] py-3 pl-11 pr-10 text-sm text-[#171914] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100 disabled:opacity-50"
                  >
                    <option value="">
                      Select customer...
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
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#948A76]"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {selectedCustomer && (
                    <motion.div
                      key={customerId}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                      }}
                      transition={spring}
                      className="mt-3 flex items-center gap-3 rounded-xl border border-transparent bg-[#F8F5ED] p-3 transition hover:border-[#E6D9BD]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F9E6A5] font-bold text-[#171914]">
                        {getCustomerName(
                          selectedCustomer
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#171914]">
                          {getCustomerName(
                            selectedCustomer
                          )}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-[#746D5E]">
                          <Smartphone size={13} />

                          {selectedPhone ||
                            "No phone number available"}
                        </p>
                      </div>

                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-green-600"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!loading && customers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No customers found. Add a customer first.
                  </p>
                )}
              </section>

              {/* INVOICE SELECTOR */}

              <section>
                <label
                  htmlFor="whatsapp-invoice-search"
                  className="mb-2 block text-sm font-semibold text-[#171914]"
                >
                  Invoice
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948A76]"
                  />

                  <input
                    id="whatsapp-invoice-search"
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search invoice number..."
                    disabled={!customerId}
                    className="w-full rounded-xl border border-[#E6D9BD] bg-[#F9F6EE] py-3 pl-11 pr-4 text-sm text-[#171914] outline-none transition placeholder:text-[#948A76] focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="mt-3 space-y-2">
                  {filteredInvoices.map((invoice) => {
                    const id = getInvoiceId(invoice);
                    const active = id === invoiceId;

                    const invoiceCustomer =
                      getInvoiceCustomer(
                        invoice,
                        selectedCustomer
                      );

                    return (
                      <motion.button
                        key={id || getInvoiceNumber(invoice)}
                        type="button"
                        onClick={() =>
                          setInvoiceId(id)
                        }
                        whileHover={{
                          y: -2,
                          borderColor: GOLD_COLOR,
                        }}
                        whileTap={{ scale: 0.99 }}
                        transition={spring}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-[#D4AF37] bg-[#FFF6D9]"
                            : "border-[#E6D9BD] bg-[#FFFEFA] hover:bg-[#F9F6EE]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`rounded-lg p-2 ${
                              active
                                ? "bg-[#F4C64E] text-black"
                                : "bg-[#F4F0E6] text-[#746D5E]"
                            }`}
                          >
                            <FileText size={17} />
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-[#171914]">
                              {getInvoiceNumber(invoice) ||
                                "Invoice"}
                            </span>

                            <span className="mt-1 block truncate text-xs text-[#746D5E]">
                              {getCustomerName(
                                invoiceCustomer
                              )}
                              {" · "}
                              {getInvoiceDate(invoice) ||
                                "Date unavailable"}
                            </span>
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-bold text-[#171914]">
                            {formatMoney(
                              getInvoiceTotal(invoice)
                            )}
                          </span>

                          {active && (
                            <CheckCircle2
                              size={17}
                              className="text-green-600"
                            />
                          )}
                        </span>
                      </motion.button>
                    );
                  })}

                  {!loading &&
                    customerId &&
                    filteredInvoices.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[#E6D9BD] bg-[#F9F6EE] px-4 py-8 text-center">
                        <FileText
                          size={25}
                          className="mx-auto text-[#948A76]"
                        />

                        <p className="mt-3 text-sm font-semibold text-[#171914]">
                          No matching invoices
                        </p>

                        <p className="mt-1 text-xs text-[#746D5E]">
                          Try another invoice number or create a sale.
                        </p>
                      </div>
                    )}
                </div>
              </section>
                            {/* MESSAGE EDITOR */}

              <section>
                <label
                  htmlFor="whatsapp-message"
                  className="mb-2 block text-sm font-semibold text-[#171914]"
                >
                  Personal Message
                </label>

                <textarea
                  id="whatsapp-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  rows={3}
                  placeholder="Write a personal message..."
                  className="w-full resize-y rounded-xl border border-[#E6D9BD] bg-[#F9F6EE] px-4 py-3 text-sm text-[#171914] outline-none transition placeholder:text-[#948A76] focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-amber-100"
                />

                <p className="mt-1 text-xs text-[#746D5E]">
                  This message is added to the invoice details
                  before opening WhatsApp.
                </p>
              </section>

              {/* INVOICE MESSAGE PREVIEW */}

              <section className="overflow-hidden rounded-2xl border border-[#D6E8D7] bg-[#F0F8F0]">
                <div className="flex items-center justify-between gap-3 border-b border-[#D6E8D7] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-green-100 p-2 text-green-700">
                      <MessageCircle size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#171914]">
                        WhatsApp Message Preview
                      </h3>

                      <p className="text-xs text-[#58715A]">
                        Review before sending
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    Preview
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  {!selectedCustomer || !selectedInvoice ? (
                    <div className="rounded-xl border border-dashed border-[#D6E8D7] bg-white/70 p-6 text-center">
                      <FileText
                        size={25}
                        className="mx-auto text-[#79947B]"
                      />

                      <p className="mt-3 text-sm font-semibold text-[#171914]">
                        Select a customer and invoice
                      </p>

                      <p className="mt-1 text-xs text-[#58715A]">
                        Your invoice message will appear here.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      key={`${customerId}-${invoiceId}`}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={spring}
                      className="relative ml-auto max-w-2xl rounded-2xl rounded-tr-sm border border-[#D6E8D7] bg-white p-4 shadow-sm"
                    >
                      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-[#243426]">
                        {generatedMessage}
                      </pre>

                      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-[#79947B]">
                        <CheckCircle2 size={12} />
                        Message preview
                      </div>
                    </motion.div>
                  )}
                </div>
              </section>

              {/* ACTION BUTTONS */}

              <section className="flex flex-col justify-between gap-4 border-t border-[#EEE5D2] pt-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-[#171914]">
                    Ready to share?
                  </p>

                  <p className="mt-1 text-xs text-[#746D5E]">
                    WhatsApp will open with your prepared message.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={handleCopyMessage}
                    disabled={
                      !selectedCustomer || !selectedInvoice
                    }
                    whileHover={{
                      y: -2,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    transition={spring}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] px-4 py-3 text-sm font-semibold text-[#171914] transition hover:border-[#D4AF37] hover:bg-[#FFF6D9] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Paperclip size={17} />
                    Copy message
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleSendWhatsApp}
                    disabled={
                      !selectedCustomer ||
                      !selectedInvoice ||
                      loading
                    }
                    whileHover={{
                      y: -3,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    transition={spring}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4C64E] px-5 py-3 text-sm font-bold text-black shadow-md shadow-[#D4AF37]/20 transition hover:bg-[#E7B83B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={17} />
                    Open WhatsApp
                    <ExternalLink size={15} />
                  </motion.button>
                </div>
              </section>
            </div>
          </motion.section>

          {/* HELPFUL INFORMATION */}

          <motion.section
            variants={itemAnimation}
            className="rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#FFF6D9] p-2.5 text-[#9B7613]">
                <Store size={19} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#171914]">
                  Important information
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#746D5E]">
                  This feature prepares an invoice message and
                  opens WhatsApp. Review the customer number
                  and message, then press Send in WhatsApp.
                  It does not automatically attach a PDF invoice
                  or send messages in the background.
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}

export default WhatsApp;

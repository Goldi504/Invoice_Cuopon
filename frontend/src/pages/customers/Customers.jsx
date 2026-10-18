import { useMemo, useState } from "react";

import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Pencil,
  Trash2,
  ShieldCheck,
  X,
  UserPlus,
  MapPin,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

// =====================================================
// INITIAL CUSTOMER DATA
// =====================================================

const initialCustomers = [
  {
    _id: "1",
    name: "Goldi",
    mobile: "7070066068",
    email: "demo12@gmail.com",
    aadhaarNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    totalPurchases: 0,
  },
  {
    _id: "2",
    name: "Goldi Kumari",
    mobile: "7070066069",
    email: "demo123@gmail.com",
    aadhaarNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    totalPurchases: 0,
  },
  {
    _id: "3",
    name: "Rahul Kumar",
    mobile: "9876543210",
    email: "",
    aadhaarNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    totalPurchases: 0,
  },
];

// =====================================================
// THEME COLORS
// =====================================================

const GOLD = "#E9B83F";
const GOLD_DARK = "#9B6B00";
const PAGE_BG = "#F4F0E6";
const CARD_BG = "#FFFEFA";
const BORDER = "#E6D9BD";
const TEXT = "#171914";
const MUTED = "#777263";

// =====================================================
// EMPTY CUSTOMER FORM
// =====================================================

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  aadhaarNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

// =====================================================
// CUSTOMERS COMPONENT
// =====================================================

function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // ===================================================
  // SEARCH CUSTOMERS
  // ===================================================

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) =>
      [
        customer.name,
        customer.mobile,
        customer.email,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [customers, search]);

  // ===================================================
  // OPEN ADD CUSTOMER MODAL
  // ===================================================

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  };

  // ===================================================
  // OPEN EDIT CUSTOMER MODAL
  // ===================================================

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      ...emptyForm,
      ...customer,
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      aadhaarNumber: customer.aadhaarNumber || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
    });

    setError("");
    setModalOpen(true);
  };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setError("");
  };

  // ===================================================
  // SAVE CUSTOMER
  // ===================================================

  const handleSave = (event) => {
    event.preventDefault();

    const cleanedForm = {
      ...form,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      aadhaarNumber: form.aadhaarNumber.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    if (
      !cleanedForm.name ||
      !cleanedForm.mobile ||
      !cleanedForm.address
    ) {
      setError(
        "Please enter the customer's name, mobile number, and address."
      );
      return;
    }

    if (!/^\d{10}$/.test(cleanedForm.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (
      cleanedForm.aadhaarNumber &&
      !/^\d{12}$/.test(cleanedForm.aadhaarNumber)
    ) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (
      cleanedForm.pincode &&
      !/^\d{6}$/.test(cleanedForm.pincode)
    ) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (
      cleanedForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedForm.email)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer._id === editingCustomer._id
            ? { ...customer, ...cleanedForm }
            : customer
        )
      );
    } else {
      setCustomers((previous) => [
        ...previous,
        {
          ...cleanedForm,
          _id: crypto.randomUUID(),
          totalPurchases: 0,
        },
      ]);
    }

    closeModal();
  };

  // ===================================================
  // DELETE CUSTOMER
  // ===================================================

  const handleDelete = (customer) => {
    if (
      !window.confirm(
        `Delete customer ${customer.name}?`
      )
    ) {
      return;
    }

    setCustomers((previous) =>
      previous.filter(
        (item) => item._id !== customer._id
      )
    );
  };

  // ===================================================
  // INPUT STYLES
  // ===================================================

  const inputClass =
    "h-12 w-full rounded-xl border border-[#E5D9C1] bg-[#FBF8F0] px-3.5 text-sm text-[#171914] outline-none transition duration-200 placeholder:text-[#918875] hover:border-[#D9AD35] focus:border-[#C99A24] focus:bg-[#FFFEFA] focus:ring-4 focus:ring-[#E9B83F]/15";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#343A36]";

  // PART 2 CONTINUES WITH THE PAGE LAYOUT
    return (
    <div
      className="relative -m-3 flex min-h-full min-w-0 flex-col space-y-6 bg-[#F4F0E6] p-4 text-[#171914] sm:-m-5 sm:p-6 lg:-m-6 lg:p-7"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8D59A] bg-[#FFF5D6] px-3 py-1.5 text-xs font-bold tracking-wide text-[#79570A]">
            <Users size={14} />
            CUSTOMER MANAGEMENT
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#171914]">
            Customers
          </h1>

          <p className="mt-1 text-sm text-[#746D5E] sm:text-base">
            Manage customer details and view their purchase history.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{
            y: -2,
            boxShadow: "0 8px 18px rgba(155,107,0,0.16)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={openAddModal}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-[#FFE18A] to-[#E9B83F] px-5 py-3 text-sm font-bold text-[#171914] shadow-sm transition sm:self-auto"
        >
          <Plus size={19} />
          Add Customer
        </motion.button>
      </div>

      {/* CUSTOMER TABLE CARD */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-w-0 overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-[0_4px_18px_rgba(65,48,15,0.045)] transition-all duration-300 hover:border-[#DCC68F] hover:shadow-md"
      >
        {/* SEARCH TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-[#E6D9BD] bg-[#FFFEFA] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full min-w-0 sm:max-w-[480px]">
            <Search
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A18B5D]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone, or email..."
              aria-label="Search customers"
              className="h-11 w-full rounded-xl border border-[#E5D9C1] bg-[#FBF8F0] pl-11 pr-4 text-sm text-[#171914] outline-none transition duration-200 placeholder:text-[#918875] hover:border-[#D9AD35] focus:border-[#C99A24] focus:bg-[#FFFEFA] focus:ring-4 focus:ring-[#E9B83F]/15"
            />
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl px-1 py-1 text-sm text-[#746D5E] sm:self-auto">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1C6] text-[#986900]">
              <Users size={19} />
            </span>

            <span>
              <strong className="text-[#171914]">
                {filteredCustomers.length}
              </strong>{" "}
              customers
            </span>
          </div>
        </div>

        {/* RESPONSIVE TABLE */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E6D9BD] bg-[#F4F0E6]">
                {[
                  "#",
                  "Customer",
                  "Phone",
                  "Email",
                  "Total Purchases",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#746D5E]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.035, 0.2),
                  }}
                  className="group border-b border-[#EAE1CF] transition-colors duration-200 hover:bg-[#FFF5D6] last:border-b-0"
                >
                  {/* NUMBER */}
                  <td className="px-5 py-4 text-sm text-[#746D5E]">
                    {index + 1}
                  </td>

                  {/* CUSTOMER */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8D59A] bg-[#FFF1C6] font-bold text-[#986900] transition-colors duration-200 group-hover:bg-[#FFE8A1]">
                        {customer.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div>
                        <p className="whitespace-nowrap text-sm font-bold text-[#171914]">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-[#918875]">
                          Customer
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* PHONE */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap text-sm text-[#514B3E]">
                      <Phone
                        size={16}
                        className="text-[#A7790D]"
                      />
                      {customer.mobile || "—"}
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#514B3E]">
                      <Mail
                        size={16}
                        className="shrink-0 text-[#A7790D]"
                      />

                      <span className="max-w-[220px] truncate">
                        {customer.email || "—"}
                      </span>
                    </div>
                  </td>

                  {/* TOTAL PURCHASES */}
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg border border-[#EEE5D3] bg-[#F4F0E6] px-3 py-2 text-sm font-bold text-[#171914] transition-colors group-hover:border-[#E8D59A] group-hover:bg-[#FFF1C6]">
                      ₹
                      {Number(
                        customer.totalPurchases || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileHover={{ y: -1, scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openEditModal(customer)}
                        aria-label={`Edit ${customer.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8D59A] bg-[#FFF5D6] text-[#986900] transition-colors hover:bg-[#FFE8A1]"
                      >
                        <Pencil size={17} />
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ y: -1, scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleDelete(customer)}
                        aria-label={`Delete ${customer.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                      >
                        <Trash2 size={17} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {/* EMPTY STATE */}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F0E6] text-[#918875]">
                      <Search size={22} />
                    </div>

                    <p className="font-semibold text-[#302B20]">
                      No customers found
                    </p>

                    <p className="mt-1 text-sm text-[#918875]">
                      Try another name, phone number, or email.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="flex flex-col gap-2 border-t border-[#EAE1CF] bg-[#FFFEFA] px-5 py-4 text-sm text-[#746D5E] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <strong className="text-[#171914]">
              {filteredCustomers.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[#171914]">
              {customers.length}
            </strong>{" "}
            customers
          </p>

          <div className="flex items-center gap-2 text-xs text-[#84917F]">
            <ShieldCheck size={15} />
            Customer records
          </div>
        </div>
      </motion.section>
            {/* ADD / EDIT CUSTOMER MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171914]/40 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E6D9BD] bg-[#FFFEFA] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1C6] text-[#986900]">
                    {editingCustomer ? (
                      <Pencil size={20} />
                    ) : (
                      <UserPlus size={20} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#171914]">
                      {editingCustomer
                        ? "Edit Customer"
                        : "Add Customer"}
                    </h2>

                    <p className="mt-1 text-sm text-[#777263]">
                      {editingCustomer
                        ? "Update customer information"
                        : "Enter the customer's details"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close customer form"
                  className="rounded-xl p-2 text-[#918875] transition-colors hover:bg-[#F4F0E6] hover:text-[#171914]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* CUSTOMER FORM */}
              <form
                onSubmit={handleSave}
                className="space-y-5 p-5 sm:p-6"
              >
                {/* PERSONAL INFORMATION */}
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#986900]">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="customer-name"
                        className={labelClass}
                      >
                        Full Name *
                      </label>

                      <input
                        id="customer-name"
                        name="name"
                        value={form.name}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Enter full name"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="customer-mobile"
                        className={labelClass}
                      >
                        Mobile Number *
                      </label>

                      <input
                        id="customer-mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.mobile}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            mobile: event.target.value.replace(
                              /\D/g,
                              ""
                            ).slice(0, 10),
                          }))
                        }
                        placeholder="10-digit mobile number"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="customer-email"
                        className={labelClass}
                      >
                        Email Address
                      </label>

                      <input
                        id="customer-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            email: event.target.value,
                          }))
                        }
                        placeholder="customer@example.com"
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="customer-aadhaar"
                        className={labelClass}
                      >
                        Aadhaar Number
                      </label>

                      <input
                        id="customer-aadhaar"
                        name="aadhaarNumber"
                        type="password"
                        inputMode="numeric"
                        maxLength={12}
                        autoComplete="off"
                        value={form.aadhaarNumber}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            aadhaarNumber: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 12),
                          }))
                        }
                        placeholder="Optional — 12 digits"
                        className={inputClass}
                      />

                      <p className="mt-1.5 text-xs text-[#918875]">
                        Only collect Aadhaar details when necessary
                        and handle them securely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ADDRESS INFORMATION */}
                <div className="border-t border-[#EAE1CF] pt-5">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#986900]">
                    Address Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="customer-address"
                        className={labelClass}
                      >
                        Address *
                      </label>

                      <textarea
                        id="customer-address"
                        name="address"
                        rows={3}
                        value={form.address}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            address: event.target.value,
                          }))
                        }
                        placeholder="House number, street, area"
                        className="w-full resize-y rounded-xl border border-[#E5D9C1] bg-[#FBF8F0] px-3.5 py-3 text-sm text-[#171914] outline-none transition duration-200 placeholder:text-[#918875] hover:border-[#D9AD35] focus:border-[#C99A24] focus:bg-[#FFFEFA] focus:ring-4 focus:ring-[#E9B83F]/15"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="customer-city"
                        className={labelClass}
                      >
                        City
                      </label>

                      <input
                        id="customer-city"
                        name="city"
                        value={form.city}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            city: event.target.value,
                          }))
                        }
                        placeholder="Enter city"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="customer-state"
                        className={labelClass}
                      >
                        State
                      </label>

                      <input
                        id="customer-state"
                        name="state"
                        value={form.state}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            state: event.target.value,
                          }))
                        }
                        placeholder="Enter state"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="customer-pincode"
                        className={labelClass}
                      >
                        PIN Code
                      </label>

                      <input
                        id="customer-pincode"
                        name="pincode"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            pincode: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          }))
                        }
                        placeholder="6-digit PIN code"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#EAE1CF] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] px-5 py-3 text-sm font-semibold text-[#514B3E] transition-colors hover:bg-[#F4F0E6]"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFE18A] to-[#E9B83F] px-6 py-3 text-sm font-bold text-[#171914] shadow-sm transition-shadow hover:shadow-md"
                  >
                    {editingCustomer ? (
                      <Pencil size={17} />
                    ) : (
                      <Plus size={18} />
                    )}

                    {editingCustomer
                      ? "Update Customer"
                      : "Save Customer"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Customers;
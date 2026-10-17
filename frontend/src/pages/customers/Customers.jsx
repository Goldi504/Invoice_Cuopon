
import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Users,
  X,
  LoaderCircle,
  MapPin,
  UserRound,
  ShieldCheck,
  UserPlus,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  name: "",
  email: "",
  mobileNumber: "",
  aadhaarNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const fields = [
  {
    name: "name",
    label: "Full Name *",
    placeholder: "Enter customer name",
    required: true,
    type: "text",
  },
  {
    name: "mobileNumber",
    label: "Mobile Number *",
    placeholder: "10-digit mobile number",
    required: true,
    type: "tel",
  },
  {
    name: "email",
    label: "Email Address",
    placeholder: "customer@example.com",
    required: false,
    type: "email",
  },
  {
    name: "aadhaarNumber",
    label: "Aadhaar Number",
    placeholder: "Optional",
    required: false,
    type: "text",
  },
  {
    name: "address",
    label: "Address *",
    placeholder: "House number, street, area",
    required: true,
    type: "text",
  },
  {
    name: "city",
    label: "City",
    placeholder: "Enter city",
    required: false,
    type: "text",
  },
  {
    name: "state",
    label: "State",
    placeholder: "Enter state",
    required: false,
    type: "text",
  },
  {
    name: "pincode",
    label: "PIN Code",
    placeholder: "Enter PIN code",
    required: false,
    type: "text",
  },
];

function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load customers from your existing backend.
  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/customers");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data.customers || data.data || [];

      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customers. Please check your backend and login."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Search by customer name, phone, or email.
  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();

    return (
      (customer.name || "").toLowerCase().includes(query) ||
      String(customer.mobileNumber || "").includes(query) ||
      (customer.email || "").toLowerCase().includes(query)
    );
  });

  const openAddCustomer = () => {
    setCustomerForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setCustomerForm({ ...emptyForm });
    setError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setCustomerForm((previous) => ({
      ...previous,
      [name]:
        name === "mobileNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  };

  // Add a customer using your existing POST /customers endpoint.
  const handleAddCustomer = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: customerForm.name.trim(),
      email: customerForm.email.trim(),
      mobileNumber: customerForm.mobileNumber.trim(),
      aadhaarNumber: customerForm.aadhaarNumber.trim(),
      address: customerForm.address.trim(),
      city: customerForm.city.trim(),
      state: customerForm.state.trim(),
      pincode: customerForm.pincode.trim(),
    };

    if (!payload.name || !payload.mobileNumber || !payload.address) {
      setError("Name, mobile number, and address are required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(payload.mobileNumber)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (
      payload.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    if (
      payload.aadhaarNumber &&
      !/^[0-9]{12}$/.test(payload.aadhaarNumber)
    ) {
      setError("Enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (
      payload.pincode &&
      !/^[0-9]{6}$/.test(payload.pincode)
    ) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/customers", payload);

      const savedCustomer =
        response.data.customer ||
        response.data.data ||
        response.data;

      if (savedCustomer?._id || savedCustomer?.id) {
        setCustomers((previous) => [
          savedCustomer,
          ...previous.filter(
            (item) =>
              item._id !== savedCustomer._id &&
              item.id !== savedCustomer.id
          ),
        ]);
      }

      setShowModal(false);
      setCustomerForm({ ...emptyForm });
      setSuccess("Customer added successfully.");

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const getCustomerId = (customer) =>
    customer._id || customer.id;

  return (
<div className="min-h-full w-full space-y-6 bg-[#F7F6F2] p-1 sm:p-2">      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F0DDA7] bg-[#FFF5D8] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#8B650B]">
            <Sparkles size={13} />
            Customer management
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#171A19] sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-[#718096]">
            Manage customer details and view their purchase history.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddCustomer}
          className="group inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFE28A] to-[#E9B52F] px-4 py-3 text-sm font-bold text-[#171A19] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E9B52F]/20 active:translate-y-0"
        >
          <Plus
            size={18}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
          Add Customer
        </button>
      </div>

      {/* Success notification */}
      {success && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            {success}
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
            className="rounded-lg p-1 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && !showModal && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error message"
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Customer table card */}
      <section className="overflow-hidden rounded-2xl border border-[#E9E1CF] bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        {/* Search and summary */}
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A18A5D]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone, or email..."
              aria-label="Search customers"
              className="h-11 w-full rounded-xl border border-[#E8E1D2] bg-[#FAF9F5] pl-10 pr-4 text-sm text-[#171A19] outline-none transition duration-200 placeholder:text-[#9AA4B2] hover:border-[#D8C89D] focus:border-[#D9A91D] focus:bg-white focus:ring-4 focus:ring-[#F2C94C]/15"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-[#718096]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3CF] text-[#936A00]">
              <Users size={18} />
            </div>
            <span>
              <strong className="text-[#171A19]">
                {filteredCustomers.length}
              </strong>{" "}
              {filteredCustomers.length === 1 ? "customer" : "customers"}
            </span>
          </div>
        </div>

        {/* Responsive table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#ECE5D7] bg-[#F8F6F0]">
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
className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#64748B]"                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-[#C69B21]"
                    />
                    <p className="mt-3 text-sm text-[#718096]">
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={getCustomerId(customer) || index}
className="group border-b border-[#E5E7EB] transition-all duration-200 hover:bg-[#FFF8E5] hover:shadow-[inset_3px_0_0_0_#F2C94C] last:border-b-0"                  >
                    <td className="px-5 py-4 text-sm text-[#718096]">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F3E5B7] bg-[#FFF2C8] text-sm font-extrabold text-[#765300] transition duration-200 group-hover:scale-105 group-hover:bg-[#F8D76B]">
                          {(customer.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#171A19] transition-colors group-hover:text-[#916500]">
                            {customer.name || "Unnamed customer"}
                          </p>

                          <p className="mt-0.5 text-xs text-[#9AA4B2]">
                            Customer
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <a
                        href={
                          customer.mobileNumber
                            ? `tel:${customer.mobileNumber}`
                            : undefined
                        }
                        className="inline-flex items-center gap-2 text-sm text-[#596779] transition-colors hover:text-[#986900]"
                      >
                        <Phone
                          size={15}
                          className="shrink-0 text-[#A18A5D]"
                        />
                        {customer.mobileNumber || "—"}
                      </a>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[230px] items-center gap-2 text-sm text-[#596779]">
                        <Mail
                          size={15}
                          className="shrink-0 text-[#A18A5D]"
                        />
                        <span className="truncate">
                          {customer.email || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg bg-[#F7F5EF] px-3 py-1.5 text-sm font-bold text-[#24251F] transition-colors group-hover:bg-[#FFF0C0]">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Customer editing is not connected yet."
                            )
                          }
                          title="Edit customer"
                          aria-label={`Edit ${customer.name || "customer"}`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DFE9FA] bg-[#F0F5FF] text-[#3868C8] transition duration-200 hover:-translate-y-0.5 hover:border-[#B9D0FF] hover:bg-[#DDE9FF] hover:shadow-sm active:translate-y-0"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Customer deletion is not connected yet."
                            )
                          }
                          title="Delete customer"
                          aria-label={`Delete ${customer.name || "customer"}`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F7DDDD] bg-[#FFF1F1] text-[#D64B4B] transition duration-200 hover:-translate-y-0.5 hover:border-[#F3BABA] hover:bg-[#FFE0E0] hover:shadow-sm active:translate-y-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F0E2B9] bg-[#FFF5D8] text-[#A47A10] transition duration-200 hover:rotate-3 hover:scale-105">
                        <UserRound size={28} />
                      </div>

                      <h3 className="mt-4 text-base font-bold text-[#171A19]">
                        {search
                          ? "No matching customers"
                          : "No customers yet"}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#718096]">
                        {search
                          ? "Try another name, phone number, or email address."
                          : "Add your first customer to start managing customer records."}
                      </p>

                      {!search && (
                        <button
                          type="button"
                          onClick={openAddCustomer}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F2C94C] px-4 py-2.5 text-sm font-bold text-[#171A19] transition hover:-translate-y-0.5 hover:bg-[#E9B52F]"
                        >
                          <UserPlus size={17} />
                          Add First Customer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex flex-col gap-2 border-t border-[#F0EBDD] bg-[#FFFEFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#718096]">
            Showing{" "}
            <span className="font-bold text-[#24251F]">
              {filteredCustomers.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#24251F]">
              {customers.length}
            </span>{" "}
            customers
          </p>

          <p className="flex items-center gap-1.5 text-xs text-[#8B967F]">
            <ShieldCheck size={14} />
            Customer records
          </p>
        </div>
      </section>

      {/* Add customer modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101513]/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-customer-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E9E1CF] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#EFE8D9] bg-[#FFFEFB] px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0BF] text-[#926900]">
                  <UserPlus size={21} />
                </div>

                <div>
                  <h2
                    id="add-customer-title"
                    className="text-lg font-extrabold text-[#171A19] sm:text-xl"
                  >
                    Add New Customer
                  </h2>
                  <p className="mt-1 text-xs text-[#718096] sm:text-sm">
                    Enter the customer's information below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-[#718096] transition hover:bg-[#F2EFE7] hover:text-[#171A19] disabled:opacity-50"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer}>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={
                      field.name === "address"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <label
                      htmlFor={field.name}
                      className="mb-1.5 block text-sm font-semibold text-[#343A36]"
                    >
                      {field.label}
                    </label>

                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={customerForm[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={saving}
                      maxLength={
                        field.name === "mobileNumber"
                          ? 10
                          : field.name === "aadhaarNumber"
                            ? 12
                            : field.name === "pincode"
                              ? 6
                              : undefined
                      }
                      className="w-full rounded-xl border border-[#E5E0D4] bg-[#FAF9F5] px-3.5 py-3 text-sm text-[#171A19] outline-none transition duration-200 placeholder:text-[#9AA4B2] hover:border-[#D8C89D] focus:border-[#D9A91D] focus:bg-white focus:ring-4 focus:ring-[#F2C94C]/15 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <div className="flex items-start gap-2 rounded-xl border border-[#F0E2B9] bg-[#FFFAEA] px-3.5 py-3 text-xs leading-5 text-[#806421]">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    Enter the customer's correct contact and address
                    details before saving.
                  </div>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6"
                >
                  {error}
                </div>
              )}

              {/* Modal footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#EFE8D9] bg-[#FFFEFB] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#E5E0D4] bg-white px-5 py-2.5 text-sm font-semibold text-[#596779] transition hover:bg-[#F5F2EA] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFE28A] to-[#E9B52F] px-5 py-2.5 text-sm font-bold text-[#171A19] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;

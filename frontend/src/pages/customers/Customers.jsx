
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

function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load real customers from MongoDB through the backend.
  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/customers");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data.customers || data.data || [];

      setCustomers(list);
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

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();

    return (
      (customer.name || "").toLowerCase().includes(query) ||
      (customer.mobileNumber || "").includes(query) ||
      (customer.email || "").toLowerCase().includes(query)
    );
  });

  const openAddCustomer = () => {
    setCustomerForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setCustomerForm(emptyForm);
    setError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setCustomerForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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

    if (
      !payload.name ||
      !payload.mobileNumber ||
      !payload.address
    ) {
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

    setSaving(true);

    try {
      const response = await api.post("/customers", payload);

      const savedCustomer =
        response.data.customer ||
        response.data.data ||
        response.data;

      // Add the returned database record immediately.
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
      setCustomerForm(emptyForm);
      setSuccess("Customer added successfully.");

      // Refresh the list from the backend.
      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add customer. Please check the API endpoint and try again."
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your customers and view purchase history.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddCustomer}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#F4C64E] px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E9B52F] hover:shadow-md"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !showModal && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Customers table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#F4C64E] focus:bg-white focus:ring-2 focus:ring-[#F4C64E]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {[
                  "#",
                  "Name",
                  "Phone",
                  "Email",
                  "Total Purchases",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
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
                      className="mx-auto animate-spin text-slate-500"
                      size={26}
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={getCustomerId(customer) || index}
                    className="group border-b border-slate-100 transition-colors hover:bg-[#FFF9E8]"
                  >
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4CC] text-sm font-bold text-slate-800">
                          {(customer.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={15} className="text-slate-400" />
                        {customer.mobileNumber || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={15} className="text-slate-400" />
                        {customer.email || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Customer editing is not connected yet."
                            )
                          }
                          title="Edit customer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
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
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
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
                    <div className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Users size={25} />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        No customers found
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Add a customer or try changing your search.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredCustomers.length}
            </span>{" "}
            customers
          </p>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
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
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="add-customer-title"
                  className="text-xl font-bold text-slate-950"
                >
                  Add New Customer
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter customer details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer}>
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                {[
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
                ].map((field) => (
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
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
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
                        field.name === "mobileNumber" ? 10 : undefined
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#F4C64E] focus:bg-white focus:ring-2 focus:ring-[#F4C64E]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div
                  role="alert"
                  className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F4C64E] px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-[#E9B52F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
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

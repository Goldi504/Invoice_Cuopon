import React, { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

const customersData = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul@gmail.com",
    purchases: "₹45,000",
  },
  {
    id: 2,
    name: "Priya Verma",
    phone: "8765432109",
    email: "priya@gmail.com",
    purchases: "₹28,000",
  },
  {
    id: 3,
    name: "Amit Kumar",
    phone: "7654321098",
    email: "amit@gmail.com",
    purchases: "₹15,000",
  },
  {
    id: 4,
    name: "Sneha Patel",
    phone: "9876501234",
    email: "sneha@gmail.com",
    purchases: "₹32,000",
  },
  {
    id: 5,
    name: "Vikash Singh",
    phone: "9123456789",
    email: "vikash@gmail.com",
    purchases: "₹12,000",
  },
  {
    id: 6,
    name: "Neha Jain",
    phone: "9988776655",
    email: "neha@gmail.com",
    purchases: "₹18,000",
  },
];

function Customers() {
  const [search, setSearch] = useState("");

  const filteredCustomers = customersData.filter((customer) => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.phone.includes(value) ||
      customer.email.toLowerCase().includes(value)
    );
  });

  const handleEdit = (customer) => {
    console.log("Edit customer:", customer);
  };

  const handleDelete = (customer) => {
    console.log("Delete customer:", customer);
  };

  const handleAddCustomer = () => {
    console.log("Add customer");
  };

  return (
    <div className="w-full">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your customers and view purchase history.
          </p>
        </div>

        <button
          onClick={handleAddCustomer}
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-xl
            bg-[#F4C64E]
            px-4
            py-2.5
            text-sm
            font-bold
            text-slate-950
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-[#E9B52F]
            hover:shadow-md
            active:translate-y-0
          "
        >
          <Plus size={18} />
          Add Customer
        </button>

      </div>


      {/* =====================================
          MAIN CARD
      ===================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* =================================
            SEARCH
        ================================= */}

        <div className="border-b border-slate-100 p-5">

          <div className="relative max-w-md">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-10
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#F4C64E]
                focus:bg-white
                focus:ring-2
                focus:ring-[#F4C64E]/20
              "
            />

          </div>

        </div>


        {/* =================================
            TABLE
        ================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Purchases
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>
            </thead>


            <tbody>

              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="
                      group
                      border-b
                      border-slate-100
                      transition-colors
                      duration-200
                      hover:bg-[#FFF9E8]
                    "
                  >

                    {/* ID */}

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {customer.id}
                    </td>


                    {/* Name */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#FFF4CC]
                            text-sm
                            font-bold
                            text-slate-800
                            transition-transform
                            duration-200
                            group-hover:scale-105
                          "
                        >
                          {customer.name.charAt(0)}
                        </div>

                        <span className="text-sm font-semibold text-slate-900">
                          {customer.name}
                        </span>

                      </div>

                    </td>


                    {/* Phone */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <Phone
                          size={15}
                          className="text-slate-400"
                        />

                        {customer.phone}

                      </div>

                    </td>


                    {/* Email */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <Mail
                          size={15}
                          className="text-slate-400"
                        />

                        {customer.email}

                      </div>

                    </td>


                    {/* Purchases */}

                    <td className="px-5 py-4">

                      <span className="text-sm font-bold text-slate-900">
                        {customer.purchases}
                      </span>

                    </td>


                    {/* Actions */}

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() => handleEdit(customer)}
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            transition-all
                            duration-200
                            hover:scale-105
                            hover:bg-blue-100
                          "
                          title="Edit customer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(customer)}
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-50
                            text-red-500
                            transition-all
                            duration-200
                            hover:scale-105
                            hover:bg-red-100
                          "
                          title="Delete customer"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className="
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-2xl
                          bg-slate-100
                          text-slate-400
                        "
                      >
                        <Users size={25} />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        No customers found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search.
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =================================
            PAGINATION
        ================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            px-5
            py-4
          "
        >

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredCustomers.length}
            </span>{" "}
            customers
          </p>


          <div className="flex items-center gap-2">

            <button
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <ChevronLeft size={17} />
            </button>

            <button
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-slate-950
                text-sm
                font-semibold
                text-white
              "
            >
              1
            </button>

            <button
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-sm
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              2
            </button>

            <button
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-sm
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              3
            </button>

            <button
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Customers;
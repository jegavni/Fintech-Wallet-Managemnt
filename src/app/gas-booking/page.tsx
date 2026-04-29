"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { toast } from "react-toastify";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function LPGPage() {
  const router = useRouter();

  const [consumerNumber, setConsumerNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch customer using consumer number
  const fetchConsumerDetails = async () => {
    if (!consumerNumber || !provider) {
      toast.error("Enter consumer number and provider");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/lpg?consumerNumber=${consumerNumber}`
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Consumer not found");
        return;
      }

      setCustomerName(data.data.customer_name || "");
      setAmount(data.data.amount || "");

      toast.success("Consumer details fetched");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch consumer details");
    } finally {
      setLoading(false);
    }
  };

  // Razorpay payment
  const handlePayment = async () => {
    if (!consumerNumber || !provider || !customerName || !amount) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Fintech App",
        description: "LPG Gas Bill Payment",
        order_id: order.id,

        handler: async function (response: any) {
          const saveRes = await fetch("/api/lpg", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              consumerNumber,
              customerName,
              provider,
              amount,
              status: "Paid",
              razorpay_payment_id: response.razorpay_payment_id,
            }),
          });

          const saveData = await saveRes.json();

          if (!saveRes.ok) {
            toast.error(saveData.message || "Payment save failed");
            return;
          }

          toast.success("LPG Payment Successful");

          setConsumerNumber("");
          setProvider("");
          setCustomerName("");
          setAmount("");

          router.push("/dashboard");
        },

        theme: {
          color: "#000",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Flame className="w-8 h-8" />
          <h1 className="text-2xl font-bold">
            LPG Gas Bill Payment
          </h1>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Consumer Number"
            value={consumerNumber}
            onChange={(e) => setConsumerNumber(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="">Select Provider</option>
            <option value="Indane">Indane</option>
            <option value="HP Gas">HP Gas</option>
            <option value="Bharat Gas">Bharat Gas</option>
          </select>

          <button
            onClick={fetchConsumerDetails}
            disabled={loading}
            className="w-full bg-gray-800 text-white py-3 rounded-xl"
          >
            {loading ? "Fetching..." : "Fetch Consumer Details"}
          </button>

          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />

          <input
            type="number"
            placeholder="Bill Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            onClick={handlePayment}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Pay Using Razorpay
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full border py-3 rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
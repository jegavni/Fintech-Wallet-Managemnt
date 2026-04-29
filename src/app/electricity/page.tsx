// app/electricity/page.tsx
"use client";

import Script from "next/dist/client/script";
import { useState } from "react";

interface BillData {
  consumerNumber: string;
  customerName: string;
  boardName: string;
  amount: number;
  dueDate: string;
}

export default function ElectricityPage() {
  const [consumerNumber, setConsumerNumber] = useState("");
  const [billData, setBillData] = useState<BillData | null>(null);

  const fetchBill = async () => {
    const res = await fetch("/api/electricity/fetch-bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consumerNumber }),
    });

    const data = await res.json();

    if (data.success) {
      setBillData(data.bill);
    }
  };

  const payBill = async () => {
    if (!billData) return;

    const res = await fetch("/api/electricity/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: billData.amount }),
    });

    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Electricity Bill Payment",
      description: "Bill Payment",
      order_id: order.id,
      handler: function (response: any) {
        alert("Payment Successful: " + response.razorpay_payment_id);
      },
      theme: {
        color: "#2563eb",
      },
    };

    // @ts-ignore
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <>
    <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Electricity Bill Payment</h1>

      <input
        type="text"
        placeholder="Enter Consumer Number"
        value={consumerNumber}
        onChange={(e) => setConsumerNumber(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={fetchBill}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Fetch Bill
      </button>

      {billData && (
        <div className="mt-6 border p-4 rounded">
          <p><strong>Name:</strong> {billData.customerName}</p>
          <p><strong>Board:</strong> {billData.boardName}</p>
          <p><strong>Amount:</strong> ₹{billData.amount}</p>
          <p><strong>Due Date:</strong> {billData.dueDate}</p>

          <button
            onClick={payBill}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Pay with Razorpay
          </button>
        </div>
      )}
    </div>
    </>
  );
}







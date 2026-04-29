"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Wallet {
  balance: number;
  accountNumber: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  created_at: string;
}

import {
  Smartphone,
  Zap,
  Droplets,
  Tv,
  Flame,
  ShieldCheck,
} from "lucide-react";

const services = [
  { title: "Mobile Recharge", icon: Smartphone },
  { title: "Electricity Bill", icon: Zap },
  { title: "Water Bill", icon: Droplets },
  { title: "DTH Recharge", icon: Tv },
  { title: "Gas Booking", icon: Flame },
  { title: "Insurance", icon: ShieldCheck },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchWallet();
    fetchTransactions();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/api/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddMoney = async () => {
    if (!amount) {
      return alert("Enter amount");
    }

    try {
      const { data } = await api.post("/api/create-order", {
        amount: Number(amount),
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "Wallet Recharge",
        description: "Add Money to Wallet",
        order_id: data.order.id,

        handler: async function (response: any) {
          try {
            await api.post("/api/verify-payment", {
              ...response,
              amount: Number(amount),
            });

            alert("Payment Successful");

            setAmount("");
            fetchWallet();
            fetchTransactions();
          } catch (error) {
            console.log(error);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "User",
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      alert("Failed to initiate payment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Wallet</h1>

        {/* Wallet Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>

          {wallet ? (
            <div className="space-y-2">
              <p>
                <strong>Account Number:</strong> {wallet.accountNumber}
              </p>

              <p className="text-2xl font-bold text-green-600">
                ₹{wallet.balance}
              </p>
            </div>
          ) : (
            <p>Loading wallet...</p>
          )}
        </div>

        {/* Add Money */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add Money</h2>

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded-xl px-4 py-2 w-full"
            />

            <button
              onClick={handleAddMoney}
              className="bg-black text-white px-6 py-2 rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

        {/* Recharge & Bill Payments */}
        

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recent Transactions
          </h2>

          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex justify-between border-b pb-2"
                >
                  <span>{txn.type}</span>

                  <span
                    className={
                      txn.amount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {txn.amount > 0 ? "+" : "-"} ₹
                    {Math.abs(txn.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p>No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
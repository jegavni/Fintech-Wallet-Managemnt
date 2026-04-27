"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Wallet {
  balance: number;
  accountNumber: string;
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
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddMoney = async () => {
    if (!amount) return alert("Enter amount");

    try {
      await api.post("/api/wallet/add-money", {
        amount: Number(amount),
      });

      alert("Money added successfully");
      setAmount("");
      fetchWallet();
    } catch (error) {
      console.log(error);
      alert("Failed to add money");
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
              <p><strong>Account Number:</strong> {wallet.accountNumber}</p>
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
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recharge & Bill Payments</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
              <div
                key={service.title}
                className="border rounded-2xl p-5 hover:shadow-md cursor-pointer transition"
              >
                <div className="mb-3">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-medium">{service.title}</h3>
              </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span>Mobile Recharge</span>
              <span>- ₹399</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Wallet Top-up</span>
              <span>+ ₹1000</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Electricity Bill</span>
              <span>- ₹850</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

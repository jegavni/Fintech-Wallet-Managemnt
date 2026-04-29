"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Smartphone,
  Zap,
  Wifi,
  Tv,
  Droplets,
  Flame,
  ShieldCheck,
  CreditCard,
  Wallet,
  Receipt,
  LogOut,
} from "lucide-react";

interface Transaction {
  id: number;
  type?: string;
  description?: string;
  amount: number;
  transaction_type: "credit" | "debit";
}

interface WalletData {
  balance: number;
}

const paymentTabs = [
  { title: "Mobile Recharge", icon: Smartphone, path: "/recharge" },
  { title: "Electricity", icon: Zap, path: "/electricity" },
  { title: "Broadband", icon: Wifi, path: "/broadband" },
  { title: "DTH", icon: Tv, path: "/dth" },
  { title: "Water Bill", icon: Droplets, path: "/water-bill" },
  { title: "Gas Booking", icon: Flame, path: "/gas-booking" },
  { title: "Insurance", icon: ShieldCheck, path: "/insurance" },
  { title: "Credit Card", icon: CreditCard, path: "/credit-card" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
const [amount, setAmount] = useState<string>("");


  useEffect(() => {
  const checkAuthAndLoad = async () => {
    try {
      const res = await fetch("/api/auth-check", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      // user is authenticated
      await loadDashboard();
    } catch (error) {
      console.log("Auth check failed:", error);
      router.push("/login");
    }
  };

  checkAuthAndLoad();
}, [router]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchWallet(), fetchTransactions()]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet");
      const data: WalletData = await res.json();

      if (!res.ok) {
        toast.error("Failed to fetch wallet");
        return;
      }

      setBalance(data.balance || 0);
    } catch (error) {
      console.log(error);
      toast.error("Wallet fetch failed");
    }
  };
  const handleLogout = async () => {
  try {
    const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Logout failed");
      return;
    }

    toast.success("Logged out successfully");
    router.push("/login");
  } catch (error) {
    console.log(error);
    toast.error("Logout failed");
  }
};

 const fetchTransactions = async () => {
  try {
    const res = await fetch("/api/transactions", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    console.log("Transactions API response:", data);
    if (!res.ok) {
      toast.error(data.message || "Failed to fetch transactions");
      return;
    }

    setTransactions(data.transactions || []);
    setBalance(data.wallet_balance || 0);
  } catch (error) {
    console.log(error);
    toast.error("Transaction fetch failed");
  }
};

  const handleAddMoney = async () => {
    try {
      toast.info("Creating payment order...");

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount:Number(amount),}),
      });

      const order = await res.json();

      if (!res.ok) {
        toast.error(order.message || "Order creation failed");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PayNest",
        description: "Wallet Top-up",
        order_id: order.id,
        handler: async () => {
          toast.success("Payment Successful");
          fetchWallet();
          fetchTransactions();
        },
        prefill: {
          name: "User",
          email: "user.email",
          contact: "9999999999",
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    }
  };

  const goToPage = (path: string, title?: string) => {
    if (title) toast.info(`Opening ${title}`);
    router.push(path);
  };

  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
<div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Dashboard</h1>

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
  >
    <LogOut className="w-5 h-5" />
    Logout
  </button>
</div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Available Balance</p>
              <h2 className="text-3xl font-bold">
                {loading ? "Loading..." : `₹${balance}`}
              </h2>
            </div>

          <div
      onClick={() => router.push("/wallet")}
      className="bg-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition"
    >
      <Wallet className="w-8 h-8" />
    </div>  
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleAddMoney}
              className="bg-black text-white px-5 py-2 rounded-xl"
            >
              Add Money
            </button>

            <button
              onClick={() => goToPage("/passbook")}
              className="border px-5 py-2 rounded-xl"
            >
              View Passbook
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-5">
            Recharge & Bill Payments
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paymentTabs.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  onClick={() => goToPage(item.path, item.title)}
                  className="border rounded-2xl p-5 cursor-pointer hover:shadow-md transition"
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>

            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <span>{tx.type || tx.description}</span>
                    <span>
                      {tx.transaction_type === "credit" ? "+" : "-"} ₹
                      {tx.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p>No recent transactions found</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Shortcuts</h2>

            <div className="space-y-3">
              <button
                onClick={() => goToPage("/statement")}
                className="w-full flex items-center gap-3 border rounded-xl p-3"
              >
                <Receipt className="w-5 h-5" />
                Download Statement
              </button>

              <button
                onClick={() => goToPage("/cards")}
                className="w-full flex items-center gap-3 border rounded-xl p-3"
              >
                <CreditCard className="w-5 h-5" />
                Manage Cards
              </button>

              <button
                onClick={() => goToPage("/wallet-settings")}
                className="w-full flex items-center gap-3 border rounded-xl p-3"
              >
                <Wallet className="w-5 h-5" />
                Wallet Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

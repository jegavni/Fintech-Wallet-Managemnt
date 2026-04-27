"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";
import { toast } from "react-toastify";

export default function RechargePage() {
  const router = useRouter();

  interface RechargePlan {
    id: number;
    operator: string;
    amount: number;
    validity: string;
    benefits: string;
  }

  const [mobileNumber, setMobileNumber] = useState("");
  const [operator, setOperator] = useState("");
  const [amount, setAmount] = useState("");

const [plans, setPlans] = useState<RechargePlan[] | []>([]);


useEffect(() => {
  if (operator) {
    fetchPlansByOperator();
  }
}, [operator]);

const fetchPlansByOperator = async () => {
  try {
    const res = await fetch(
      `/api/recharge-plans?operator=${operator}`
    );

    const data = await res.json();
    setPlans(data);
  } catch (error) {
    console.log(error);
  }
};



  const handleRecharge = async () => {
  if (!mobileNumber || !operator || !amount) {
    toast.error("Please fill all fields");
    return;
  }

  if (mobileNumber.length !== 10) {
    toast.error("Enter valid mobile number");
    return;
  }

  try {
    toast.info("Processing recharge...");

    const res = await fetch("/api/recharge-plans", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: 1, // dynamic from logged-in user
    type: "Mobile Recharge",
    description: `Recharge for ${mobileNumber} via ${operator}`,
    amount: Number(amount),
    transaction_type: "debit",
  }),
});

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Recharge failed");
      return;
    }

    toast.success("Recharge Successful");

    setMobileNumber("");
    setOperator("");
    setAmount("");
    setPlans([]);

    router.push("/dashboard");
  } catch (error) {
    console.log(error);
    toast.error("Recharge failed");
  }
};
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="w-8 h-8" />
          <h1 className="text-2xl font-bold">
            Mobile Recharge
          </h1>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"

          />

          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="">Select Operator</option>
            <option value="Jio">Jio</option>
            <option value="Airtel">Airtel</option>
            <option value="Vi">Vi</option>
            <option value="BSNL">BSNL</option>
          </select>

          <input
            type="number"
            placeholder="Enter Recharge Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
            
          />
          <div className="space-y-3">
  <h2 className="font-semibold">Popular Plans</h2>

  {plans.map((plan, index) => (
    <div
      key={index}
      onClick={() => setAmount(plan.amount.toString())}
      className="border rounded-xl p-4 cursor-pointer hover:bg-gray-50"
    >
      <div className="flex justify-between">
        <p className="font-semibold">₹{plan.amount}</p>
        <p>{plan.validity}</p>
      </div>

      <p className="text-sm text-gray-600 mt-1">
        {plan.benefits}
      </p>
    </div>
  ))}
</div>

          <button
            onClick={handleRecharge}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Proceed Recharge
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
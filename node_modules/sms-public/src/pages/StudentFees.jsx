import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/student/fees", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setFees(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">My Fees</h2>

      <table className="w-full mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">Month</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {fees.map(fe => (
            <tr key={fe.fee_id} className="border-t">
              <td className="p-3">{new Date(fe.due_date).toLocaleDateString()}</td>
              <td className="p-3">Rs. {fe.amount}</td>
              <td className="p-3">{fe.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

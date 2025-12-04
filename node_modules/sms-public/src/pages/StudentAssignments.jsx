import { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiCheckCircle, FiClock, FiFileText } from "react-icons/fi";

const seed = [
  { id: 1, title: "Math Homework", due: "2025-10-01", status: "Pending" },
  { id: 2, title: "Science Project", due: "2025-10-05", status: "Submitted" },
  { id: 3, title: "English Essay", due: "2025-10-08", status: "Pending" },
];

export default function StudentAssignments() {
  const [items, setItems] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", due: "", status: "Pending" });

  const add = (e) => {
    e.preventDefault();
    setItems(prev => [{ id: Date.now(), ...form }, ...prev]);
    setOpen(false);
    setForm({ title: "", due: "", status: "Pending" });
  };

  const Column = ({ name, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} text-white`}>{icon}</span>
        <h4 className="font-semibold">{name}</h4>
      </div>
      <div className="space-y-3">
        {items.filter(i => (name === "Submitted" ? i.status === "Submitted" : i.status !== "Submitted"))
              .filter(i => (name === "Pending" ? i.status === "Pending" : name === "In Progress" ? i.status === "In Progress" : true))
              .map(it => (
          <motion.div key={it.id} layout initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="font-medium">{it.title}</div>
            <div className="text-sm text-gray-500">Due: {it.due}</div>
            <div className="mt-1">
              <span className={`text-xs px-2 py-1 rounded ${it.status==="Submitted" ? "bg-emerald-100 text-emerald-700"
                : it.status==="In Progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 dark:bg-slate-700"}`}>
                {it.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assignments</h3>
        <button onClick={()=>setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <FiPlus/> New
        </button>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <Column name="Pending" icon={<FiFileText/>} color="bg-blue-500" />
        <Column name="In Progress" icon={<FiClock/>} color="bg-amber-500" />
        <Column name="Submitted" icon={<FiCheckCircle/>} color="bg-emerald-500" />
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setOpen(false)}/>
          <motion.form
            onSubmit={add}
            initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}}
            className="relative mx-auto mt-24 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6"
          >
            <h4 className="font-semibold mb-4">Create Assignment</h4>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700" placeholder="Title"
                     value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
              <input type="date" className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
                     value={form.due} onChange={e=>setForm({...form, due:e.target.value})}/>
              <select className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-700"
                      value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Submitted</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setOpen(false)} className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-700">Cancel</button>
                <button className="px-4 py-2 rounded bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Save</button>
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}

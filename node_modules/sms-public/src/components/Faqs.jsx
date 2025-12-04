import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {q:"Is this a full system?", a:"Currently public site + login UI. Backend coming next."},
  {q:"Which stack is used?", a:"React frontend, Node.js backend, PostgreSQL database."},
  {q:"Can I login as Admin?", a:"Roles will auto-detect later. Now UI-only login."}
]

export default function Faqs(){
  const [open,setOpen] = useState(null)
  return (
    <section id="faqs" className="bg-white py-20">
      <div className="container-max">
        <h2 className="text-3xl font-bold text-slate-800">FAQs</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f,i)=>(
            <motion.div
              key={i}
              className="card p-5 cursor-pointer hover:shadow-md"
              initial={{ y:30, opacity:0 }}
              whileInView={{ y:0, opacity:1 }}
              transition={{ duration:0.5, delay:i*0.1 }}
              viewport={{ once:false, amount:0.3 }}
              onClick={()=>setOpen(open===i?null:i)}
            >
              <p className="font-medium text-slate-700">{f.q}</p>
              <AnimatePresence>
                {open===i && (
                  <motion.p
                    className="text-gray-600 mt-2"
                    initial={{ height:0, opacity:0 }}
                    animate={{ height:"auto", opacity:1 }}
                    exit={{ height:0, opacity:0 }}
                  >
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

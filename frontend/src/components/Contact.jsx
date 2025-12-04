import { motion } from 'framer-motion'
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa'

export default function Contact(){
  return (
    <section id="contact" className="bg-gray-50 py-20">
      <div className="container-max grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ x:-40, opacity:0 }} 
          whileInView={{ x:0, opacity:1 }} 
          transition={{ duration:0.6 }}
          viewport={{ once:false, amount:0.3 }}
          className="card p-6"
        >
          <h3 className="text-2xl font-semibold text-slate-800">Contact Us</h3>
          <form className="mt-6 space-y-4" onSubmit={e=>e.preventDefault()}>
            <input className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-accent" placeholder="Your name"/>
            <input type="email" className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-accent" placeholder="you@example.com"/>
            <textarea rows="4" className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-accent" placeholder="Message"/>
            <button className="btn btn-primary w-full">Send Message</button>
          </form>
        </motion.div>
        <motion.div 
          initial={{ x:40, opacity:0 }} 
          whileInView={{ x:0, opacity:1 }} 
          transition={{ duration:0.6 }}
          viewport={{ once:false, amount:0.3 }}
          className="grid gap-4"
        >
          {[ 
            [FaMapMarkerAlt,"Office","Kathmandu, Nepal"],
            [FaPhoneAlt,"Phone","+977-98XXXXXXXX"],
            [FaEnvelope,"Email","support@smartschool.edu"]
          ].map(([I,t,v],i)=>(
            <div key={i} className="card p-4 flex gap-3 items-center hover:shadow-md">
              <I className="text-accent text-xl"/>
              <div>
                <p className="font-medium text-slate-700">{t}</p>
                <p className="text-gray-600 text-sm">{v}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

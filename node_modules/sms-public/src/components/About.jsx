import { motion } from 'framer-motion'
import { FaShieldAlt, FaCloud, FaMobileAlt } from 'react-icons/fa'

export default function About(){
  return (
    <section id="about" className="section bg-gray-50">
      <div className="container-max grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left text */}
        <motion.div 
          initial={{ x:-40, opacity:0 }} 
          whileInView={{ x:0, opacity:1 }} 
          transition={{ duration:0.6 }}
          viewport={{ once:false, amount:0.3 }}
        >
          <h2 className="text-3xl font-bold text-slate-800">About Smart School</h2>
          <p className="text-gray-600 mt-3">
            Smart School is a modern management system that simplifies operations
            and connects administrators, teachers, students and parents in one platform.
          </p>
          
        </motion.div>

        {/* Right features */}
        <motion.div 
          className="grid sm:grid-cols-3 gap-4"
          initial={{ y:40, opacity:0 }} 
          whileInView={{ y:0, opacity:1 }} 
          transition={{ duration:0.6, delay:0.2 }}
          viewport={{ once:false, amount:0.3 }}
        >
          {[ 
            [FaShieldAlt,"Secure","RBAC & data safety"],
            [FaCloud,"Scalable","Cloud-ready"],
            [FaMobileAlt,"Responsive","All devices"]
          ].map(([I,t,d])=>(
            <div key={t} className="card p-5 hover:shadow-md transition">
              <I className="text-accent text-2xl"/>
              <h4 className="font-semibold mt-2 text-slate-700">{t}</h4>
              <p className="text-sm text-gray-500">{d}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

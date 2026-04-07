import { motion } from 'framer-motion'
import bgImage from '../assets/hero-bg.png' // your provided background image

export default function Hero(){
  return (
    <section 
      id="hero" 
      className="relative bg-cover bg-center py-20 text-white"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative container-max grid md:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left text */}
        <motion.div 
          initial={{ x:-40, opacity:0 }} 
          whileInView={{ x:0, opacity:1 }} 
          transition={{ duration:0.6 }}
          viewport={{ once:false, amount:0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Manage your school with clarity.
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            All essentials—attendance, results, fees, content & notices—in one place.
          </p>
        </motion.div>

        {/* Right highlights */}
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ y:40, opacity:0 }}
          whileInView={{ y:0, opacity:1 }}
          transition={{ duration:0.6 }}
          viewport={{ once:false, amount:0.3 }}
        >
          {[
            ["Students","2,450+"],
            ["Teachers","120"],
            ["24/7 Access","Anytime"],
            ["Secure System","Data Safe"]
          ].map(([label,val])=>(
            <div 
              key={label} 
              className="backdrop-blur-sm bg-white/80 p-5 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <p className="text-gray-700 text-sm">{label}</p>
              <p className="text-2xl font-semibold text-orange-500 mt-1">{val}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

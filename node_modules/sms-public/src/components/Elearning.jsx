import { motion } from 'framer-motion'
export default function Elearning(){
  const slides = [1,2,3,4].map(n=>(`/src/assets/feat${(n%6)||6}.svg`))
  return (
    <section id="elearn" className="bg-gray-50 py-20">
      <div className="container-max">
        <h2 className="text-3xl font-bold text-slate-800">E-Learning Preview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {slides.map((s,i)=>(
            <motion.div
              key={i}
              className="card overflow-hidden hover:shadow-md transition"
              initial={{ scale:0.9, opacity:0 }}
              whileInView={{ scale:1, opacity:1 }}
              transition={{ duration:0.5, delay:i*0.1 }}
              viewport={{ once:false, amount:0.3 }}
            >
              <img src={s} alt="Preview" className="w-full h-32 object-cover"/>
              <div className="p-4">
                <p className="font-medium text-slate-700">Chapter {i+1}</p>
                <p className="text-gray-600 text-sm">Sample notes & slides</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

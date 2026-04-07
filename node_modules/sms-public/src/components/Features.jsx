import { motion } from 'framer-motion'

const items = [
  {title:'Attendance', desc:'Daily roll-call & reports', icon:'📋'},
  {title:'Results', desc:'Marks entry & transcripts', icon:'📈'},
  {title:'Fees', desc:'Invoices & receipts', icon:'💳'},
  {title:'Contents', desc:'Notes, slides & videos', icon:'📚'},
  {title:'Notices', desc:'Announcements & circulars', icon:'📣'},
  {title:'Timetable', desc:'Schedules & clash detection', icon:'🗓️'}
]

export default function Features(){
  return (
    <section id="features" className="bg-white py-20">
      <div className="container-max">
        <h2 className="text-3xl font-bold text-slate-800">Features Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {items.map((f,i)=>(
            <motion.div
              key={f.title}
              className="card p-6 hover:shadow-md transition"
              initial={{ y:40, opacity:0 }}
              whileInView={{ y:0, opacity:1 }}
              transition={{ duration:0.5, delay:i*0.1 }}
              viewport={{ once:false, amount:0.3 }}
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-semibold text-lg mt-3 text-slate-700">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

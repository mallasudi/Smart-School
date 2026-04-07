import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa"

export default function Footer(){
  return (
    <footer className="bg-animated text-white">
      <div className="container-max py-10 grid md:grid-cols-3 gap-8">
        
        {/* About */}
        <div>
          <h3 className="text-xl font-bold">Smart School</h3>
          <p className="text-white/80 mt-3 text-sm leading-relaxed">
            A modern School Management System designed to connect administrators, 
            teachers, students, and parents — all in one platform.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li><a href="#about" className="hover:text-emerald-300 transition">About</a></li>
            <li><a href="#features" className="hover:text-emerald-300 transition">Features</a></li>
            <li><a href="#elearn" className="hover:text-emerald-300 transition">E-Learning</a></li>
            <li><a href="#faqs" className="hover:text-emerald-300 transition">FAQs</a></li>
            <li><a href="#contact" className="hover:text-emerald-300 transition">Contact</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4">
            {[
              [FaFacebookF,"https://facebook.com"],
              [FaTwitter,"https://twitter.com"],
              [FaInstagram,"https://instagram.com"],
              [FaLinkedinIn,"https://linkedin.com"]
            ].map(([I,link],i)=>(
              <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-400 transition">
                <I className="text-lg"/>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black/20 text-center py-4 text-white/80 text-sm">
        © {new Date().getFullYear()} Smart School. All rights reserved.
      </div>
    </footer>
  )
}

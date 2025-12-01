import { FaLinkedin, FaFacebook, FaTwitterSquare, FaInstagramSquare } from 'react-icons/fa';
import { ArrowRight,Mail,Phone } from 'lucide-react';
import { Link } from'react-router';

const Footer = () => {

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src='https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/hritlogo2_qi3sqv.jpg' alt="HRIT" className="h-12 w-12 rounded-xl" />
                <div>
                  <div className="font-bold text-lg">RSD Hostel</div>
                  <div className="text-sm text-gray-400">HRIT University</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Providing premium student accommodation with modern amenities and a supportive community environment.
              </p>

              {/* Social Media Links  */}
                <div className="text-gray-300 w-10 h-10 rounded-lg flex gap-4 items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer ml-15">
                   <div>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                       <FaFacebook size={30} />
                      </a>
                    </div>

                    <div>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                       <FaLinkedin size={30} />
                      </a>
                    </div>
                    
                    <div>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                       <FaTwitterSquare size={30} />
                      </a>
                    </div>

                    <div>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                       <FaInstagramSquare size={30} />
                      </a>
                    </div>  
                  </div>
                </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {['Home', 'Leadership', 'Facilities', 'Fees', 'Gallery', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'FAQ', 'Contact Support'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-bold text-lg mb-6">Newsletter</h3>
              <p className="text-gray-400 mb-4">Subscribe to get updates on events and announcements.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Subscribe
                </button>
              </div>

              <div>
                <Link to='admin/login' >
                <button className="border-2 cursor-pointer px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors hover:bg-violet-500 m-4">
                  Admin Login
                </button>
                </Link>
              </div>
            </div>
          </div>
 
          {/* All Rights Reservered Section  */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} RSD Hostel. All rights reserved. | 
              Designed with ❤️ for students
            </div>
          </div>
        </div>
      </footer>
    )
}

export default Footer;
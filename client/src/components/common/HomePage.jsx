import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router';
import axiosClient from '../../config/axiosClient';
import { LogIn, UserPlus, Utensils, MapPin, Star, Wifi, Shield, Dumbbell, Users } from 'lucide-react';
import {  MESS_TIMINGS, LEADERCARD_DATA } from '../../../constants';
import Contact from '../../utils/contactForm';
import Facilities from '../../components/homePage/facilities';
import FEES from '../../components/homePage/feesFacility';
import GallerySection from '../../components/homePage/gallery';
import Footer from '../../components/homePage/footer';


const HomePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Here we fetch the weekly menu data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get('/menu/show');
        setMenuData(response.data || []);
      } catch (e) {
        setMenuData([]);
      }
    };
    fetchData();
  }, []);

  // this is the Leadership Card component
  const LeadershipCard = ({ image, name, title, quote }) => (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl p-6 text-center group transition-all duration-300"
    >
      <div className="relative inline-block mb-4">
        <img src={image} alt={name} className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-lg group-hover:border-primary-100 transition-colors" />
        <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-2 rounded-full">
          <Users className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
      <p className="text-primary-600 font-medium mb-3">{title}</p>
      <p className="text-gray-600 text-sm leading-relaxed italic">"{quote}"</p>
    </motion.div>
  );


 const Navbar = () => {
              const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src='https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/hritlogo2_qi3sqv.jpg' 
              alt="HRIT" 
              className="h-12 w-12 rounded-xl object-cover shadow-sm border border-gray-200" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-gray-900">RSD Girls & Boys HOSTEL</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              HRIT University Ghaziabad
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {['Leadership', 'Facilities', 'Fees', 'Mess', 'Gallery', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToId(item.toLowerCase())}
              className="cursor-pointer text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 relative py-2"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Student Login
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
            >
              New Registration
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute left-0 top-1 w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                mobileOpen ? 'rotate-45 top-3' : ''
              }`}></span>
              <span className={`absolute left-0 top-3 w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`absolute left-0 top-5 w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                mobileOpen ? '-rotate-45 top-3' : ''
              }`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {['Leadership', 'Facilities', 'Fees', 'Mess', 'Gallery', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToId(item.toLowerCase())}
                className="w-full text-left py-3 px-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                {item}
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link 
                to="/login" 
                className="block text-center py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors duration-200"
              >
                Student Login
              </Link>
              <Link 
                to="/register" 
                className="block text-center py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200"
              >
                New Registration
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

  const SectionWrapper = ({ id, children, className = "" }) => (
    <section id={id} className={`py-20 ${className}`}>
      <div className="container mx-auto px-6">
        {children}
      </div>
    </section>
  );

  return (
    <div className="bg-linear-to-br from-gray-50 to-blue-50 min-h-screen">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-primary-500 to-primary-600 origin-left z-50 shadow-lg"
        style={{ scaleX }}
      />
      
      <Navbar />
      
      <main className="pt-16">
        {/* Enhanced Hero Section */}
        {/* <SectionWrapper id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" > */}
          <section id='home' className=" relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background with modern gradient overlay */}
  <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 z-0" />
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-20"
    style={{ backgroundImage: `url(https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/hostelPhoto_y8m1yl.jpg)` }}
  />
  
  {/* Subtle grid pattern */}
  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size:64px_64px] mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
  
  <div className="relative z-10 container mx-auto px-6 py-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Text Content */}
      <div className="text-white space-y-8">
        {/* Badge & Rating */}
        <div className="flex items-center gap-4">
          <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
            PREMIUM HOSTEL
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-current" />
            ))}
          </div>
        </div>
        
        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="block text-white">Your Home</span>
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              Away From Home
            </span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
            Experience premium student living with modern amenities, secure environment, 
            and a vibrant community at HRIT University campus.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Wifi, label: 'High-Speed WiFi' },
            { icon: Shield, label: '24/7 Security' },
            { icon: Dumbbell, label: 'Fitness Center' },
            { icon: Utensils, label: 'Quality Mess' }
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
              <feature.icon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            Start Your Journey
          </Link>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            Student Portal
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src='https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/hostelPhoto_y8m1yl.jpg' 
            alt="Modern Hostel Facilities" 
            className="w-150px h-150px object-cover" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/30 to-transparent" />
        </div>
        
        {/* Stats Cards - Modern Placement */}
        <div className="flex justify-center gap-6 mt-8">
          <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[120px]">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-sm text-slate-300">Happy Students</div>
          </div>
          <div className="text-center bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-6 min-w-[120px]">
            <div className="text-2xl font-bold text-white">4.8/5</div>
            <div className="text-sm text-white/90">Rating</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Modern Scroll Indicator */}
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
    <div className="text-center">
      <div className="text-sm text-slate-400 mb-3">Scroll to explore</div>
      <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center mx-auto">
        <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-bounce" />
      </div>
    </div>
  </div>
          </section>
        {/* </SectionWrapper> */}

        {/* Leadership Section */}
        <SectionWrapper id="leadership" className="bg-black/5">
  <div className="text-center mb-16">
    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
      Meet Our <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Visionary Leaders</span>
    </h2>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Dedicated professionals committed to creating the best student living experience
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {LEADERCARD_DATA.map((leader, index) => (
      <div 
        key={leader.name}
        className="group bg-white rounded-2xl transition-all duration-300 border  overflow-hidden"
      >
        <LeadershipCard {...leader} />
      </div>
    ))}
  </div>
        </SectionWrapper>

        
        {/* Facilities Section */}
        <SectionWrapper id="facilities" className="bg-linear-to-br from-gray-100 to-gray-200">
          <Facilities />
        </SectionWrapper>

        {/* Fees Section */}
        <SectionWrapper id="fees" className="bg-linear-to-br from-blue-50 to-indigo-50">
          <FEES />
        </SectionWrapper>

        {/* Mess Section */}
        <SectionWrapper id="mess" className="bg-linear-to-br from-orange-100 to-gray-100">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Utensils className="w-4 h-4" />
                DINING
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Mess & <span className="text-orange-600">Dining</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Healthy, hygienic, and delicious meals served daily
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Mess Timings */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-3 h-8 bg-orange-500 rounded-full"></div>
                  Mess Timings
                </h3>
                <div className="space-y-4">
                  {MESS_TIMINGS.map((timing, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{timing.meal}</div>
                          <div className="text-sm text-gray-600">{timing[timing.meal.toLowerCase()]}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Food Menu */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-3 h-8 bg-orange-500 rounded-full"></div>
                  Weekly Menu
                </h3>
                
                <div className="overflow-hidden">
                  <div className="hidden md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-orange-200">
                          <th className="text-left pb-4 font-semibold text-gray-900">Day</th>
                          {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(meal => (
                            <th key={meal} className="pb-4 font-semibold text-gray-900 text-center">{meal}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {menuData.map((day) => (
                          <tr key={day.days} className="border-b border-orange-100 last:border-0">
                            <td className="py-4 font-semibold text-gray-900">{day.days}</td>
                            {['Breakfast','Lunch','Snack','Dinner'].map(meal => {
                              const item = day.mealAndItem?.find(m => m.meal.toLowerCase() === meal.toLowerCase());
                              return (
                                <td key={meal} className="py-4 text-center text-gray-700">
                                  {item?.itemName ?? '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden space-y-4">
                    {menuData.map(day => (
                      <div key={day.days} className="bg-orange-50 p-4 rounded-xl">
                        <div className="font-bold text-gray-900 mb-3 text-lg">{day.days}</div>
                        <div className="grid grid-cols-2 gap-3">
                          {['Breakfast','Lunch','Snack','Dinner'].map(meal => {
                            const item = day.mealAndItem?.find(m => m.meal.toLowerCase() === meal.toLowerCase());
                            return (
                              <div key={meal} className="bg-white p-3 rounded-lg">
                                <div className="text-xs text-orange-600 font-semibold mb-1">{meal}</div>
                                <div className="text-sm font-medium text-gray-900">{item?.itemName ?? '-'}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </SectionWrapper>

        {/* Gallery Section */}
        <SectionWrapper id="gallery" className="bg-gray-100">
          <GallerySection />
        </SectionWrapper>

        {/* Contact Section */}
        <SectionWrapper id="contact" className="bg-linear-to-br from-gray-900 to-indigo-200 text-white">
           <Contact />
        </SectionWrapper>
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
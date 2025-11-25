import room1 from "../../assests/HostelImages/room1.png";
import room2 from "../../assests/HostelImages/room2.png";
import room3 from "../../assests/HostelImages/room3.png";
import room4 from "../../assests/HostelImages/room4.png";
import hostelGallary from "../../assests/HostelImages/hostelGallary.png";
import { motion } from "framer-motion";

const GallerySection = () => {
  const galleryItems = [
    {
      src: room1,
      title: "Premium Single Room",
      description: "Spacious single room with study desk and natural lighting"
    },
    {
      src: room2,
      title: "Comfortable Double Room",
      description: "Shared room perfect for students with modern amenities"
    },
    {
      src: room3,
      title: "Study Lounge",
      description: "Quiet study area with high-speed internet and comfortable seating"
    },
    {
      src: room4,
      title: "Recreational Space",
      description: "Common area for relaxation and social activities"
    },
    {
      src: hostelGallary,
      title: "Campus Overview",
      description: "Beautiful view of our hostel campus and surroundings"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Hostel <span className="text-blue-600">Glimpses</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience our modern facilities and vibrant campus life through these curated spaces
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-200 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <button className="bg-white text-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2">
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Always visible title */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 mb-1">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-1">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg">
            View All Photos
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;
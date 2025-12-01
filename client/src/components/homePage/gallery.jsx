
import { motion } from "framer-motion";

const GallerySection = () => {
  const galleryItems = [
    {
      src: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/room3_rusyhr.jpg',
      title: "Premium Single Room",
      description: "Spacious single room with study desk and natural lighting"
    },
    {
      src: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/room1_zvj8yx.jpg',
      title: "Comfortable Double Room",
      description: "Shared room perfect for students with modern amenities"
    },
    {
      src: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606074/room2_hkgiph.jpg',
      title: "Study Lounge",
      description: "Quiet study area with high-speed internet and comfortable seating"
    },
    {
      src: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606073/hostelGallary_jmdvsb.jpg',
      title: "Recreational Space",
      description: "Common area for relaxation and social activities"
    },
    {
      src: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606561/room4_yrbhmk.jpg',
      title: "Campus Overview",
      description: "Beautiful view of our hostel campus and surroundings"
    }
  ];

  return (
    <section className="py-16">
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
              className="group relative bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-400"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
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
      </div>
    </section>
  );
};

export default GallerySection;
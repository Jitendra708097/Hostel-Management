
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { DUMMY_FACILITIES } from '../../../constants';
const FacilityCard = ({ icon: Icon, name }) => (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gray-300 rounded-xl p-6 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300"
    >
      <div className="bg-linear-to-br from-primary-500 to-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary-600 group-hover:to-primary-700 transition-all">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="font-bold text-gray-600 mb-2">{name}</h3>
      {/* <p className="text-gray-600 text-sm leading-relaxed">{description}</p> */}
    </motion.div>
  );



const Facilities = () => {

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-600 mb-4">
              World-Class <span className="text-primary-600">Facilities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for a comfortable and productive student life
            </p>
        </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {DUMMY_FACILITIES.map((facility, index) => (
              <motion.div
                key={facility.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FacilityCard {...facility} />
              </motion.div>
            ))}
          </div>
    </>
    )
}

export default Facilities
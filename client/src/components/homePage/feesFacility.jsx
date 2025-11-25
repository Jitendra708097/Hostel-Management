import { DUMMY_FEE_TIERS } from "../../../constants";
import { CheckCircle } from "lucide-react";
import { motion } from 'framer-motion';

const FEES = ( ) => {


    return (
        <>
        <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                      Hostel Room's <span className="text-primary-600">Charge</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Choose the perfect plan that fits your needs and budget
                    </p>
                  </motion.div>
        
                  <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {DUMMY_FEE_TIERS.map((tier, index) => (
                        <motion.div
                          key={tier.type}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 }}
                          className={`relative rounded-2xl p-8 border-2 transition-all duration-300 border-gray-200 bg-white shadow-lg hover:shadow-xl`}
                        >
                          
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{tier.type}</h3>
                          <div className="mb-6">
                            <span className="text-4xl font-extrabold text-primary-600">₹{tier.price.toLocaleString()}</span>
                            <span className="text-gray-600">/academic year</span>
                          </div>
                          
                          <ul className="space-y-4 mb-8">
                            {tier.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center gap-3">
                                <CheckCircle className='text-green-400 w-5 h-5' />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <button className={`w-full py-3 rounded-xl font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200`}>
                            Choose Plan
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
        </>
    )
}

export default FEES;
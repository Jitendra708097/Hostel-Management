// In this I am using a EmailJS service for contact us form which 
// send user information to me contact purpose


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().min(1, 'Message is required'),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        data,
        import.meta.env.VITE_EMAILJS_USER_ID
      );
      setIsSuccess(true);
      reset();
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Get In <span className="text-primary-400">Touch</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to begin your journey? We're here to help with any questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-full">
                <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-300 text-center">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        First Name <span className="text-red-400 font-extrabold text-md pl-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        {...register('firstName')}
                        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-500 focus:ring-red-200' : ''
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName?.message && (
                        <span className="text-red-400 text-sm mt-1">{errors.firstName?.message}</span>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name <span className="text-gray-300 text-md font- pl-0.5">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        {...register('lastName')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address <span className="text-red-400 font-extrabold text-md pl-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : ''
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email?.message && <span className="text-red-400 text-sm mt-1">{errors.email?.message}</span>}
                  </div>
                  
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number <span className="text-red-400 font-extrabold text-md pl-0.5">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500 focus:ring-red-200' : ''
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone?.message && <span className="text-red-400 text-sm mt-1">{errors.phone?.message}</span>}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message <span className="text-red-400 font-extrabold text-md pl-0.5">*</span>
                    </label>
                    <textarea
                      rows="4"
                      id="message"
                      {...register('message')}
                      className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.message ? 'border-red-500 focus:ring-red-200' : ''
                      }`}
                      placeholder="Tell us about your inquiry..."
                    ></textarea>
                    {errors.message?.message && (
                      <span className="text-red-400 text-sm mt-1">{errors.message?.message}</span>
                    )}
                  </div>

                  {/* Send Message button */}
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cursor-pointer w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg text-lg font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.005]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                          Sending...
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Connection Image */}
          <div className="flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="A visual representation of digital connections and communication"
              className="w-full h-auto max-w-lg"
            />
          </div>
        </div>
      </div>
  );
};

export default Contact;
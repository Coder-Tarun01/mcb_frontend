import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Users,
  Headphones,
  CheckCircle
} from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
      
      const response = await fetch(`${API_BASE_URL}/email/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          inquiryType: formData.inquiryType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      if (data.success) {
        toast.success(data.message || 'Message sent successfully!');
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            inquiryType: 'general'
          });
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to send message. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@mycareerbuild.com', 'support@mycareerbuild.com'],
      description: 'Send us an email anytime'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: [
        {
          label: 'Address 1:-',
          value: 'Plot No 77, Ground Floor, GCC Layout, Kommadi 100 Feet Rd, Gandhi Nagar, Madhurawada, 530048, Visakhapatnam, Andhra Pradesh, India'
        },
        {
          label: 'Address 2:-',
          value: '10057 Conquistador Ct, Frisco, TX 75035, USA'
        }
      ],
      description: 'Come say hello at our office'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM'],
      description: 'We\'re here to help'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"dots\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"rgba(59, 130, 246, 0.1)\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23dots)\"/></svg>')"}}></div>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-500 to-blue-400 py-14 sm:py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"rgba(255,255,255,0.05)\"/><circle cx=\"10\" cy=\"60\" r=\"0.5\" fill=\"rgba(255,255,255,0.05)\"/><circle cx=\"90\" cy=\"40\" r=\"0.5\" fill=\"rgba(255,255,255,0.05)\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')"}}></div>
        
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-shadow-lg bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent text-white">
              Get in <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl opacity-95 max-w-3xl mx-auto leading-relaxed font-normal text-white text-shadow-md">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-16 items-start">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl shadow-black/8 border border-white/30 relative overflow-hidden order-2 xl:order-1"
            >
              {/* Top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              
              <h2 className="text-4xl font-bold text-slate-800 mb-4 leading-tight bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Contact Information
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed font-normal">
                Choose your preferred way to reach us
              </p>

              <div className="grid gap-6 mb-12">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="flex items-start gap-5 p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-blue-500/8 transition-all duration-400 relative overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/12 hover:border-blue-500/25 group"
                  >
                    {/* Top border effect */}
                    <div className="absolute top-0 left-0 right-0 h-0.75 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
                    
                    <div className="w-12.5 h-12.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {info.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {info.description}
                      </p>
                      <div className="flex flex-col gap-1">
                        {info.details.map((detail, idx) => {
                          if (typeof detail === 'string') {
                            return (
                              <span key={idx} className="text-sm text-gray-700 font-medium">
                                {detail}
                              </span>
                            );
                          }
                          return (
                            <span key={idx} className="text-sm text-gray-700 font-medium">
                              <span className="block font-semibold text-slate-800">{detail.label}</span>
                              {detail.value}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 py-6 px-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-white">Live Chat</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 py-6 px-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
                  >
                    <Headphones className="w-5 h-5" />
                    <span className="text-white">Schedule Call</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 py-6 px-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-white">Join Community</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl shadow-black/8 border border-white/30 relative overflow-hidden order-1 xl:order-2"
            >
              {/* Top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              
              <div className="w-full">
                <h2 className="text-3xl font-extrabold text-slate-800 mb-3 leading-tight">
                  Send us a Message
                </h2>
                <p className="text-base text-slate-500 mb-8 leading-relaxed">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 px-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl"
                  >
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 block" />
                    <h3 className="text-2xl font-bold mb-3">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-base opacity-90">
                      Thank you for contacting us. We'll get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="py-5 px-5 border-2 border-slate-200 rounded-xl text-base transition-all duration-400 bg-gradient-to-br from-white to-slate-50 font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/15 focus:-translate-y-0.5"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="py-5 px-5 border-2 border-slate-200 rounded-xl text-base transition-all duration-400 bg-gradient-to-br from-white to-slate-50 font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/15 focus:-translate-y-0.5"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="inquiryType" className="text-sm font-semibold text-gray-700">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="py-5 px-5 border-2 border-slate-200 rounded-xl text-base transition-all duration-400 bg-gradient-to-br from-white to-slate-50 font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/15 focus:-translate-y-0.5"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="py-5 px-5 border-2 border-slate-200 rounded-xl text-base transition-all duration-400 bg-gradient-to-br from-white to-slate-50 font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/15 focus:-translate-y-0.5"
                        placeholder="What's this about?"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="py-5 px-5 border-2 border-slate-200 rounded-xl text-base transition-all duration-400 bg-gradient-to-br from-white to-slate-50 font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/15 focus:-translate-y-0.5 resize-y min-h-30 font-inherit"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className="flex items-center justify-center gap-3 py-5 px-10 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none rounded-2xl text-lg font-semibold cursor-pointer transition-all duration-400 mt-6 relative overflow-hidden shadow-lg shadow-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 hover:left-full"></div>
                      
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span className="text-white">Send Message</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-500 py-24 text-white">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-5xl font-black mb-4 leading-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto text-white">
              Can't find what you're looking for? Contact us directly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <h3 className="text-xl font-bold mb-4 text-white">
                  How quickly do you respond?
                </h3>
                <p className="text-base leading-relaxed opacity-90 text-blue-100">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <h3 className="text-xl font-bold mb-4 text-white">
                  How can I reach you?
                </h3>
                <p className="text-base leading-relaxed opacity-90 text-blue-100">
                  You can reach us via email or by visiting our office during business hours. We also offer live chat support.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Can I schedule a meeting?
                </h3>
                <p className="text-base leading-relaxed opacity-90 text-blue-100">
                  Absolutely! Use our "Schedule Call" button above to book a convenient time.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Is there a live chat option?
                </h3>
                <p className="text-base leading-relaxed opacity-90 text-blue-100">
                  Yes, you can start a live chat session using the "Live Chat" button above.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

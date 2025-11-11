import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle, Target } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';

// Force white text on blue background
const blueSectionStyle = {
  color: 'white !important',
  '--tw-text-opacity': '1',
} as React.CSSProperties;

const Login: React.FC = () => {
  return (
    <>
      <style>{`
        .blue-section * {
          color: white !important;
        }
        .blue-section h1,
        .blue-section h2,
        .blue-section h3,
        .blue-section p,
        .blue-section span,
        .blue-section div {
          color: white !important;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Branding & Info */}
          <div className="blue-section bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 pt-4 pb-8 px-8 lg:pt-6 lg:pb-12 lg:px-12 flex items-start justify-center relative overflow-hidden min-h-[600px]" style={blueSectionStyle}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white relative z-10 max-w-md [&_*]:text-white"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6"
              >
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border border-white/30" style={{ color: 'white' }}>
                  Welcome Back
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white !text-white"
                style={{ color: 'white' }}
              >
                Sign In to Continue
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg text-white mb-8 leading-relaxed !text-white"
                style={{ color: 'white' }}
              >
                Access your saved jobs, track applications, and get personalized recommendations.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="space-y-4"
              >
                {[
                  { icon: CheckCircle, text: "Access your saved jobs" },
                  { icon: Target, text: "Track your applications" },
                  { icon: Check, text: "Get personalized recommendations" }
                ].map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      <IconComponent size={16} className="text-white" />
                    </div>
                    <span className="text-white font-medium text-sm !text-white" style={{ color: 'white' }}>{feature.text}</span>
                  </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12 flex items-center justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <LoginForm />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;

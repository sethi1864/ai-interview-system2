import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Users, 
  Clock, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Mic,
  Video,
  Brain,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import InterviewForm from './InterviewForm';
import LoadingSpinner from './LoadingSpinner';

// Services
import { startInterview } from '../services/apiService';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleStartInterview = async (formData) => {
    setIsStarting(true);
    try {
      const response = await startInterview(
        formData.candidateInfo, 
        formData.interviewType, 
        formData.avatarId
      );
      
      if (response.success) {
        toast.success('Interview started successfully!');
        navigate(`/interview/${response.data.interviewId}`);
      } else {
        toast.error(response.error || 'Failed to start interview');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleDemoMode = () => {
    setShowDemo(true);
    navigate('/demo');
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Interviews',
      description: 'Intelligent conversation with natural follow-up questions'
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Photorealistic Avatars',
      description: 'Human-like interviewers that candidates can\'t distinguish from real people'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Voice & Video',
      description: 'Real-time voice synthesis and speech recognition'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted communications'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Availability',
      description: 'Conduct interviews anytime, anywhere, without human limitations'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Results',
      description: 'Real-time scoring and comprehensive analytics'
    }
  ];

  const stats = [
    { label: 'Interviews Conducted', value: '10,000+' },
    { label: 'Success Rate', value: '95%' },
    { label: 'Time Saved', value: '80%' },
    { label: 'Cost Reduction', value: '87%' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director',
      company: 'TechCorp',
      content: 'This system has completely transformed our hiring process. Candidates can\'t tell they\'re talking to an AI!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      company: 'StartupXYZ',
      content: 'The quality of interviews is incredible. We\'ve hired better candidates in less time.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Recruitment Manager',
      company: 'GlobalTech',
      content: 'Finally, a solution that scales with our growth without compromising quality.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">AI Interview Pro</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={handleDemoMode}
                className="btn btn-outline"
              >
                Try Demo
              </button>
              <button className="btn btn-primary">
                Get Started
              </button>
            </motion.div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
                The Future of
                <span className="text-primary-600 block">Interviewing</span>
                is Here
              </h1>
              <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
                Experience the world's most advanced AI interview system. 
                Photorealistic avatars conduct interviews so naturally that 
                candidates can't distinguish them from human interviewers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('interview-form').scrollIntoView({ behavior: 'smooth' })}
                  className="btn btn-primary text-lg px-8 py-4"
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  Start Interview
                </button>
                <button
                  onClick={handleDemoMode}
                  className="btn btn-outline text-lg px-8 py-4"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Try Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-secondary-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>No setup required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Free trial available</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="avatar-container aspect-video">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">AI Interviewer</p>
                    <p className="text-sm opacity-90">Photorealistic & Intelligent</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-secondary-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Our AI interview system combines cutting-edge technology with 
              human-like interaction to deliver the most natural interview experience.
            </p>
          </motion.div>

          <div className="grid-responsive">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 hover:shadow-medium transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Form Section */}
      <section id="interview-form" className="py-20 bg-white">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
                Start Your Interview
              </h2>
              <p className="text-xl text-secondary-600">
                Fill in your details and begin your AI-powered interview experience
              </p>
            </div>
            
            <InterviewForm onSubmit={handleStartInterview} isLoading={isStarting} />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary-50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-secondary-600">
              Join thousands of companies already using AI Interview Pro
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-secondary-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-secondary-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary-900 text-white">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI Interview Pro</span>
              </div>
              <p className="text-secondary-300">
                The future of intelligent interviewing is here.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-secondary-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-secondary-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-secondary-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-300">
            <p>&copy; 2024 AI Interview Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Briefcase, GraduationCap, Loader } from 'lucide-react';

const InterviewForm = ({ onSubmit, isLoading }) => {
  const [selectedAvatar, setSelectedAvatar] = useState('sarah-professional-hr');
  const [interviewType, setInterviewType] = useState('mixed');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const avatars = [
    {
      id: 'sarah-professional-hr',
      name: 'Sarah',
      role: 'HR Professional',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'john-technical-lead',
      name: 'John',
      role: 'Technical Lead',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'priya-senior-hr',
      name: 'Priya',
      role: 'Senior HR Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'david-executive',
      name: 'David',
      role: 'Executive',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const interviewTypes = [
    { id: 'mixed', name: 'Mixed (Technical + Behavioral)', icon: '🎯' },
    { id: 'technical', name: 'Technical Focus', icon: '💻' },
    { id: 'behavioral', name: 'Behavioral Focus', icon: '🤝' },
    { id: 'executive', name: 'Executive Level', icon: '👔' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-8 years)' },
    { value: 'lead', label: 'Lead Level (9-12 years)' },
    { value: 'executive', label: 'Executive Level (12+ years)' }
  ];

  const onFormSubmit = (data) => {
    const candidateInfo = {
      ...data,
      experience: data.experience || 'mid'
    };

    onSubmit({
      candidateInfo,
      interviewType,
      avatarId: selectedAvatar
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className="input"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-error-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { 
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input"
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-error-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Position Applied For *
              </label>
              <input
                type="text"
                {...register('position', { 
                  required: 'Position is required',
                  minLength: { value: 2, message: 'Position must be at least 2 characters' }
                })}
                className="input"
                placeholder="e.g., Software Engineer, Product Manager"
              />
              {errors.position && (
                <p className="text-error-500 text-sm mt-1">{errors.position.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Experience Level *
            </label>
            <select
              {...register('experience')}
              className="select"
              defaultValue="mid"
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interview Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Interview Type
          </h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setInterviewType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  interviewType === type.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{type.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Choose Your Interviewer
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedAvatar === avatar.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                />
                <div className="font-medium text-secondary-900">{avatar.name}</div>
                <div className="text-sm text-secondary-600">{avatar.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary text-lg py-4"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Starting Interview...
              </>
            ) : (
              'Start Interview'
            )}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-sm text-secondary-500 text-center">
          By starting the interview, you agree to our privacy policy and consent to 
          audio/video recording for evaluation purposes.
        </div>
      </form>
    </motion.div>
  );
};

export default InterviewForm;
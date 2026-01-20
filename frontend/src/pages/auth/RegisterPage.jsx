import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, Mail, Lock, User, Loader2, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const passwordRequirements = [
    { text: 'At least 8 characters', test: (p) => p.length >= 8 },
    { text: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { text: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { text: 'One number', test: (p) => /\d/.test(p) },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordValid = passwordRequirements.every((req) => req.test(formData.password));
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/chat');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-secondary-900 to-secondary-950 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">AI Support</span>
        </Link>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Create your account
          </h1>
          <p className="text-lg text-secondary-300">
            Join thousands of users getting instant AI-powered support.
          </p>
        </div>

        <div className="space-y-4">
          {['Instant AI responses', 'Secure & encrypted', '24/7 availability', 'Chat history saved'].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-secondary-200">
              <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-400" />
              </div>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Support</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
          <p className="text-secondary-400 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a strong password"
                />
              </div>
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${
                      req.test(formData.password) ? 'text-green-400' : 'text-secondary-500'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="label">Account type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user', label: 'User', desc: 'Chat with AI' },
                  { value: 'admin', label: 'Admin', desc: 'Manage content' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.role === type.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-secondary-700 hover:border-secondary-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={type.value}
                      checked={formData.role === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-white">{type.label}</span>
                    <span className="text-xs text-secondary-400">{type.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            <p className="text-center text-xs text-secondary-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-400 hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

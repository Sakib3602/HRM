import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from './AuthProvider';
import { useAlert } from '../Alert/useAlert';
import Alert from '../Alert/Alert';


interface LoginFormValues {
  email: string;
  password: string;
}

const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { alert, showAlert, hideAlert } = useAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const mutationLogin = useMutation({
    mutationFn: async ({ email, password }: LoginFormValues) => {
      await login(email, password);
    },
    onSuccess: () => {
      showAlert({
        type: 'success',
        title: 'Welcome back',
        message: 'Login successful. Redirecting...',
        duration: 2,
      });
      setTimeout(() => navigate('/'), 1200);
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Login failed',
        message: 'Invalid email or password. Please try again.',
        duration: 4,
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutationLogin.mutate(data);
  };

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          duration={alert.duration}
          onClose={hideAlert}
        />
      )}

      <Navbar />

      <div className="min-h-screen flex bg-[#16161e] font-sans text-white">
        {/* Left Side - Image Panel */}
        <div
          className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')" }}
        >
          <div className="absolute inset-0 bg-[#16161e]/60 bg-linear-to-t from-[#16161e] to-transparent mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-purple-900/20"></div>

          <div className="relative z-10 flex justify-between items-center w-full">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl font-bold tracking-widest text-white">
                GENESYS<span className="text-purple-400 font-normal">HRM</span>
              </span>
            </div>
            <Link to="/">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-medium transition-colors">
                Back to website <FiArrowRight />
              </button>
            </Link>
          </div>

          <div className="relative z-10 mb-8">
            <h2 className="text-4xl lg:text-5xl font-medium leading-tight mb-6">
              Empowering Workforce,<br />Driving Success
            </h2>
            <div className="flex gap-2">
              <div className="w-6 h-1 bg-white rounded-full"></div>
              <div className="w-6 h-1 bg-white/30 rounded-full cursor-pointer hover:bg-white/50 transition-colors"></div>
              <div className="w-6 h-1 bg-white/30 rounded-full cursor-pointer hover:bg-white/50 transition-colors"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 bg-[#1e1e26]">
          <div className="w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-2">
              Welcome back
            </h1>
            <p className="text-gray-400 mb-8 text-sm sm:text-base">
              Log in to manage your team.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-[#2a2a35] border border-white/5 focus:border-purple-500 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-colors"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full bg-[#2a2a35] border border-white/5 focus:border-purple-500 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-colors pr-12"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={mutationLogin.isPending}
                className="w-full bg-[#7148fc] hover:bg-[#5e38d6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-lg transition-colors mt-4 shadow-lg shadow-purple-900/20"
              >
                {mutationLogin.isPending ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AuthPage;
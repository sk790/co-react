import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserCircle, Mail, LockKeyhole, Globe, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const SchoolRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    address: '',
    adminName: '',
    adminEmail: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate subdomain
    if (name === 'schoolName' && (!formData.subdomain || formData.subdomain === formData.schoolName.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
      const generatedSubdomain = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: value, subdomain: generatedSubdomain }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registration successful for ${formData.schoolName}! Redirecting to your new portal...`);
    
    // In production, this would be `.classorbit.com`
    // For local development, we use `.localhost:5173`
    const currentHost = window.location.host;
    const isLocalhost = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
    const port = window.location.port ? `:${window.location.port}` : '';
    
    let redirectUrl = '';
    if (isLocalhost) {
      // e.g. http://dps.localhost:5173/login
      redirectUrl = `${window.location.protocol}//${formData.subdomain}.localhost${port}/login`;
    } else {
      // e.g. https://dps.classorbit.com/login
      const baseDomain = currentHost.split('.').slice(-2).join('.'); // Gets 'classorbit.com'
      redirectUrl = `${window.location.protocol}//${formData.subdomain}.${baseDomain}/login`;
    }

    window.location.href = redirectUrl;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      {/* Left Panel - Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-70"></div>
        
        {/* Glassmorphic Content Container */}
        <div className="relative z-10 w-full max-w-lg p-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl m-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-700 shadow-lg">
              <Globe size={28} strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">ClassOrbit</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Empower your institution with smart management.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed mb-8">
            Join thousands of modern schools streamlining their operations, connecting with parents, and enhancing student success.
          </p>

          <div className="space-y-4">
            {[
              "Dedicated portals for every role",
              "Enterprise-grade security",
              "Real-time analytics & reporting"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-emerald-400" size={20} />
                <span className="font-medium text-indigo-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="absolute top-8 right-8">
          <p className="text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Setup your portal</h2>
            <p className="mt-2 text-slate-500">Follow the simple steps to get your school online.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-10">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-500 ${step >= 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                1
              </div>
              <span className={`ml-3 text-sm font-medium ${step >= 1 ? 'text-indigo-900' : 'text-slate-500'}`}>School Details</span>
            </div>
            <div className="flex-1 mx-4 h-[2px] bg-slate-100 relative">
               <div className={`absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-500 ${step === 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                2
              </div>
              <span className={`ml-3 text-sm font-medium ${step === 2 ? 'text-indigo-900' : 'text-slate-500'}`}>Admin Account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative overflow-hidden min-h-[400px]">
            {/* STEP 1 */}
            <div className={`absolute top-0 w-full transition-all duration-500 ease-in-out ${step === 1 ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'}`}>
              <div className="space-y-5">
                <div className="group">
                  <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700 mb-1.5">Institution Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      name="schoolName"
                      id="schoolName"
                      required
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="block w-full pl-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="e.g. Cambridge Academy"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700 mb-1.5">Portal URL</label>
                  <div className="flex rounded-xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600 transition-all">
                    <input
                      type="text"
                      name="subdomain"
                      id="subdomain"
                      required
                      value={formData.subdomain}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 bg-slate-50 text-slate-900 outline-none focus:bg-white transition-all font-medium"
                      placeholder="cambridge"
                    />
                    <div className="flex items-center px-4 bg-slate-100 text-slate-500 font-medium border-l border-slate-200 text-sm">
                      .classorbit.com
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">This will be your school's dedicated web address.</p>
                </div>

                <div className="pt-6">
                  <button type="button" onClick={handleNext} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] transition-all">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className={`absolute top-0 w-full transition-all duration-500 ease-in-out ${step === 2 ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
               <div className="space-y-5">
                <div className="group">
                  <label htmlFor="adminName" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <UserCircle size={18} />
                    </div>
                    <input
                      type="text"
                      name="adminName"
                      id="adminName"
                      required
                      value={formData.adminName}
                      onChange={handleChange}
                      className="block w-full pl-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="adminEmail"
                      id="adminEmail"
                      required
                      value={formData.adminEmail}
                      onChange={handleChange}
                      className="block w-full pl-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="admin@school.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Create Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <LockKeyhole size={18} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={handleBack} className="w-1/3 flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-slate-700 border border-slate-200 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="submit" className="w-2/3 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] transition-all">
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, CheckCircle2, Loader2, AlertCircle, ArrowRight, Lock, User as UserIcon } from 'lucide-react';
import { apiClient } from '../../api/axios';

export const Login = () => {
  const { login, setToken } = useAuthStore();
  const { tenant, schoolName, schoolId, isLoading, error: tenantError } = useTenantStore();
  const navigate = useNavigate();
  
  // State for Portal Search
  const [searchPortal, setSearchPortal] = useState('');
  
  // State for Login Form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handlePortalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPortal.trim()) return;
    
    const currentHost = window.location.host;
    const isLocalhost = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
    const port = window.location.port ? `:${window.location.port}` : '';
    
    let redirectUrl = '';
    const cleanSubdomain = searchPortal.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (isLocalhost) {
      redirectUrl = `${window.location.protocol}//${cleanSubdomain}.localhost${port}/login`;
    } else {
      const baseDomain = currentHost.split('.').slice(-2).join('.'); 
      redirectUrl = `${window.location.protocol}//${cleanSubdomain}.${baseDomain}/login`;
    }
    
    window.location.href = redirectUrl;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      // payload supports email or enrollmentId; we'll assume email if it has an '@', else enrollmentId
      const isEmail = identifier.includes('@');
      
      const payload: any = {
        password,
        domain: tenant,
      };
      
      if (isEmail) payload.email = identifier;
      else payload.enrollmentId = identifier;

      const response = await apiClient.post('/auth/login', payload);
      
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        
        // Save token first so subsequent API calls use it
        setToken(accessToken);

        let teacherProfileId = user.teacherProfileId

        if (user.role === 'TEACHER' && !teacherProfileId) {
          try {
            const teachersRes = await apiClient.get('/teachers');
            const rawTeachers = teachersRes.data;
            const teachersList = Array.isArray(rawTeachers?.data) ? rawTeachers.data : (Array.isArray(rawTeachers) ? rawTeachers : []);
            const teacherProfile = teachersList.find((t: any) =>
              t.user?.id === user.id || t.userId === user.id || t.user?.email === user.email
            );
            if (teacherProfile?.id) {
              teacherProfileId = teacherProfile.id;
            }
          } catch (e) {
            console.error('Could not fetch teacher profile ID on login:', e);
          }
        }

        if (teacherProfileId) {
          localStorage.setItem('teacherProfileId', teacherProfileId);
        }

        login({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: tenant || 'default',
          schoolId: user.schoolId,
          teacherProfileId
        });
        
        // Dynamically import to avoid any circular dependency at boot
        const { useSessionStore } = await import('../../store/sessionStore');
        await useSessionStore.getState().fetchSessions();

        // Redirect based on role
        if (user.role === 'SCHOOL_ADMIN' || user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'TEACHER') navigate('/teacher/dashboard');
        else if (user.role === 'STUDENT') navigate('/student/dashboard');
        else if (user.role === 'PARENT') navigate('/parent/dashboard');
        else navigate('/');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Invalid credentials or unauthorized portal access.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      
      {/* Left Panel - Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-70"></div>
        
        <div className="relative z-10 w-full max-w-lg p-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl m-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-700 shadow-lg">
              <Globe size={28} strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? 'Loading...' : (tenant ? schoolName || 'ClassOrbit' : 'ClassOrbit')}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Welcome back to your unified portal.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed mb-8">
            Access your personalized dashboard to manage schedules, view progress, and stay connected with your institution.
          </p>

          <div className="space-y-4">
            {[
              "Secure, role-based access",
              "Real-time notifications",
              "Seamless collaboration"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-emerald-400" size={20} />
                <span className="font-medium text-indigo-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Options */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="absolute top-8 right-8">
          <p className="text-sm text-slate-500">
            Need an account?{' '}
            {tenant ? (
              <a href="mailto:admin@school.com" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Contact your school admin
              </a>
            ) : (
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Register your school
              </Link>
            )}
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          {!tenant ? (
            // No Tenant UI (Find your workspace/school)
            <div className="text-center lg:text-left py-8">
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-6 tracking-wider uppercase border border-indigo-100">
                School Login
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Sign in to your portal</h2>
              <p className="text-slate-500 mb-10">Enter your school's unique workspace URL to continue.</p>
              
              <form onSubmit={handlePortalSearch} className="space-y-6">
                <div className="group">
                  <div className="flex rounded-xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600 transition-all">
                    <input
                      type="text"
                      required
                      value={searchPortal}
                      onChange={(e) => setSearchPortal(e.target.value)}
                      className="block w-full py-4 px-4 bg-slate-50 text-slate-900 outline-none focus:bg-white transition-all font-medium text-lg placeholder:text-slate-400"
                      placeholder="your-school"
                    />
                    <div className="flex items-center px-4 bg-slate-100 text-slate-500 font-medium border-l border-slate-200 text-sm">
                      .classorbit.com
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] transition-all">
                  Continue <ArrowRight size={18} />
                </button>
              </form>
              
              <div className="mt-12 text-center lg:text-left">
                <p className="text-sm text-slate-400">
                  Are you a Super Admin? <Link to="#" className="font-semibold text-slate-600 hover:text-indigo-600">Login here</Link>
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-slate-900">Connecting to portal...</h2>
              <p className="text-slate-500 mt-2">Fetching school details securely.</p>
            </div>
          ) : tenantError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Portal Not Found</h2>
              <p className="text-slate-500 mb-8 max-w-sm">
                We couldn't find a school registered under the URL <span className="font-semibold text-slate-700">"{tenant}"</span>.
              </p>
              <Link to="/register" className="w-full py-3.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all mb-3">
                Register this school
              </Link>
              <button onClick={() => window.location.href = window.location.protocol + '//' + window.location.host.replace(`${tenant}.`, '') + '/login'} className="w-full py-3.5 px-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                Search another portal
              </button>
            </div>
          ) : (
            // REAL LOGIN FORM
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 text-center lg:text-left">
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4 tracking-wider uppercase border border-indigo-100 shadow-sm">
                  {schoolName || tenant} Portal
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-slate-500">Enter your credentials to securely access your dashboard.</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex gap-3 text-rose-700">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email or Enrollment ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full pl-10 py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                      placeholder="e.g. admin@school.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Password</label>
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-10 text-center lg:text-left">
                <p className="text-sm text-slate-400">
                  Secured by <span className="font-semibold text-slate-600">ClassOrbit</span>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
};

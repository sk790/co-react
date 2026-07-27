import React from 'react';
import { ArrowRight, BookOpen, Users, Shield, GraduationCap, Calendar, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">ClassOrbit</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              The Next Generation of School Management
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Manage your school <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                with absolute clarity.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              ClassOrbit brings administrators, teachers, students, and parents together in one unified, beautiful platform designed for modern education.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                Register Your School <ArrowRight size={18} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                Book a Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
              <p className="text-lg text-slate-600">Powerful features thoughtfully designed to save time and enhance learning outcomes across your entire institution.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Role Portals</h3>
                <p className="text-slate-600 leading-relaxed">Dedicated dashboards for Admins, Teachers, Students, and Parents. Everyone gets exactly what they need.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Academic Management</h3>
                <p className="text-slate-600 leading-relaxed">Track grades, assignments, attendance, and syllabus progress seamlessly in real-time.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Isolated</h3>
                <p className="text-slate-600 leading-relaxed">Enterprise-grade multi-tenant architecture ensures your school's data is completely isolated and secure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap size={24} className="text-blue-500" />
            <span className="font-bold text-xl text-white">ClassOrbit</span>
          </div>
          <p>&copy; {new Date().getFullYear()} ClassOrbit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

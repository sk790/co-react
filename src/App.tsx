import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getSubdomain } from './utils/tenant';
import { useTenantStore } from './store/tenantStore';

import { RoleGuard } from './components/RoleGuard';

import { AdminLayout } from './layouts/AdminLayout';
import { TeacherLayout } from './layouts/TeacherLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { ParentLayout } from './layouts/ParentLayout';

import { LandingPage } from './pages/public/LandingPage';
import { SchoolRegistration } from './pages/public/SchoolRegistration';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Teachers } from './pages/admin/Teachers';
import { TeacherDetail } from './pages/admin/TeacherDetail';
import { Students } from './pages/admin/Students';
import { StudentDetail } from './pages/admin/StudentDetail';
import { Classes } from './pages/admin/Classes';
import { ClassDetail } from './pages/admin/ClassDetail';
import { Sections } from './pages/admin/Sections';
import { SectionDetail } from './pages/admin/SectionDetail';
import { Settings } from './pages/admin/Settings';
import { RolesPermissions } from './pages/admin/RolesPermissions';

import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ParentDashboard } from './pages/parent/ParentDashboard';

function App() {
  const { tenant, setTenant, fetchTenantDetails } = useTenantStore();

  useEffect(() => {
    // Extract tenant on initial load
    const tenantName = getSubdomain();
    setTenant(tenantName);

    // If we have a tenant subdomain, fetch its real details from the backend
    if (tenantName) {
      fetchTenantDetails(tenantName);
    }
  }, [setTenant, fetchTenantDetails]);

  return (
    <Router>
      <Routes>
        {/* Main Domain Route */}
        <Route path="/" element={tenant ? <Navigate to="/login" replace /> : <LandingPage />} />

        <Route path="/register" element={<SchoolRegistration />} />
        <Route path="/login" element={<Login />} />

        {/* School Admin Routes */}
        <Route element={<RoleGuard allowedRoles={['SCHOOL_ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/teachers/:id" element={<TeacherDetail />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/students/:id" element={<StudentDetail />} />
            <Route path="/admin/classes" element={<Classes />} />
            <Route path="/admin/classes/:id" element={<ClassDetail />} />
            <Route path="/admin/sections" element={<Sections />} />
            <Route path="/admin/sections/:id" element={<SectionDetail />} />
            <Route path="/admin/roles-permissions" element={<RolesPermissions />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* Teacher Routes */}
        <Route element={<RoleGuard allowedRoles={['TEACHER']} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
          </Route>
        </Route>

        {/* Student Routes */}
        <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          </Route>
        </Route>

        {/* Parent Routes */}
        <Route element={<RoleGuard allowedRoles={['PARENT']} />}>
          <Route element={<ParentLayout />}>
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Bus,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  ChevronRight,
  Calendar,
  Award,
  Users,
  FileCheck,
  ExternalLink,
  Shield
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface AssignedVehicle {
  id: string;
  vehicleNumber: string;
  vehicleModel?: string;
  registrationNo?: string;
  capacity?: number;
  status?: any;
}

interface DriverDetailItem {
  id: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experienceYears?: number;
  address?: string;
  userId?: string;
  schoolId?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  user?: UserData;
  name?: string;
  phone?: string;
  email?: string;
  vehicles?: AssignedVehicle[];
}

export const DriverDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data States
  const [driver, setDriver] = useState<DriverDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    experienceYears: 5,
    address: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Driver Details
  const fetchDriverDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get(`/drivers/${id}`);
      if (res.data.success) {
        const fetchedDriver = res.data.data;
        setDriver(fetchedDriver);
        setEditForm({
          name: fetchedDriver.user?.name || fetchedDriver.name || '',
          phone: fetchedDriver.user?.phone || fetchedDriver.phone || '',
          email: fetchedDriver.user?.email || fetchedDriver.email || '',
          licenseNumber: fetchedDriver.licenseNumber || '',
          experienceYears: fetchedDriver.experienceYears || 5,
          address: fetchedDriver.address || ''
        });
      } else {
        showToast('Could not load driver details', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching driver details:', err);
      showToast(err.response?.data?.message || 'Error fetching driver details', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDriverDetails(true);
  }, [id]);

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!driver) return;
    setEditForm({
      name: driver.user?.name || driver.name || '',
      phone: driver.user?.phone || driver.phone || '',
      email: driver.user?.email || driver.email || '',
      licenseNumber: driver.licenseNumber || '',
      experienceYears: driver.experienceYears || 5,
      address: driver.address || ''
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Save Edit Driver
  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setModalError('Driver name is required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,
        licenseNumber: editForm.licenseNumber.trim() || undefined,
        experienceYears: Number(editForm.experienceYears),
        address: editForm.address.trim() || undefined
      };

      const res = await apiClient.put(`/drivers/${id}`, payload);

      if (res.data.success) {
        showToast('Driver details updated successfully!');
        setIsEditModalOpen(false);
        fetchDriverDetails(false);
      } else {
        setModalError(res.data.message || 'Failed to update driver details');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error updating driver');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Driver
  const handleDeleteDriver = async () => {
    if (!driver) return;
    const dName = driver.user?.name || driver.name || 'Driver';
    if (!window.confirm(`Are you sure you want to delete driver profile "${dName}"?`)) return;

    setDeleting(true);
    try {
      const res = await apiClient.delete(`/drivers/${id}`);
      if (res.data.success) {
        showToast('Driver profile deleted successfully');
        setTimeout(() => navigate('/admin/transport/drivers'), 1000);
      } else {
        showToast(res.data.message || 'Failed to delete driver', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting driver', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Driver Profile Not Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
            The requested transport driver profile could not be found or may have been deleted.
          </p>
          <Link
            to="/admin/transport/drivers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <ArrowLeft size={16} /> Back to Drivers
          </Link>
        </div>
      </div>
    );
  }

  const driverName = driver.user?.name || driver.name || 'Driver';
  const driverPhone = driver.user?.phone || driver.phone;
  const driverEmail = driver.user?.email || driver.email;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white shadow-emerald-600/20'
            : 'bg-rose-600 text-white shadow-rose-600/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/admin/transport/drivers" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Drivers List
        </Link>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-900 font-bold">{driverName}</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <UserCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {driverName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Transport Staff Driver • License: {driver.licenseNumber || 'Unverified'} • {driver.experienceYears || 0} Years Experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDriverDetails(false)}
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh Details"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Edit3 size={15} /> Edit Driver
          </button>
          <button
            onClick={handleDeleteDriver}
            disabled={deleting}
            className="p-2.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-all border border-rose-100"
            title="Delete Driver"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <UserCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Driver Name</p>
            <h4 className="text-base font-extrabold text-slate-900 truncate">{driverName}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <FileCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">License Number</p>
            <h4 className="text-base font-extrabold text-purple-700 font-mono truncate">
              {driver.licenseNumber || 'Unverified'}
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Experience</p>
            <h4 className="text-base font-extrabold text-amber-600">
              {driver.experienceYears || 0} Years
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Bus size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Assigned Fleet</p>
            <h4 className="text-base font-extrabold text-emerald-600">
              {driver.vehicles ? driver.vehicles.length : 0} Vehicles
            </h4>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & License Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Personal & Contact Profile</h3>
              </div>
              <button
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Full Name
                </span>
                <p className="text-sm font-extrabold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {driverName}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Phone Number
                </span>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  {driverPhone || 'Not Provided'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Email Address
                </span>
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2 truncate">
                  <Mail size={14} className="text-slate-400" />
                  {driverEmail || 'Not Provided'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Residential Address
                </span>
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                  <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{driver.address || 'Roorkee Campus'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* License & Verification Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <FileCheck size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">License & Experience Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Driving License No
                </span>
                <p className="text-sm font-mono font-extrabold text-purple-700">
                  {driver.licenseNumber || 'Unverified'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  License Expiry
                </span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A / Permanent'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Experience
                </span>
                <p className="text-sm font-extrabold text-amber-600">
                  {driver.experienceYears || 0} Years
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Vehicles List */}
        <div className="space-y-6">
          {/* Assigned Vehicles Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Bus size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Assigned Vehicles</h3>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                {driver.vehicles ? driver.vehicles.length : 0}
              </span>
            </div>

            {driver.vehicles && driver.vehicles.length > 0 ? (
              <div className="space-y-3">
                {driver.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-amber-600 rounded-xl border border-slate-200">
                        <Bus size={18} />
                      </div>
                      <div>
                        <Link
                          to={`/admin/transport/vehicles/${v.id}`}
                          className="text-sm font-extrabold text-slate-900 hover:text-amber-600 hover:underline transition-colors block"
                        >
                          {v.vehicleNumber}
                        </Link>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {v.vehicleModel || 'Bus'} {v.capacity ? `• ${v.capacity} Seats` : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/admin/transport/vehicles/${v.id}`}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all"
                      title="View Vehicle Detail"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
                <p className="text-xs font-bold text-slate-600">No Vehicles Assigned</p>
                <p className="text-[11px] text-slate-400">
                  This driver is currently unassigned. Assign them to a vehicle in the Vehicles section.
                </p>
                <Link
                  to="/admin/transport/vehicles"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
                >
                  Go to Vehicles <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Operational Compliance Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl">
                <Shield size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-extrabold text-base">Driver Status & Verification</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Driver license credentials and contact info are maintained for safe transport logistics.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Identity Verification</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified Staff
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">License Verification</span>
                <span className="font-bold text-purple-300">
                  {driver.licenseNumber ? 'License On Record' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">System Role</span>
                <span className="font-bold text-white uppercase">{driver.user?.role || 'DRIVER'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT DRIVER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <UserCheck className="text-indigo-600" size={22} />
                <h3>Edit Driver Details</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-12345"
                    value={editForm.licenseNumber}
                    onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.experienceYears}
                    onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

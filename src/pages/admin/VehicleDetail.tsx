import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bus,
  UserCheck,
  Phone,
  Mail,
  MapPin,
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
  Hash,
  Clock,
  FileCheck
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface DriverUserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface DriverInfo {
  id: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experienceYears?: number;
  address?: string;
  userId?: string;
  user?: DriverUserInfo;
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
}

interface StatusInfo {
  id: string;
  title: string;
  code?: string;
  type?: string;
}

interface VehicleDetailItem {
  id: string;
  vehicleNumber: string;
  vehicleModel?: string;
  registrationNo?: string;
  capacity: number;
  driverId?: string;
  statusId?: string;
  schoolId?: string;
  createdAt: string;
  updatedAt?: string;
  driver?: DriverInfo;
  status?: StatusInfo | string;
}

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data States
  const [vehicle, setVehicle] = useState<VehicleDetailItem | null>(null);
  const [driversList, setDriversList] = useState<DriverInfo[]>([]);
  const [statuses, setStatuses] = useState<StatusInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    vehicleNumber: '',
    vehicleModel: '',
    registrationNo: '',
    capacity: 40,
    driverId: '',
    statusId: ''
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

  // Fetch Vehicle Details, Drivers & Statuses
  const fetchVehicleDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [vehicleRes, driversRes, statusesRes] = await Promise.allSettled([
        apiClient.get(`/vehicles/${id}`),
        apiClient.get('/drivers'),
        apiClient.get('/master-data?type=STATUS')
      ]);

      if (vehicleRes.status === 'fulfilled' && vehicleRes.value.data.success) {
        const fetchedVehicle = vehicleRes.value.data.data;
        setVehicle(fetchedVehicle);
        setEditForm({
          vehicleNumber: fetchedVehicle.vehicleNumber || '',
          vehicleModel: fetchedVehicle.vehicleModel || '',
          registrationNo: fetchedVehicle.registrationNo || '',
          capacity: fetchedVehicle.capacity || 40,
          driverId: fetchedVehicle.driverId || fetchedVehicle.driver?.id || '',
          statusId: typeof fetchedVehicle.status === 'object' ? fetchedVehicle.status?.id || '' : fetchedVehicle.statusId || ''
        });
      } else {
        showToast('Could not load vehicle details', 'error');
      }

      if (driversRes.status === 'fulfilled' && driversRes.value.data.success) {
        setDriversList(driversRes.value.data.data || []);
      }

      if (statusesRes.status === 'fulfilled' && statusesRes.value.data.success) {
        setStatuses((statusesRes.value.data.data || []).filter((s: any) => s.type === 'STATUS'));
      }
    } catch (err: any) {
      console.error('Error fetching vehicle details:', err);
      showToast(err.response?.data?.message || 'Error fetching vehicle details', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails(true);
  }, [id]);

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!vehicle) return;
    const currentStatusId = typeof vehicle.status === 'object' ? vehicle.status?.id || '' : vehicle.statusId || (statuses.length > 0 ? statuses[0].id : '');
    setEditForm({
      vehicleNumber: vehicle.vehicleNumber || '',
      vehicleModel: vehicle.vehicleModel || '',
      registrationNo: vehicle.registrationNo || '',
      capacity: vehicle.capacity || 40,
      driverId: vehicle.driverId || vehicle.driver?.id || '',
      statusId: currentStatusId
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Save Edit Vehicle
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.vehicleNumber.trim()) {
      setModalError('Vehicle number is required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        vehicleNumber: editForm.vehicleNumber.trim(),
        vehicleModel: editForm.vehicleModel.trim() || undefined,
        registrationNo: editForm.registrationNo.trim() || undefined,
        capacity: Number(editForm.capacity),
        driverId: editForm.driverId || undefined,
        statusId: editForm.statusId || undefined
      };

      const res = await apiClient.put(`/vehicles/${id}`, payload);

      if (res.data.success) {
        showToast('Vehicle updated successfully!');
        setIsEditModalOpen(false);
        fetchVehicleDetails(false);
      } else {
        setModalError(res.data.message || 'Failed to update vehicle');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error updating vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicle) return;
    if (!window.confirm(`Are you sure you want to delete vehicle "${vehicle.vehicleNumber}"?`)) return;

    setDeleting(true);
    try {
      const res = await apiClient.delete(`/vehicles/${id}`);
      if (res.data.success) {
        showToast('Vehicle deleted successfully');
        setTimeout(() => navigate('/admin/transport/vehicles'), 1000);
      } else {
        showToast(res.data.message || 'Failed to delete vehicle', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting vehicle', 'error');
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

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Bus size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Vehicle Not Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
            The requested vehicle details could not be found or may have been deleted.
          </p>
          <Link
            to="/admin/transport/vehicles"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
          >
            <ArrowLeft size={16} /> Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const driverName = vehicle.driver?.user?.name || vehicle.driver?.name || 'Unassigned';
  const driverPhone = vehicle.driver?.user?.phone || vehicle.driver?.phone;
  const driverEmail = vehicle.driver?.user?.email || vehicle.driver?.email;
  const statusTitle = typeof vehicle.status === 'object' ? vehicle.status?.title : vehicle.status || 'ACTIVE';

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
        <Link to="/admin/transport/vehicles" className="hover:text-amber-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Vehicles List
        </Link>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-900 font-bold">{vehicle.vehicleNumber}</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Bus size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {vehicle.vehicleNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                statusTitle === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : statusTitle === 'MAINTENANCE'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {statusTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {vehicle.vehicleModel ? `${vehicle.vehicleModel} • ` : ''}
              Reg No: {vehicle.registrationNo || 'N/A'} • {vehicle.capacity} Seating Capacity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchVehicleDetails(false)}
            className="p-2.5 text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh Details"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 active:scale-95"
          >
            <Edit3 size={15} /> Edit Vehicle
          </button>
          <button
            onClick={handleDeleteVehicle}
            disabled={deleting}
            className="p-2.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-all border border-rose-100"
            title="Delete Vehicle"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Bus size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Vehicle Number</p>
            <h4 className="text-lg font-extrabold text-slate-900">{vehicle.vehicleNumber}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Seating Capacity</p>
            <h4 className="text-lg font-extrabold text-indigo-600">{vehicle.capacity} Seats</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <UserCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Assigned Driver</p>
            {vehicle.driver ? (
              <Link
                to={`/admin/transport/drivers/${vehicle.driver.id}`}
                className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 hover:underline transition-colors block truncate"
              >
                {driverName}
              </Link>
            ) : (
              <h4 className="text-sm font-extrabold text-slate-400 truncate">Unassigned</h4>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Hash size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Registration No</p>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">{vehicle.registrationNo || 'N/A'}</h4>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Driver Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vehicle & Driver Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Bus size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Vehicle Specifications</h3>
              </div>
              <button
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Vehicle Number
                </span>
                <p className="text-sm font-extrabold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                  {vehicle.vehicleNumber}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Vehicle Model
                </span>
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {vehicle.vehicleModel || 'Standard Bus / Van'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Registration Number
                </span>
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                  {vehicle.registrationNo || 'Not Registered'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Seating Capacity
                </span>
                <p className="text-sm font-extrabold text-indigo-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  {vehicle.capacity} Passenger Seats
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Current Status
                </span>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    statusTitle === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  {statusTitle}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Created Date
                </span>
                <p className="text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(vehicle.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Driver Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck size={20} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Assigned Driver Information</h3>
              </div>
              {vehicle.driver && (
                <button
                  onClick={handleOpenEditModal}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Edit3 size={14} /> Change Driver
                </button>
              )}
            </div>

            {vehicle.driver ? (
              <div className="space-y-6">
                {/* Driver Profile Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-md shadow-indigo-600/20">
                      {driverName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        to={`/admin/transport/drivers/${vehicle.driver.id}`}
                        className="text-base font-extrabold text-slate-900 hover:text-indigo-600 hover:underline transition-colors block"
                      >
                        {driverName}
                      </Link>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                        <span>Transport Staff / Driver</span>
                        {vehicle.driver.experienceYears && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[11px] font-bold border border-amber-200">
                            {vehicle.driver.experienceYears} Yrs Exp
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/transport/drivers/${vehicle.driver.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all shrink-0"
                  >
                    View Driver Profile <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Driver Contact & License Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Phone size={12} /> Contact Phone
                    </span>
                    <p className="text-sm font-extrabold text-slate-800">
                      {driverPhone || 'Not Provided'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Mail size={12} /> Email Address
                    </span>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {driverEmail || 'Not Provided'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FileCheck size={12} /> Driving License No
                    </span>
                    <p className="text-sm font-mono font-bold text-purple-700">
                      {vehicle.driver.licenseNumber || 'Unverified'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <MapPin size={12} /> Address / Location
                    </span>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {vehicle.driver.address || 'Roorkee Campus'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">No Driver Currently Assigned</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Assign an active driver to this vehicle so transport routes and student trips can be managed safely.
                  </p>
                </div>
                <button
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  <UserCheck size={14} /> Assign Driver Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fleet Actions & Status Summary */}
        <div className="space-y-6">
          {/* Quick Management Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Fleet Operations
            </h3>

            <div className="space-y-2">
              <button
                onClick={handleOpenEditModal}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 rounded-2xl border border-slate-200 transition-all text-xs font-bold text-slate-800 hover:text-amber-700 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-amber-600 group-hover:border-amber-200">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <p className="font-extrabold">Update Vehicle Details</p>
                    <p className="text-[11px] font-normal text-slate-400">Model, capacity or driver</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-600" />
              </button>

              <Link
                to="/admin/transport/drivers"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-2xl border border-slate-200 transition-all text-xs font-bold text-slate-800 hover:text-indigo-700 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-indigo-600 group-hover:border-indigo-200">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="font-extrabold">Manage Transport Staff</p>
                    <p className="text-[11px] font-normal text-slate-400">View all drivers list</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </Link>
            </div>
          </div>

          {/* Operational Status Info */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl">
                <Bus size={20} className="text-amber-400" />
              </div>
              <h3 className="font-extrabold text-base">Vehicle Compliance</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ensure vehicle registration number and active driver license status are updated for safe school transport operations.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Safety Verification</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Max Passenger Capacity</span>
                <span className="font-bold text-amber-300">{vehicle.capacity} Students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-white uppercase">{statusTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT VEHICLE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Bus className="text-amber-600" size={22} />
                <h3>Edit Vehicle Details</h3>
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

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BUS-01"
                    value={editForm.vehicleNumber}
                    onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Starbus 2024"
                    value={editForm.vehicleModel}
                    onChange={(e) => setEditForm({ ...editForm, vehicleModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Registration No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH-12-AB-1234"
                    value={editForm.registrationNo}
                    onChange={(e) => setEditForm({ ...editForm, registrationNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Assigned Driver
                  </label>
                  <select
                    value={editForm.driverId}
                    onChange={(e) => setEditForm({ ...editForm, driverId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 bg-white"
                  >
                    <option value="">Select Driver (Optional)</option>
                    {driversList.map((d) => {
                      const name = d.user?.name || d.name || 'Driver';
                      const phone = d.user?.phone || d.phone;
                      return (
                        <option key={d.id} value={d.id}>
                          {name} {phone ? `(${phone})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Status *
                  </label>
                  <select
                    value={editForm.statusId}
                    onChange={(e) => setEditForm({ ...editForm, statusId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 bg-white"
                  >
                    <option value="">Select Status</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

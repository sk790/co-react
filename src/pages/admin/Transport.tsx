import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Phone, 
  Users, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  ShieldAlert,
  MapPin,
  Clock,
  DollarSign,
  Mail,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { apiClient } from '../../api/axios';

interface DriverItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experienceYears?: number;
  address?: string;
  status: string;
  vehicles?: { id: string; vehicleNumber: string }[];
  createdAt: string;
}

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleModel?: string;
  registrationNo?: string;
  capacity: number;
  driverId?: string;
  driver?: {
    id: string;
    name: string;
    phone?: string;
  };
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  status: string;
  createdAt: string;
}

interface TransportRouteItem {
  id: string;
  routeName: string;
  routeNumber: string;
  startLocation?: string;
  endLocation?: string;
  pickupTime?: string;
  dropTime?: string;
  fare?: number;
  status: string;
  createdAt: string;
}

interface TransportProps {
  defaultTab?: 'vehicles' | 'routes' | 'drivers';
}

export const Transport: React.FC<TransportProps> = ({ defaultTab = 'vehicles' }) => {
  // Page Tabs: 'vehicles' | 'routes' | 'drivers'
  const [activeTab, setActiveTab] = useState<'vehicles' | 'routes' | 'drivers'>(defaultTab);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<TransportRouteItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Vehicle Modal & Form States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Route Modal & Form States
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  // Driver Modal & Form States
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    vehicleModel: '',
    registrationNo: '',
    capacity: 40,
    driverId: '',
    status: 'ACTIVE'
  });

  // Route Form State
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeNumber: '',
    startLocation: '',
    endLocation: '',
    pickupTime: '07:30 AM',
    dropTime: '03:30 PM',
    fare: 1500,
    status: 'ACTIVE'
  });

  // Driver Form State
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    experienceYears: 5,
    address: '',
    status: 'ACTIVE'
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Master Transport Data
  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [vehiclesRes, routesRes, driversRes] = await Promise.all([
        apiClient.get('/vehicles'),
        apiClient.get('/routes'),
        apiClient.get('/drivers')
      ]);

      if (vehiclesRes.data.success) {
        setVehicles(vehiclesRes.data.data || []);
      }
      if (routesRes.data.success) {
        setRoutes(routesRes.data.data || []);
      }
      if (driversRes.data.success) {
        setDrivers(driversRes.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching transport data:', err);
      showToast(err.response?.data?.message || 'Error loading transport data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // --- VEHICLE HANDLERS ---
  const handleOpenCreateVehicleModal = () => {
    setEditingVehicleId(null);
    setVehicleForm({
      vehicleNumber: '',
      vehicleModel: '',
      registrationNo: '',
      capacity: 40,
      driverId: '',
      status: 'ACTIVE'
    });
    setModalError(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicleModal = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setVehicleForm({
      vehicleNumber: v.vehicleNumber,
      vehicleModel: v.vehicleModel || '',
      registrationNo: v.registrationNo || '',
      capacity: v.capacity || 40,
      driverId: v.driverId || v.driver?.id || '',
      status: v.status || 'ACTIVE'
    });
    setModalError(null);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber.trim()) {
      setModalError('Vehicle number is required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        vehicleNumber: vehicleForm.vehicleNumber.trim(),
        vehicleModel: vehicleForm.vehicleModel.trim() || undefined,
        registrationNo: vehicleForm.registrationNo.trim() || undefined,
        capacity: Number(vehicleForm.capacity),
        driverId: vehicleForm.driverId || undefined,
        status: vehicleForm.status
      };

      const res = editingVehicleId
        ? await apiClient.put(`/vehicles/${editingVehicleId}`, payload)
        : await apiClient.post('/vehicles', payload);

      if (res.data.success) {
        showToast(editingVehicleId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
        setIsVehicleModalOpen(false);
        setEditingVehicleId(null);
        fetchData(false);
      } else {
        setModalError(res.data.message || 'Failed to save vehicle');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error saving vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string, vehicleNo: string) => {
    if (!window.confirm(`Are you sure you want to delete vehicle "${vehicleNo}"?`)) return;

    try {
      const res = await apiClient.delete(`/vehicles/${id}`);
      if (res.data.success) {
        showToast('Vehicle deleted successfully!');
        fetchData(false);
      } else {
        showToast(res.data.message || 'Failed to delete vehicle', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting vehicle', 'error');
    }
  };

  // --- ROUTE HANDLERS ---
  const handleOpenCreateRouteModal = () => {
    setEditingRouteId(null);
    setRouteForm({
      routeName: '',
      routeNumber: '',
      startLocation: '',
      endLocation: '',
      pickupTime: '07:30 AM',
      dropTime: '03:30 PM',
      fare: 1500,
      status: 'ACTIVE'
    });
    setModalError(null);
    setIsRouteModalOpen(true);
  };

  const handleOpenEditRouteModal = (r: TransportRouteItem) => {
    setEditingRouteId(r.id);
    setRouteForm({
      routeName: r.routeName,
      routeNumber: r.routeNumber,
      startLocation: r.startLocation || '',
      endLocation: r.endLocation || '',
      pickupTime: r.pickupTime || '07:30 AM',
      dropTime: r.dropTime || '03:30 PM',
      fare: r.fare || 0,
      status: r.status || 'ACTIVE'
    });
    setModalError(null);
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.routeName.trim() || !routeForm.routeNumber.trim()) {
      setModalError('Route Name and Route Number are required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        routeName: routeForm.routeName.trim(),
        routeNumber: routeForm.routeNumber.trim(),
        startLocation: routeForm.startLocation.trim() || undefined,
        endLocation: routeForm.endLocation.trim() || undefined,
        pickupTime: routeForm.pickupTime.trim() || undefined,
        dropTime: routeForm.dropTime.trim() || undefined,
        fare: Number(routeForm.fare),
        status: routeForm.status
      };

      const res = editingRouteId
        ? await apiClient.put(`/routes/${editingRouteId}`, payload)
        : await apiClient.post('/routes', payload);

      if (res.data.success) {
        showToast(editingRouteId ? 'Route updated successfully!' : 'Route created successfully!');
        setIsRouteModalOpen(false);
        setEditingRouteId(null);
        fetchData(false);
      } else {
        setModalError(res.data.message || 'Failed to save route');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error saving route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id: string, routeName: string) => {
    if (!window.confirm(`Are you sure you want to delete route "${routeName}"?`)) return;

    try {
      const res = await apiClient.delete(`/routes/${id}`);
      if (res.data.success) {
        showToast('Route deleted successfully!');
        fetchData(false);
      } else {
        showToast(res.data.message || 'Failed to delete route', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting route', 'error');
    }
  };

  // --- DRIVER HANDLERS ---
  const handleOpenCreateDriverModal = () => {
    setEditingDriverId(null);
    setDriverForm({
      name: '',
      phone: '',
      email: '',
      licenseNumber: '',
      experienceYears: 5,
      address: '',
      status: 'ACTIVE'
    });
    setModalError(null);
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriverModal = (d: DriverItem) => {
    setEditingDriverId(d.id);
    setDriverForm({
      name: d.name,
      phone: d.phone || '',
      email: d.email || '',
      licenseNumber: d.licenseNumber || '',
      experienceYears: d.experienceYears || 5,
      address: d.address || '',
      status: d.status || 'ACTIVE'
    });
    setModalError(null);
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForm.name.trim()) {
      setModalError('Driver Name is required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: driverForm.name.trim(),
        phone: driverForm.phone.trim() || undefined,
        email: driverForm.email.trim() || undefined,
        licenseNumber: driverForm.licenseNumber.trim() || undefined,
        experienceYears: Number(driverForm.experienceYears),
        address: driverForm.address.trim() || undefined,
        status: driverForm.status
      };

      const res = editingDriverId
        ? await apiClient.put(`/drivers/${editingDriverId}`, payload)
        : await apiClient.post('/drivers', payload);

      if (res.data.success) {
        showToast(editingDriverId ? 'Driver details updated successfully!' : 'Driver profile created successfully!');
        setIsDriverModalOpen(false);
        setEditingDriverId(null);
        fetchData(false);
      } else {
        setModalError(res.data.message || 'Failed to save driver');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error saving driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove driver "${name}"?`)) return;

    try {
      const res = await apiClient.delete(`/drivers/${id}`);
      if (res.data.success) {
        showToast('Driver removed successfully!');
        fetchData(false);
      } else {
        showToast(res.data.message || 'Failed to remove driver', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error removing driver', 'error');
    }
  };

  // Filtered Items
  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNo = v.vehicleNumber.toLowerCase().includes(q);
      const matchModel = v.vehicleModel?.toLowerCase().includes(q);
      const matchReg = v.registrationNo?.toLowerCase().includes(q);
      const matchDriver = v.driver?.name?.toLowerCase().includes(q) || v.driverName?.toLowerCase().includes(q);
      return matchNo || matchModel || matchReg || matchDriver;
    }
    return true;
  });

  const filteredRoutes = routes.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = r.routeName.toLowerCase().includes(q);
      const matchNo = r.routeNumber.toLowerCase().includes(q);
      const matchStart = r.startLocation?.toLowerCase().includes(q);
      const matchEnd = r.endLocation?.toLowerCase().includes(q);
      return matchName || matchNo || matchStart || matchEnd;
    }
    return true;
  });

  const filteredDrivers = drivers.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchPhone = d.phone?.toLowerCase().includes(q);
      const matchLicense = d.licenseNumber?.toLowerCase().includes(q);
      return matchName || matchPhone || matchLicense;
    }
    return true;
  });

  // Metrics
  const totalVehicles = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'ACTIVE').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'MAINTENANCE').length;
  const totalSeats = vehicles.reduce((acc, v) => acc + (v.capacity || 0), 0);

  const totalRoutes = routes.length;
  const activeRoutesCount = routes.filter(r => r.status === 'ACTIVE').length;
  const avgFare = totalRoutes > 0 ? Math.round(routes.reduce((acc, r) => acc + (r.fare || 0), 0) / totalRoutes) : 0;

  const totalDrivers = drivers.length;
  const activeDriversCount = drivers.filter(d => d.status === 'ACTIVE').length;
  const licensedDriversCount = drivers.filter(d => Boolean(d.licenseNumber)).length;

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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${
            activeTab === 'vehicles' 
              ? 'bg-amber-50 text-amber-600 border-amber-100' 
              : activeTab === 'routes'
              ? 'bg-purple-50 text-purple-600 border-purple-100'
              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
          }`}>
            {activeTab === 'vehicles' && <Bus size={26} />}
            {activeTab === 'routes' && <MapPin size={26} />}
            {activeTab === 'drivers' && <Users size={26} />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'vehicles' && 'Vehicles Management'}
              {activeTab === 'routes' && 'Transport Routes'}
              {activeTab === 'drivers' && 'Drivers & Transport Staff'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'vehicles' && 'Manage school fleet, vehicle details, seating capacity, and driver info'}
              {activeTab === 'routes' && 'Manage transport routes, pick-up points, timings, and monthly fees'}
              {activeTab === 'drivers' && 'Manage driver profiles, driving license verification, and assigned vehicles'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(false)}
            className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh List"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {activeTab === 'vehicles' && (
            <button
              onClick={handleOpenCreateVehicleModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 active:scale-95"
            >
              <Plus size={16} /> Add New Vehicle
            </button>
          )}

          {activeTab === 'routes' && (
            <button
              onClick={handleOpenCreateRouteModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Plus size={16} /> Add New Route
            </button>
          )}

          {activeTab === 'drivers' && (
            <button
              onClick={handleOpenCreateDriverModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={16} /> Add New Driver
            </button>
          )}
        </div>
      </div>

      {/* VEHICLES TAB CONTENT */}
      {activeTab === 'vehicles' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Bus size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Fleet</p>
                <h4 className="text-xl font-extrabold text-slate-900">{totalVehicles} Vehicles</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Vehicles</p>
                <h4 className="text-xl font-extrabold text-emerald-600">{activeVehiclesCount} Vehicles</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">In Maintenance</p>
                <h4 className="text-xl font-extrabold text-rose-600">{maintenanceCount} Vehicles</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Capacity</p>
                <h4 className="text-xl font-extrabold text-indigo-600">{totalSeats} Seats</h4>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Vehicle No, Driver, Model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs">
                <Filter size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="MAINTENANCE">Maintenance Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <Bus size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Vehicles Found</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
                No transport vehicles match your search or filter parameters.
              </p>
              <button
                onClick={handleOpenCreateVehicleModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
              >
                <Plus size={16} /> Add First Vehicle
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Vehicle No</th>
                      <th className="px-6 py-4">Model / Reg No</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Assigned Driver</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-amber-700 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                              <Bus size={16} />
                            </div>
                            <span className="text-sm font-extrabold text-slate-900">{v.vehicleNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{v.vehicleModel || 'Standard Bus'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{v.registrationNo || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs">
                            {v.capacity} Seats
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          {(v.driver?.name || v.driverName) ? (
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <UserCheck size={14} className="text-emerald-600" />
                                <span>{v.driver?.name || v.driverName}</span>
                              </div>
                              {(v.driver?.phone || v.driverPhone) && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Phone size={11} /> {v.driver?.phone || v.driverPhone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">No Driver Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            v.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.status === 'MAINTENANCE'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditVehicleModal(v)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mr-1"
                            title="Edit Vehicle"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ROUTES TAB CONTENT */}
      {activeTab === 'routes' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Routes</p>
                <h4 className="text-xl font-extrabold text-slate-900">{totalRoutes} Routes</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Routes</p>
                <h4 className="text-xl font-extrabold text-emerald-600">{activeRoutesCount} Routes</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Avg Monthly Fee</p>
                <h4 className="text-xl font-extrabold text-amber-600">₹{avgFare} / Mo</h4>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Route Name, Number, Locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs">
                <Filter size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <MapPin size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Transport Routes Scheduled</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
                There are no transport routes matching your selected filters.
              </p>
              <button
                onClick={handleOpenCreateRouteModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20"
              >
                <Plus size={16} /> Add First Route
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Route Code</th>
                      <th className="px-6 py-4">Route Name</th>
                      <th className="px-6 py-4">Start / Destination</th>
                      <th className="px-6 py-4">Pickup / Drop Time</th>
                      <th className="px-6 py-4">Monthly Fee</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoutes.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-purple-700 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-extrabold">
                            {r.routeNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap text-sm">
                          {r.routeName}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <MapPin size={13} className="text-purple-600" />
                            <span>{r.startLocation || 'Start Point'}</span>
                            <span className="text-slate-400">➔</span>
                            <span>{r.endLocation || 'Campus'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>{r.pickupTime || '07:30 AM'} - {r.dropTime || '03:30 PM'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-emerald-600 whitespace-nowrap text-sm">
                          ₹{r.fare || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            r.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditRouteModal(r)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mr-1"
                            title="Edit Route"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(r.id, r.routeName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Route"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* DRIVERS TAB CONTENT */}
      {activeTab === 'drivers' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Drivers</p>
                <h4 className="text-xl font-extrabold text-slate-900">{totalDrivers} Staff</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Drivers</p>
                <h4 className="text-xl font-extrabold text-emerald-600">{activeDriversCount} Staff</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <FileCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Licensed Drivers</p>
                <h4 className="text-xl font-extrabold text-amber-600">{licensedDriversCount} Verified</h4>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Driver Name, Phone, License..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs">
                <Filter size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Drivers Found</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
                No transport driver profiles match your search criteria. Add your first driver profile below.
              </p>
              <button
                onClick={handleOpenCreateDriverModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus size={16} /> Add First Driver
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Driver Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">License Number</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Assigned Vehicles</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDrivers.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200">
                              <UserCheck size={16} />
                            </div>
                            <span className="text-sm font-extrabold text-slate-900">{d.user?.name || d.name || 'Driver'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                          {(d.user?.phone || d.phone) && (
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                              <Phone size={12} className="text-slate-400" />
                              <span>{d.user?.phone || d.phone}</span>
                            </div>
                          )}
                          {(d.user?.email || d.email) && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail size={11} /> {d.user?.email || d.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                          {d.licenseNumber ? (
                            <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs">
                              {d.licenseNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Unverified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                          {d.experienceYears ? `${d.experienceYears} Years` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-bold text-amber-700 whitespace-nowrap">
                          {d.vehicles && d.vehicles.length > 0 ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {d.vehicles.map(v => (
                                <span key={v.id} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[11px]">
                                  {v.vehicleNumber}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            d.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : d.status === 'ON_LEAVE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditDriverModal(d)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1"
                            title="Edit Driver"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(d.id, d.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Driver"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Bus className="text-amber-600" size={22} />
                <h3>{editingVehicleId ? 'Edit Vehicle Details' : 'Add New Fleet Vehicle'}</h3>
              </div>
              <button 
                onClick={() => setIsVehicleModalOpen(false)} 
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
                    placeholder="e.g. BUS-01 or VAN-04"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
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
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })}
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
                    value={vehicleForm.vehicleModel}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleModel: e.target.value })}
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
                    value={vehicleForm.registrationNo}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNo: e.target.value })}
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
                    value={vehicleForm.driverId}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 bg-white"
                  >
                    <option value="">Select Driver (Optional)</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.phone ? `(${d.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Status *
                  </label>
                  <select
                    value={vehicleForm.status}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVehicleId ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROUTE MODAL */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <MapPin className="text-purple-600" size={22} />
                <h3>{editingRouteId ? 'Edit Transport Route' : 'Add New Transport Route'}</h3>
              </div>
              <button 
                onClick={() => setIsRouteModalOpen(false)} 
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

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Route Code / Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R-101"
                    value={routeForm.routeNumber}
                    onChange={(e) => setRouteForm({ ...routeForm, routeNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Route Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. North City Express"
                    value={routeForm.routeName}
                    onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Start Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Railway Station"
                    value={routeForm.startLocation}
                    onChange={(e) => setRouteForm({ ...routeForm, startLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    End / Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ClassOrbit Main Gate"
                    value={routeForm.endLocation}
                    onChange={(e) => setRouteForm({ ...routeForm, endLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Pickup Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07:30 AM"
                    value={routeForm.pickupTime}
                    onChange={(e) => setRouteForm({ ...routeForm, pickupTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Drop-off Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 03:30 PM"
                    value={routeForm.dropTime}
                    onChange={(e) => setRouteForm({ ...routeForm, dropTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Monthly Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1500"
                    value={routeForm.fare}
                    onChange={(e) => setRouteForm({ ...routeForm, fare: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Status *
                  </label>
                  <select
                    value={routeForm.status}
                    onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRouteId ? 'Update Route' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT DRIVER MODAL */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Users className="text-indigo-600" size={22} />
                <h3>{editingDriverId ? 'Edit Driver Details' : 'Add New Driver Profile'}</h3>
              </div>
              <button 
                onClick={() => setIsDriverModalOpen(false)} 
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="driver@school.com"
                    value={driverForm.email}
                    onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Driving License No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-987654321"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={driverForm.experienceYears}
                    onChange={(e) => setDriverForm({ ...driverForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="Street / Area Address"
                  value={driverForm.address}
                  onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Status *
                </label>
                <select
                  value={driverForm.status}
                  onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingDriverId ? 'Update Driver' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

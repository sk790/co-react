import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { toast } from '../../store/toastStore';
import { Modal } from '../../components/Modal';
import {
  StudentDetail as ReusableStudentDetail,
  type StudentDetailItem
} from '../../components/pageComponents/StudentDetail';

interface SectionOption {
  id: string;
  title: string;
  classTitle: string;
}

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data States
  const [student, setStudent] = useState<StudentDetailItem | null>(null);
  const [sectionsOptions, setSectionsOptions] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    enrollmentNo: '',
    sectionId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Student Details & Sections
  const fetchStudentDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [res, classesRes] = await Promise.allSettled([
        apiClient.get(`/students/${id}`),
        apiClient.get('/classes')
      ]);

      if (res.status === 'fulfilled' && res.value.data.success) {
        setStudent(res.value.data.data);
      } else {
        toast.error('Student record not found');
      }

      if (classesRes.status === 'fulfilled' && classesRes.value.data.success) {
        const rawClasses = classesRes.value.data.data || [];
        const secList: SectionOption[] = [];
        rawClasses.forEach((cls: any) => {
          if (cls.sections && Array.isArray(cls.sections)) {
            cls.sections.forEach((sec: any) => {
              secList.push({
                id: sec.id,
                title: sec.title,
                classTitle: cls.title
              });
            });
          }
        });
        setSectionsOptions(secList);
      }
    } catch (err: any) {
      console.error('Error fetching student details:', err);
      toast.error('Error loading student profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails(true);
  }, [id]);

  // Handle Edit Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !editForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/students/${student.id}`, {
        name: editForm.name.trim(),
        enrollmentNo: editForm.enrollmentNo.trim() || undefined,
        sectionId: editForm.sectionId
      });

      if (res.data.success) {
        toast.success('Student profile updated successfully!');
        setIsEditModalOpen(false);
        fetchStudentDetails(false);
      } else {
        toast.error(res.data.message || 'Failed to update student');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating student');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async () => {
    if (!student) return;
    if (!window.confirm(`Are you sure you want to remove student "${student.user.name}"?`)) return;

    setDeleting(true);
    try {
      const res = await apiClient.delete(`/students/${student.id}`);
      if (res.data.success) {
        toast.success('Student removed successfully!');
        setTimeout(() => navigate('/admin/students'), 1200);
      } else {
        toast.error(res.data.message || 'Failed to remove student');
        setDeleting(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting student');
      setDeleting(false);
    }
  };

  return (
    <div className="relative font-sans">
      {/* Dynamic Reusable Student Detail Component */}
      <ReusableStudentDetail
        student={student}
        loading={loading}
        isRefreshing={refreshing}
        onRefresh={() => fetchStudentDetails(false)}
        role="ADMIN"
        backLink="/admin/students"
        backLinkLabel="Student Roster"
        getSectionDetailLink={(secId) => `/admin/sections/${secId}`}
        getClassDetailLink={(classId) => `/admin/classes/${classId}`}
        onEditStudent={() => {
          const currentSecId = student?.enrollments && student.enrollments.length > 0 ? student.enrollments[0].section?.id || '' : '';
          setEditForm({
            name: student?.user.name || '',
            enrollmentNo: student?.enrollmentNo || '',
            sectionId: currentSecId
          });
          setIsEditModalOpen(true);
        }}
        onDeleteStudent={handleDeleteStudent}
        isDeleting={deleting}
      />

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
        icon={Edit3}
        iconColor="text-indigo-600"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Enrollment ID / Roll No
            </label>
            <input
              type="text"
              value={editForm.enrollmentNo}
              onChange={(e) => setEditForm({ ...editForm, enrollmentNo: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Assign Class Section
            </label>
            <select
              value={editForm.sectionId}
              onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-800 bg-white"
            >
              <option value="">-- No Section (Unassigned) --</option>
              {sectionsOptions.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.classTitle} - {sec.title}
                </option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


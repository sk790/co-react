import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import { StudentDetail, type StudentDetailItem } from '../../components/pageComponents/StudentDetail';

export const TeacherStudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [student, setStudent] = useState<StudentDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get(`/students/${id}`);
      if (res.data?.success) {
        setStudent(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails(true);
  }, [id]);

  return (
    <StudentDetail
      student={student}
      loading={loading}
      isRefreshing={refreshing}
      onRefresh={() => fetchStudentDetails(false)}
      role="TEACHER"
      backLink="/teacher/students"
      backLinkLabel="Enrolled Students"
      getSectionDetailLink={(secId) => `/teacher/sections/${secId}`}
      getClassDetailLink={(classId) => `/teacher/classes/${classId}`}
    />
  );
};

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import { ClassDetail, type ClassDetailData } from '../../components/pageComponents/ClassDetail';

export const TeacherClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClassDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get(`/classes/${id}`);
      if (res.data?.success) {
        setClassData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClassDetails(true);
  }, [id]);

  return (
    <ClassDetail
      classData={classData}
      loading={loading}
      isRefreshing={refreshing}
      onRefresh={() => fetchClassDetails(false)}
      role="TEACHER"
      backLink="/teacher/classes"
      backLinkLabel="My Classes"
      getSectionDetailLink={(sec) => `/teacher/sections/${sec.id}`}
      getStudentDetailLink={(studentId) => `/teacher/students/${studentId}`}
    />
  );
};

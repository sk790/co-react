import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import { SectionDetail, type SectionDetailData, type PeriodItem } from '../../components/pageComponents/SectionDetail';

export const TeacherSectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [section, setSection] = useState<SectionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  const fetchSectionDetails = async (showLoader = true) => {
    if (!id) return;
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get(`/sections/${id}`);
      if (res.data?.success) {
        setSection(res.data.data);
      }
    } catch (err) {
      console.error('Error loading section details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTimetable = async () => {
    if (!id) return;
    setTimetableLoading(true);
    try {
      const res = await apiClient.get(`/lecture/section/${id}`);
      if (res.data?.success) {
        setPeriods(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching section timetable:', err);
    } finally {
      setTimetableLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionDetails(true);
    fetchTimetable();
  }, [id]);

  return (
    <SectionDetail
      section={section}
      periods={periods}
      loading={loading}
      timetableLoading={timetableLoading}
      isRefreshing={refreshing}
      onRefresh={() => {
        fetchSectionDetails(false);
        fetchTimetable();
      }}
      role="TEACHER"
      backLink={section?.classId ? `/teacher/classes/${section.classId}` : '/teacher/classes'}
      backLinkLabel="Class Details"
      getClassDetailLink={(classId) => `/teacher/classes/${classId}`}
      getStudentDetailLink={(studentId) => `/teacher/students/${studentId}`}
    />
  );
};

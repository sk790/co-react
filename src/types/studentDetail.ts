import React from 'react';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface ClassInfo {
  id: string;
  title: string;
}

export interface SectionInfo {
  id: string;
  title: string;
  class?: ClassInfo;
}

export interface EnrollmentItem {
  id: string;
  section?: SectionInfo;
  createdAt?: string;
}

export interface StudentDetailItem {
  id: string;
  enrollmentNo: string;
  createdAt?: string;
  user: UserData;
  enrollments?: EnrollmentItem[];
}

export interface StudentDetailProps {
  student: StudentDetailItem | null;
  loading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;

  // Custom Navigation Links
  backLink?: string;
  backLinkLabel?: string;
  getSectionDetailLink?: (sectionId: string) => string;
  getClassDetailLink?: (classId: string) => string;

  // Role & Header Customization
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  headerActions?: React.ReactNode;

  // Admin Callbacks
  onEditStudent?: () => void;
  onDeleteStudent?: () => void;
  isDeleting?: boolean;

  // Teacher Callbacks / Links
  attendanceLink?: string;
}

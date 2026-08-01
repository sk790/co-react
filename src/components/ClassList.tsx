import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Layers,
  Search,
  RefreshCw,
  ClipboardCheck,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { EmptyState } from './EmptyState';
import { DataCard } from './DataCard';
import { LoadingState } from './LoadingState';

export interface SectionItem {
  id: string;
  title: string;
  teacher?: {
    user?: {
      name?: string;
    };
  };
}

export interface ClassItem {
  id: string;
  title: string;
  description?: string;
  classTeacherId?: string;
  sections?: SectionItem[];
  studentsCount?: number;
}

export interface ClassListProps {
  classes: ClassItem[];
  loading?: boolean;
  initialViewMode?: 'grid' | 'list';
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;

  // Navigation & Action callbacks
  getStudentsLink?: (cls: ClassItem) => string;
  getAttendanceLink?: (cls: ClassItem) => string;
  getDetailLink?: (cls: ClassItem) => string;

  // Admin actions
  showAdminActions?: boolean;
  onEditClass?: (cls: ClassItem) => void;
  onDeleteClass?: (classId: string) => void;
  onAddSection?: (cls: ClassItem) => void;
  deletingId?: string | null;

  emptyMessage?: string;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  loading = false,
  initialViewMode = 'list',
  viewMode: controlledViewMode,
  onViewModeChange,
  searchTerm: controlledSearchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing = false,
  getStudentsLink = () => '/teacher/students',
  getAttendanceLink = () => '/teacher/attendance',
  getDetailLink,
  showAdminActions = false,
  onEditClass,
  onDeleteClass,
  onAddSection,
  deletingId,
  emptyMessage = 'No classes available.',
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  const currentViewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const currentSearchTerm = controlledSearchTerm !== undefined ? controlledSearchTerm : internalSearchTerm;

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const handleSearchChange = (term: string) => {
    if (onSearchChange) {
      onSearchChange(term);
    } else {
      setInternalSearchTerm(term);
    }
  };

  const filteredClasses = classes.filter(cls => {
    if (!currentSearchTerm.trim()) return true;
    const q = currentSearchTerm.toLowerCase();
    return (
      cls.title?.toLowerCase().includes(q) ||
      (cls.description && cls.description.toLowerCase().includes(q)) ||
      cls.sections?.some(sec => sec.title?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Search Bar & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes or sections..."
            value={currentSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Classes"
              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw size={18} className={isRefreshing || loading ? 'animate-spin' : ''} />
            </button>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${currentViewMode === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all ${currentViewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Loading Classes..." />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          title={currentSearchTerm ? 'No matching classes found' : 'No classes created yet'}
          description={
            currentSearchTerm
              ? `We couldn't find any classes matching "${currentSearchTerm}".`
              : emptyMessage
          }
        />
      ) : currentViewMode === 'grid' ? (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const detailUrl = getDetailLink ? getDetailLink(cls) : null;

            return (
              <DataCard
                key={cls.id}
                icon={BookOpen}
                title={cls.title}
                titleLink={detailUrl || undefined}
                subtitle={cls.description || 'Class Orbit Academic Program'}
                badge={`${cls.sections?.length || 0} ${cls.sections?.length === 1 ? 'Section' : 'Sections'}`}
                headerActions={
                  showAdminActions ? (
                    <div className="flex items-center gap-1">
                      {onEditClass && (
                        <button
                          onClick={() => onEditClass(cls)}
                          title="Edit Class"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}
                      {onDeleteClass && (
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <button
                                disabled={deletingId === cls.id}
                                title="Delete Class"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={15} />
                              </button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you absolutely sure you want to delete "{cls.title}" and all its associated sections?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <button
                                onClick={() => onDeleteClass(cls.id)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 h-10 py-2 px-4"
                              >
                                Delete
                              </button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ) : null
                }
                tags={cls.sections?.map(sec => ({
                  id: sec.id,
                  label: `Sec ${sec.title}`,
                  icon: Layers
                }))}
                footerActions={
                  showAdminActions ? (
                    onAddSection && (
                      <button
                        onClick={() => onAddSection(cls)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-purple-700 font-semibold rounded-xl text-xs transition-all shadow-xs"
                      >
                        <Plus size={14} /> Add New Section
                      </button>
                    )
                  ) : [
                    {
                      label: 'View Students',
                      href: getStudentsLink(cls),
                      icon: Users,
                      variant: 'text'
                    },
                    {
                      label: 'Attendance',
                      href: getAttendanceLink(cls),
                      icon: ClipboardCheck,
                      variant: 'primary'
                    }
                  ]
                }
              />
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Class Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Sections</th>
                  <th className="px-6 py-4">Total Sections</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((cls) => {
                  const detailUrl = getDetailLink ? getDetailLink(cls) : null;

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <BookOpen size={16} />
                          </div>
                          {detailUrl ? (
                            <Link to={detailUrl} className="hover:text-purple-600 transition-colors">
                              {cls.title}
                            </Link>
                          ) : (
                            <span>{cls.title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {cls.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(!cls.sections || cls.sections.length === 0) ? (
                            <span className="text-slate-400 font-normal">—</span>
                          ) : (
                            <>
                              {cls.sections.slice(0, 3).map((sec) => (
                                <span key={sec.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200">
                                  {sec.title}
                                </span>
                              ))}
                              {cls.sections.length > 3 && (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md border border-purple-200 text-[11px]">
                                  +{cls.sections.length - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                          {cls.sections?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {showAdminActions ? (
                          <div className="flex items-center justify-end gap-2">
                            {onAddSection && (
                              <button
                                onClick={() => onAddSection(cls)}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Plus size={14} /> Section
                              </button>
                            )}
                            {onEditClass && (
                              <button
                                onClick={() => onEditClass(cls)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit3 size={15} />
                              </button>
                            )}
                            {onDeleteClass && (
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <button
                                      disabled={deletingId === cls.id}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  }
                                />
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you absolutely sure you want to delete "{cls.title}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <button
                                      onClick={() => onDeleteClass(cls.id)}
                                      className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 h-10 py-2 px-4"
                                    >
                                      Delete
                                    </button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={getStudentsLink(cls)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-purple-100"
                            >
                              <Users size={14} /> View Students
                            </Link>
                            <Link
                              to={getAttendanceLink(cls)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                            >
                              <ClipboardCheck size={14} /> Attendance
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

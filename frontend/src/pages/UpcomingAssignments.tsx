import { useState, useEffect, useMemo } from 'react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/Sidebar';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Plus, Play, CheckCircle, Star, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Assignment {
  id: number;
  name: string;
  courseId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  deadline: string;
}

interface GradeDialogData {
  isOpen: boolean;
  assignmentId: number | null;
  assignmentName: string;
  courseId: number;
}

// Cache for assignments data
interface AssignmentsCache {
  data: Assignment[] | null;
  timestamp: number | null;
}

function getDueDateDisplay(deadline: string, status: string): { text: string; className: string } {
  // If the assignment is completed, don't show due date
  if (status === 'completed') {
    return { text: '', className: '' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(deadline);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < -1) {
    return { text: 'Overdue', className: 'bg-red-100 text-red-800' };
  } else if (diffDays === -1) {
    return { text: 'Due today', className: 'bg-orange-100 text-orange-800' };
  } else if (diffDays === 0) {
    return { text: 'Due tomorrow', className: 'bg-yellow-100 text-yellow-800' };
  } else if (diffDays <= 6) {
    return { text: `Due in ${diffDays} days`, className: 'bg-blue-100 text-blue-800' };
  } else {
    return { text: `Due in ${diffDays} days`, className: 'bg-gray-100 text-gray-800' };
  }
}

export default function UpcomingAssignments() {
  const { activeCourses } = useCourses();
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    status: 'not_started' as const,
    deadline: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradeDialog, setGradeDialog] = useState<GradeDialogData>({
    isOpen: false,
    assignmentId: null,
    assignmentName: '',
    courseId: 0,
  });
  const [gradeData, setGradeData] = useState({
    name: '',
    grade: '',
    weight: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cache, setCache] = useState<AssignmentsCache>({
    data: null,
    timestamp: null
  });
  const { toast } = useToast();

  // Cache expiration time (5 minutes)
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  const fetchAssignments = async () => {
    if (!token) return;
    
    // Check if we have valid cached data
    const now = Date.now();
    if (cache.data && cache.timestamp && (now - cache.timestamp < CACHE_EXPIRATION)) {
      setAssignments(cache.data);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get('https://scholarlog-api.onrender.com/api/upcoming-assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAssignments(res.data);
      
      // Update cache
      setCache({
        data: res.data,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch assignments'));
      toast({
        title: "Error",
        description: "Failed to fetch assignments. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://scholarlog-api.onrender.com/api/upcoming-assignments',
        {
          name: formData.name,
          courseId: parseInt(formData.courseId),
          status: formData.status,
          deadline: formData.deadline,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Add new assignment and sort by deadline
      setAssignments(prev => [...prev, response.data].sort((a, b) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ));
      
      // Update cache
      setCache({
        data: [...(cache.data || []), response.data].sort((a, b) => 
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        ),
        timestamp: Date.now()
      });
      
      setFormData({
        name: '',
        courseId: '',
        status: 'not_started',
        deadline: '',
      });
      setIsModalOpen(false);

      toast({
        title: "Assignment added",
        description: "The upcoming assignment has been successfully added.",
      });
    } catch (err) {
      console.error('Failed to add assignment:', err);
      toast({
        title: "Error",
        description: "Failed to add the assignment. Please try again.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://scholarlog-api.onrender.com/api/upcoming-assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedAssignments = assignments.filter(a => a.id !== id);
      setAssignments(updatedAssignments);
      
      // Update cache
      setCache({
        data: updatedAssignments,
        timestamp: Date.now()
      });
      
      toast({
        title: "Assignment deleted",
        description: "The upcoming assignment has been successfully deleted.",
      });
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      toast({
        title: "Error",
        description: "Failed to delete the assignment. Please try again.",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSetInProgress = async (assignmentId: number) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      await axios.put(
        `https://scholarlog-api.onrender.com/api/upcoming-assignments/${assignmentId}`,
        {
          name: assignment.name,
          status: 'in_progress',
          deadline: assignment.deadline
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const updatedAssignments = assignments.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, status: 'in_progress' }
          : assignment
      );
      
      setAssignments(updatedAssignments as Assignment[]);
      
      // Update cache
      setCache({
        data: updatedAssignments as Assignment[],
        timestamp: Date.now()
      });

      toast({
        title: "Status Updated",
        description: "Assignment has been set to in progress.",
      });
    } catch (err) {
      console.error("Failed to update assignment status:", err);
      toast({
        title: "Error",
        description: "Failed to update assignment status. Please try again.",
      });
    }
  };

  const handleComplete = async (assignmentId: number) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      await axios.put(
        `https://scholarlog-api.onrender.com/api/upcoming-assignments/${assignmentId}`,
        {
          name: assignment.name,
          status: 'completed',
          deadline: assignment.deadline
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const updatedAssignments = assignments.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, status: 'completed' }
          : assignment
      );
      
      setAssignments(updatedAssignments as Assignment[]);
      
      // Update cache
      setCache({
        data: updatedAssignments as Assignment[],
        timestamp: Date.now()
      });

      toast({
        title: "Assignment Completed",
        description: "The assignment has been marked as completed.",
      });
    } catch (err) {
      console.error("Failed to complete assignment:", err);
      toast({
        title: "Error",
        description: "Failed to mark assignment as completed. Please try again.",
      });
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'not_started':
        return { text: 'Not Started', className: 'bg-gray-100 text-gray-800' };
      case 'in_progress':
        return { text: 'In Progress', className: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { text: 'Completed', className: 'bg-green-100 text-green-800' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  // Memoize filtered assignments
  const activeAssignments = useMemo(() => 
    assignments.filter(a => a.status !== 'completed'),
    [assignments]
  );
  
  const completedAssignments = useMemo(() => 
    assignments.filter(a => a.status === 'completed'),
    [assignments]
  );

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeDialog.assignmentId) return;

    try {
      // Create the graded assignment
      await axios.post(
        'https://scholarlog-api.onrender.com/api/assignments',
        {
          name: gradeData.name,
          grade: parseFloat(gradeData.grade),
          weight: parseFloat(gradeData.weight),
          courseId: gradeDialog.courseId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Delete the upcoming assignment
      await axios.delete(
        `https://scholarlog-api.onrender.com/api/upcoming-assignments/${gradeDialog.assignmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const updatedAssignments = assignments.filter(a => a.id !== gradeDialog.assignmentId);
      setAssignments(updatedAssignments);
      
      // Update cache
      setCache({
        data: updatedAssignments,
        timestamp: Date.now()
      });

      // Close dialog and reset form
      setGradeDialog({ isOpen: false, assignmentId: null, assignmentName: '', courseId: 0 });
      setGradeData({ name: '', grade: '', weight: '' });

      toast({
        title: "Assignment Graded",
        description: "The assignment has been added to your course grades.",
      });
    } catch (err) {
      console.error("Failed to grade assignment:", err);
      toast({
        title: "Error",
        description: "Failed to grade the assignment. Please try again.",
      });
    }
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGradeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openGradeDialog = (assignment: Assignment) => {
    setGradeDialog({
      isOpen: true,
      assignmentId: assignment.id,
      assignmentName: assignment.name,
      courseId: assignment.courseId,
    });
    setGradeData({
      name: assignment.name,
      grade: '',
      weight: '',
    });
  };

  // Render loading state
  if (isLoading && !assignments.length) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Upcoming</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading your assignments...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Render error state
  if (error && !assignments.length) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Upcoming</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center text-center">
              <p className="text-red-500 font-medium">Error loading assignments</p>
              <p className="mt-2 text-muted-foreground max-w-md">We couldn't load your assignments. Please try again later.</p>
              <Button 
                className="mt-4" 
                onClick={() => fetchAssignments()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Upcoming</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {activeCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={todayString}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                >
                  Add Assignment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading indicator for refreshing data */}
        {isLoading && assignments.length > 0 && (
          <div className="flex items-center justify-center py-2 mb-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Refreshing...</span>
          </div>
        )}

        {/* Active Assignments List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
          {activeAssignments.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <p className="text-lg">No upcoming assignments found.</p>
              <p className="text-sm">Click the button above to add your first assignment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeAssignments.map(assignment => {
                const dueDateInfo = getDueDateDisplay(assignment.deadline, assignment.status);
                const statusInfo = getStatusDisplay(assignment.status);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{assignment.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {activeCourses.find(c => c.id === assignment.courseId)?.name}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                        {dueDateInfo.text && (
                          <>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${dueDateInfo.className}`}>
                              {dueDateInfo.text}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.status === 'not_started' && (
                        <Button
                          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100"
                          onClick={() => handleSetInProgress(assignment.id)}
                        >
                          <Play className="w-4 h-4" />
                          Set to In Progress
                        </Button>
                      )}
                      {assignment.status === 'in_progress' && (
                        <Button
                          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100"
                          onClick={() => handleComplete(assignment.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </Button>
                      )}
                      <Button
                        className="text-gray-600 hover:bg-gray-100"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Assignments List */}
        {completedAssignments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Assignments</h2>
            <div className="grid gap-4">
              {completedAssignments.map(assignment => {
                const statusInfo = getStatusDisplay(assignment.status);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{assignment.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {activeCourses.find(c => c.id === assignment.courseId)?.name}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100"
                        onClick={() => openGradeDialog(assignment)}
                      >
                        <Star className="w-4 h-4" />
                        Grade
                      </Button>
                      <Button
                        className="text-gray-600 hover:bg-gray-100"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grade Dialog */}
        <Dialog open={gradeDialog.isOpen} onOpenChange={(open) => setGradeDialog(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label htmlFor="grade-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Name
                </label>
                <input
                  type="text"
                  id="grade-name"
                  name="name"
                  value={gradeData.name}
                  onChange={handleGradeChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (%)
                </label>
                <input
                  type="number"
                  id="grade"
                  name="grade"
                  value={gradeData.grade}
                  onChange={handleGradeChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={gradeData.weight}
                  onChange={handleGradeChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
              >
                Add Grade
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}
import { useState, useEffect } from 'react';
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
import { Plus } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Assignment {
  id: number;
  name: string;
  courseId: number;
  status: 'not_started' | 'in_progress';
  deadline: string;
}

function getDueDateDisplay(deadline: string): { text: string; className: string } {
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
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    
    // Fetch assignments when component mounts
    axios.get('https://scholarlog-api.onrender.com/api/upcoming-assignments', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAssignments(res.data))
    .catch(err => {
      console.error('Failed to fetch assignments:', err);
      toast({
        title: "Error",
        description: "Failed to fetch assignments. Please try again.",
      });
    });
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
      setAssignments(prev => prev.filter(a => a.id !== id));
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

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

        {/* Assignments List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500">No assignments added yet.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map(assignment => {
                const dueDateInfo = getDueDateDisplay(assignment.deadline);
                return (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{assignment.name}</h3>
                        <p className="text-sm text-gray-600">
                          Course: {activeCourses.find(c => c.id === assignment.courseId)?.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'not_started' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {assignment.status === 'not_started' ? 'Not Started' : 'In Progress'}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${dueDateInfo.className}`}>
                          {dueDateInfo.text}
                        </span>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
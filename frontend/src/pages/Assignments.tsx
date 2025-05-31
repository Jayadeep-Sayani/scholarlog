import { useState } from 'react';
import { useCourses } from '../context/CourseContext';

interface Assignment {
  id: string;
  name: string;
  courseId: string;
  status: 'not_started' | 'in_progress';
  deadline: string;
}

export default function Assignments() {
  const { courses } = useCourses();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    status: 'not_started',
    deadline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      ...formData,
    };
    setAssignments([...assignments, newAssignment]);
    setFormData({
      name: '',
      courseId: '',
      status: 'not_started',
      deadline: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Assignments</h1>
      
      {/* Add Assignment Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Assignment</h2>
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
              {courses.map(course => (
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
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Assignment
          </button>
        </form>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments added yet.</p>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => (
              <div
                key={assignment.id}
                className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{assignment.name}</h3>
                    <p className="text-sm text-gray-600">
                      Course: {courses.find(c => c.id === assignment.courseId)?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'not_started' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {assignment.status === 'not_started' ? 'Not Started' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Deadline: {new Date(assignment.deadline).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
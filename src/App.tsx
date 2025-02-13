import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { Student } from './types';

function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    const savedStudents = localStorage.getItem('students');
    return savedStudents ? JSON.parse(savedStudents) : [];
  });
  const [newStudentName, setNewStudentName] = useState('');
  const [showError, setShowError] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(() => {
    const savedTotalPoints = localStorage.getItem('totalPoints');
    return savedTotalPoints ? JSON.parse(savedTotalPoints) : 0;
  });

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('totalPoints', JSON.stringify(totalPoints));
  }, [totalPoints]);

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      setShowError(true);
      return;
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      points: 0,
      paid: false,
    };

    setStudents([...students, newStudent]);
    setNewStudentName('');
    setShowError(false);
  };

  const addPoints = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, points: student.points + 25 }
        : student
     ));
    setTotalPoints(totalPoints + 25);
  };

  const removePoints = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId && student.points >= 25
        ? { ...student, points: student.points - 25 }
        : student
     ));
    setTotalPoints(totalPoints - 25);
  };

  const togglePaid = (studentId: string) => {
    if (confirmingPayment === studentId) {
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, paid: !student.paid }
          : student
      ));
      setConfirmingPayment(null);
    } else {
      setConfirmingPayment(studentId);
    }
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find(student => student.id === studentId);
    if (student && student.paid) {
      setStudents(students.filter(student => student.id !== studentId));
    } else {
      toast.error("Student must be marked as balance before deleting.");
    }
  };

  const resetTotalPoints = () => {
    setTotalPoints(0);
  };

  // Calculate payment statistics
  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.paid).length;
  const pendingStudents = totalStudents - paidStudents;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 overflow-x-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Student Management
        </h1>

        {/* Payment Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Paid</h3>
            <p className="text-2xl font-bold text-green-600">{paidStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-red-600">{pendingStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Points</h3>
            <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
          </div>
        </div>

        {/* Form to add students and reset total points */}
        <div className="flex gap-4 mb-8">
          <form onSubmit={addStudent} className="flex-1">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => {
                    setNewStudentName(e.target.value);
                    if (showError) setShowError(false);
                  }}
                  placeholder="Student name"
                  className={`w-full rounded-lg border ${
                    showError ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                />
                {showError && (
                  <p className="absolute text-sm text-red-600 mt-1">
                    Please enter the student's name
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                Add Student
              </button>
            </div>
          </form>
          <div className="flex flex-col justify-end">
            <button
              onClick={resetTotalPoints}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
            >
              Reset Total Points
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.points} Points
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.paid ? 'Saldo' : 'Pendiente'}
                      </span>
                      <button
                        onClick={() => togglePaid(student.id)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          confirmingPayment === student.id
                            ? 'bg-yellow-100 text-yellow-800'
                            : student.paid
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {confirmingPayment === student.id
                          ? '¿Confirmar cambio?'
                          : student.paid
                          ? 'Marcar Pendiente'
                          : 'Marcar Saldo'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => addPoints(student.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Agregar 25 puntos"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removePoints(student.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Quitar 25 puntos"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Eliminar estudiante"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    There 're no registered students
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
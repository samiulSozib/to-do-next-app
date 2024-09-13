import React, { useState, useEffect } from 'react';
import { nhost } from '../utils/nhost';
import { useAuthenticationStatus } from '@nhost/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';



type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  category: string;
};

import { 
  GET_TODOS_BY_USER_ID, 
  INSERT_TODO, 
  UPDATE_TODO, 
  DELETE_TODO, 
  INSERT_TRASH, 
  MOVE_TO_TRASH, 
  UPDATE_TODO_COMPLETED 
} from '../graphql/queries';




const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: 'Personal' });
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [suggestions, setSuggestions] = useState('');
  const router=useRouter()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const toggleOrder = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
    fetchTodos(itemsPerPage, (currentPage - 1) * itemsPerPage, order === 'asc' ? 'desc' : 'asc');
  };

  const handleToggleTodo = async(id: string, currentCompletedStatus: boolean) => {
    try {
      const newCompletedStatus = !currentCompletedStatus; // Toggle the completed status
  
      const response = await nhost.graphql.request(UPDATE_TODO_COMPLETED, {
        id,
        completed: newCompletedStatus,
      });
  
      if (response.error) {
        console.error('Error updating ToDo:', response.error);
      } else {
        // Optimistically update the UI
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, completed: newCompletedStatus } : task
          )
        );
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };

  const fetchTodos = async (limit: number, offset: number, order: 'asc' | 'desc') => {
    const user = nhost.auth.getUser();
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
  
    try {
      const response = await nhost.graphql.request(GET_TODOS_BY_USER_ID, {
        user_id: user.id,
        limit,
        offset,
        order_by: order, // Pass the order here
      });
  
      if (response.error) {
        console.error('Error fetching ToDos:', response.error);
      } else {
        setTasks(response.data.todos);
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };
  
  

  const handleAddTodo = async () => {
    const user = nhost.auth.getUser();
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }
  
    if (!newTask.title || !newTask.description || !newTask.category) {
      alert("All fields are required!");
      return;
    }
  
    const newTodo = {
      user_id: user.id,
      title: newTask.title,
      description: newTask.description,
      completed: false,
      category: newTask.category,
    };
  
    try {
      const response = await nhost.graphql.request(INSERT_TODO, newTodo);
     
      if (response.error) {
        console.error('Error inserting ToDo:', response.error);
      } else {
        // Directly update the tasks state
        setTasks((prevTasks) => [
          ...prevTasks,
          {
            id: response.data.insert_todos_one.id,
            user_id: user.id,
            title: newTask.title,
            description: newTask.description,
            completed: false,
            created_at: response.data.insert_todos_one.created_at, 
            updated_at: response.data.insert_todos_one.updated_at,
            category: newTask.category,
          },
        ]);
        // Clear the input fields and close the modal
        setNewTask({ title: '', description: '', category: 'Personal' });
        setSuggestions('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };
  

  const handleUpdateTodo = async () => {
    if (!selectedTask) return;
    if (!selectedTask.title || !selectedTask.description || !selectedTask.category) {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await nhost.graphql.request(UPDATE_TODO, {
        id: selectedTask.id,
        title: selectedTask.title,
        description: selectedTask.description,
        category: selectedTask.category,
        completed: selectedTask.completed,
      });

      if (response.error) {
        console.error('Error updating ToDo:', response.error);
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === selectedTask.id ? { ...selectedTask } : task
          )
        );
        setShowUpdateModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };

  const handleOpenUpdateModal = (task: Todo) => {
    setSelectedTask(task);
    setShowUpdateModal(true);
  };

  

  const handleDeleteTodo = async () => {
    if (!selectedTask) return;

    try {

      const result=await nhost.graphql.request(INSERT_TRASH,{
        user_id:selectedTask.user_id,
        title:selectedTask.title,
        description:selectedTask.description,
        completed:selectedTask.completed,
        created_at:selectedTask.created_at,
        updated_at:selectedTask.updated_at,
        category:selectedTask.category
      })

      if(result.error){
        alert('Error moving task to trash: ');
        return;
      }

      const response = await nhost.graphql.request(DELETE_TODO, { id: selectedTask.id });


 
      
      //const response=await nhost.graphql.request(MOVE_TO_TRASH,{todo_id:selectedTask.id})

      console.log(response)
      if (response.error) {
        console.error('Error deleting ToDo:', response.error);
      } else {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTask.id));
        setShowDeleteDialog(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };

  // const handleDeleteTodo = async () => {
  //   if (!selectedTask) return;
  
  //   try {
  //     const response = await fetch('/api/move-to-trash', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'x-hasura-admin-secret':'m^ig3&yi3@G5TGV_C3aT-M3;YZ_7TsQo'
  //       },
  //       body: JSON.stringify({ task_id: selectedTask.id }),
  //     });

      
  // console.log(response)
  //     const result = await response.json();
  
  //     if (!response.ok) {
  //       console.error('Error moving task to trash:', result.message);
  //     } else {
  //       setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTask.id));
  //       setShowDeleteDialog(false);
  //       setSelectedTask(null);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };
  
  
  const handleOpenDeleteDialog = (task: Todo) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const handleGetSuggestions = async () => {
    try {
      const response = await fetch('/api/get-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTask.title }),
      });
  
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth'); // Redirect to authentication page if not authenticated
      } else {
        fetchTodos(itemsPerPage, (currentPage - 1) * itemsPerPage, order); // Pass the order state
      }
    }
  }, [isAuthenticated, isLoading, currentPage, order]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
    fetchTodos(itemsPerPage, currentPage * itemsPerPage,order);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchTodos(itemsPerPage, (currentPage - 2) * itemsPerPage,order);
    }
  };

  return (
    
    <div>

      <Navbar/>

      <div className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className='flex flex-col'>
              <h2 className="text-lg font-semibold text-gray-900">ToDo Lists</h2>
              <button
                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                onClick={toggleOrder}>{order === 'asc' ? 'Newest' : 'Oldest'}
              </button>
            </div>


            


            <button
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
              onClick={() => setShowAddModal(true)}
            >
              Add ToDo
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                <th className="px-6 py-3">
                  
                </th>
                <th className='px-6 py-3'>

                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((todo) => (
                <tr key={todo.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => handleToggleTodo(todo.id, todo.completed)}
                    />
                  </td>
                  <td className="px-6 py-4">{todo.title}</td>
                  <td className="px-6 py-4">{todo.description}</td>
                  <td className="px-6 py-4">{todo.category}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleOpenUpdateModal(todo)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                  <button
                      className="text-red-600 hover:text-red-900 ml-2"
                      onClick={() => handleOpenDeleteDialog(todo)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <div className="flex justify-center items-center mt-6">
              <button
                className="bg-gray-300 py-2 px-4 rounded-lg mr-3"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>Page {currentPage}</span>

              <button
                className="bg-gray-300 py-2 px-4 rounded-lg ml-3"
                onClick={handleNextPage}
              >
                Next
              </button>
          </div>

        </div>
      </div>

      {/* Modal for adding a new task */}

      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
                <div>
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className={`border ${!newTask.title ? 'border-red-500' : 'border-gray-300'} rounded-md w-full p-2 mb-4`}
                    required
                  />
                  <button
                    onClick={handleGetSuggestions}
                    className="bg-blue-600 text-white py-1 px-2 rounded-md mb-4"
                  >
                    Get AI Suggestions
                  </button>

                  <textarea
                    placeholder="Task Description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className={`border ${!newTask.description ? 'border-red-500' : 'border-gray-300'} rounded-md w-full p-2 mb-4`}
                    required
                  />
                  {suggestions && (
                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                      <h4 className="text-gray-600 font-semibold">AI Suggestions:</h4>
                      <p>{suggestions}</p>
                      <button
                        onClick={() => setNewTask({ ...newTask, description: suggestions })}
                        className="bg-green-600 text-white py-1 px-2 rounded-md mt-2"
                      >
                        Use Suggestion
                      </button>
                    </div>
                  )}

                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className={`border ${!newTask.category ? 'border-red-500' : 'border-gray-300'} rounded-md w-full p-2 mb-4`}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div className="mt-5">
                  <button
                    onClick={handleAddTodo}
                    className={`bg-purple-600 text-white py-2 px-4 rounded-lg w-full ${(!newTask.title || !newTask.description || !newTask.category) && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!newTask.title || !newTask.description || !newTask.category}
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 text-gray-500 w-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        </div> 
      )}



      {/* Modal for updating a task */}
      {showUpdateModal && selectedTask && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Task</h3>
              <div>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                  className={`border ${
                    !selectedTask.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-md w-full p-2 mb-4`}
                  required
                />
                <textarea
                  value={selectedTask.description}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  className={`border ${
                    !selectedTask.description ? 'border-red-500' : 'border-gray-300'
                  } rounded-md w-full p-2 mb-4`}
                  required
                />
                <select
                  value={selectedTask.category}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, category: e.target.value })
                  }
                  className={`border ${
                    !selectedTask.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-md w-full p-2 mb-4`}
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="mt-5">
                <button
                  onClick={handleUpdateTodo}
                  className={`bg-purple-600 text-white py-2 px-4 rounded-lg w-full ${
                    (!selectedTask.title ||
                      !selectedTask.description ||
                      !selectedTask.category) &&
                    'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={
                    !selectedTask.title || !selectedTask.description || !selectedTask.category
                  }
                >
                  Update Task
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="mt-3 text-gray-500 w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Delete Alert Dialog */}
      {showDeleteDialog && selectedTask && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
              <p>Are you sure you want to delete this task?</p>
              <div className="mt-5">
                <button
                  onClick={handleDeleteTodo}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg w-full"
                >
                  Delete Task
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="mt-3 text-gray-500 w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

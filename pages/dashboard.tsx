import React, { useState, useEffect } from 'react';
import { nhost } from '../utils/nhost';
import { useAuthenticationStatus } from '@nhost/react';
import { useRouter } from 'next/router';

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

const GET_TODOS_BY_USER_ID = `
query GetTodosByUserId($user_id: uuid!) {
  todos(where: {user_id: {_eq: $user_id}}) {
    id
    user_id
    title
    description
    completed
    created_at
    updated_at
    category
  }
}
`;

const INSERT_TODO = `
mutation InsertTodo($user_id: uuid, $title: String, $description: String, $completed: Boolean, $category: String) {
  insert_todos(objects: { user_id: $user_id, title: $title, description: $description, completed: $completed, category: $category }) {
    affected_rows
  }
}
`;

const UPDATE_TODO = `
mutation UpdateTodo($id: uuid!, $title: String!, $description: String!, $category: String!, $completed: Boolean!) {
  update_todos(where: {id: {_eq: $id}}, _set: {title: $title, description: $description, category: $category, completed: $completed}) {
    affected_rows
  }
}
`;

const DELETE_TODO = `
mutation DeleteTodo($id: uuid!) {
  delete_todos(where: {id: {_eq: $id}}) {
    affected_rows
  }
}
`;

const INSERT_TRASH = `
mutation InsertTodo($user_id: uuid, $title: String, $description: String, $completed: Boolean,$created_at:timestamptz,$updated_at:timestamptz, $category: String) {
  insert_trash(objects: { user_id: $user_id, title: $title, description: $description, completed: $completed,created_at:$created_at,updated_at:$updated_at, category: $category }) {
    affected_rows
  }
}
`;



const UPDATE_TODO_COMPLETED = `
mutation UpdateTodoCompleted($id: uuid!, $completed: Boolean!) {
  update_todos(where: {id: {_eq: $id}}, _set: {completed: $completed}) {
    affected_rows
  }
}
`;

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

  const fetchTodos = async () => {
    const user = nhost.auth.getUser();
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      const response = await nhost.graphql.request(GET_TODOS_BY_USER_ID, { user_id: user.id });
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

    const newTodo = {
      user_id: user.id,
      title: newTask.title,
      description: newTask.description,
      completed: false,
      category: newTask.category,
    };
    setNewTask({ title: '', description: '', category: 'Personal' });
    setSuggestions('')
    setShowAddModal(false);

    try {
      const response = await nhost.graphql.request(INSERT_TODO, newTodo);
      if (response.error) {
        console.error('Error inserting ToDo:', response.error);
      } else {
        const response1 = await nhost.graphql.request(GET_TODOS_BY_USER_ID, { user_id: user.id });
        setTasks(response1.data.todos);
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
    }
  };

  const handleUpdateTodo = async () => {
    if (!selectedTask) return;

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
    if (isAuthenticated && !isLoading) {
      fetchTodos();
    }
  }, [isAuthenticated, isLoading]);

  const gotoTrash=()=>{
    router.push('/trash')
  }

  return (
    <div>
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">To Do</h2>
              <button onClick={gotoTrash}>Trash</button>
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
                <th className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
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
            className="border border-gray-300 rounded-md w-full p-2 mb-4"
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
            className="border border-gray-300 rounded-md w-full p-2 mb-4"
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
            className="border border-gray-300 rounded-md w-full p-2 mb-4"
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="mt-5">
          <button
            onClick={handleAddTodo}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg w-full"
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
                  className="border border-gray-300 rounded-md w-full p-2 mb-4"
                />
                <textarea
                  value={selectedTask.description}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, description: e.target.value })
                  }
                  className="border border-gray-300 rounded-md w-full p-2 mb-4"
                />
                <select
                  value={selectedTask.category}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, category: e.target.value })
                  }
                  className="border border-gray-300 rounded-md w-full p-2 mb-4"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="mt-5">
                <button
                  onClick={handleUpdateTodo}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg w-full"
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

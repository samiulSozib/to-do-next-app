import React, { useState,useEffect } from 'react'
import { nhost } from '../utils/nhost';
import { useAuthenticationStatus } from '@nhost/react';
import {useRouter} from 'next/router'
import Navbar from '../component/Navbar';


type TRASH = {
    id: string;
    user_id: string;
    title: string;
    description: string;
    completed: boolean;
    deleted_at:string;
    created_at: string;
    updated_at: string;
    category: string;
  };

  import { 
    GET_TRASHS_BY_USER_ID,
    DELETE_TRASH,
    DELETE_ALL_TRASH
  } from '../graphql/queries';


const Trash:React.FC = () => {

    const { isAuthenticated, isLoading } = useAuthenticationStatus();
    const [trashs,setTrashs]=useState<TRASH[]>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
    const [selectedTrash, setselectedTrash] = useState<TRASH | null>(null);
    const router=useRouter()


    const fetchTrashs = async () => {
        const user = nhost.auth.getUser();
        if (!user) {
          console.error("User is not authenticated.");
          return;
        }
    
        try {
          const response = await nhost.graphql.request(GET_TRASHS_BY_USER_ID, { user_id: user.id });
          if (response.error) {
            console.error('Error fetching trashs:', response.error);
          } else {
            setTrashs(response.data.trash);
          }
        } catch (error) {
          console.error('GraphQL Error:', error);
        }
      };

      useEffect(() => {
        if (!isLoading) {
          if (!isAuthenticated) {
            router.push('/auth'); // Redirect to authentication page if not authenticated
          } else {
            fetchTrashs();
          }
        }
      }, [isAuthenticated, isLoading]);


      const handleOpenDeleteDialog = (trash: TRASH) => {
        setselectedTrash(trash);
        setShowDeleteDialog(true);
      };

      const handleDeleteTrash = async () => {
        if (!selectedTrash) return;
    
        try {
 
          const response = await nhost.graphql.request(DELETE_TRASH, { id: selectedTrash.id });
    
          if (response.error) {
            console.error('Error deleting ToDo:', response.error);
          } else {
            setTrashs((prevTasks) => prevTasks.filter((task) => task.id !== selectedTrash.id));
            setShowDeleteDialog(false);
            setselectedTrash(null);
          }
        } catch (error) {
          console.error('GraphQL Error:', error);
        }
      };

      const handleOpenDeleteAllDialog = () => {
        setShowDeleteAllDialog(true);
      };

      const handleDeleteAllTrash=async()=>{
        const user = nhost.auth.getUser();
        if (!user) {
            console.error("User is not authenticated.");
            return;
          }

        try {
 
            const response = await nhost.graphql.request(DELETE_ALL_TRASH, { user_id: user.id });
      
            if (response.error) {
              console.error('Error deleting ToDo:', response.error);
            } else {
              setTrashs([]);
              setShowDeleteAllDialog(false);
            }
          } catch (error) {
            console.error('GraphQL Error:', error);
          }
      }

  return (
    <div>

    <Navbar/>

      <div className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
              
            </div>
            <button
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
              onClick={handleOpenDeleteAllDialog}
            >
              Delete All
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
              {trashs.map((trash) => (
                <tr key={trash.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={trash.completed}
                      onChange={(e)=>{}}
                    />
                  </td>
                  <td className="px-6 py-4">{trash.title}</td>
                  <td className="px-6 py-4">{trash.description}</td>
                  <td className="px-6 py-4">{trash.category}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-red-600 hover:text-red-900 ml-2"
                      onClick={()=>handleOpenDeleteDialog(trash)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

              {/* Delete Alert Dialog */}
      {showDeleteDialog && selectedTrash && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
              <p>Are you sure you want to permanently delete this task?</p>
              <div className="mt-5">
                <button
                  onClick={handleDeleteTrash}
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

        {/* Delete All Alert Dialog */}
        {showDeleteAllDialog  && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete All Trash</h3>
              <p>Are you sure you want to permanently delete All trashs?</p>
              <div className="mt-5">
                <button
                  onClick={handleDeleteAllTrash}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg w-full"
                >
                  Delete Task
                </button>
                <button
                  onClick={() => setShowDeleteAllDialog(false)}
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
    </div>
  )
}

export default Trash
import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../config/axiosClient';
import { format } from 'date-fns'; // For pretty date formatting
import { useSelector } from 'react-redux';

// A small, reusable component for displaying status badges
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-blue-100 text-blue-800',
    Rejected: 'bg-red-100 text-red-800',
    Resolved: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const StudentGrievance = () => {

  const [view, setView] = useState('list');
  const [grievances, setGrievances] = useState([]);
  const [currentGrievance, setCurrentGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ category: 'Maintenance', description: '', isAnonymous: false });
  const [files, setFiles] = useState([]);
  const { user } = useSelector((state) => state.auth);


  // useCallback is used to memoize the function, preventing re-creation on every render
  // fetch grievances from server 
  const fetchGrievances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/grievance/get/${user?._id}`);
      setGrievances(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch grievances. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // UseEffect hook to fetch grievances when the component mounts
  useEffect(() => {
    if (view === 'list') {
      fetchGrievances();
    }
  }, [view, fetchGrievances]);

  // Handlers for various actions 
  const handleViewDetails = (grievance) => {
    setCurrentGrievance(grievance);
    setView('detail');
  };

  const handleCreateNew = () => {
    // Reset form fields before showing the create view
    setFormData({ category: 'Maintenance', description: '', isAnonymous: false });
    setFiles([]);
    setView('create');
  };

  const handleBackToList = () => {
    setCurrentGrievance(null);
    setView('list');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    setLoading(true);

    // We use FormData because we are sending files (multipart/form-data)
    const submissionData = new FormData();
    submissionData.append('category', formData.category);
    submissionData.append('description', formData.description);
    submissionData.append('isAnonymous', formData.isAnonymous);
    // Append all files
    for (let i = 0; i < files.length; i++) {
      submissionData.append('file', files[i]);
    }

    try {
      const response = await axiosClient.post(`/grievance/submit/${user?._id}`, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("resonse: ",response.data);
      alert('Grievance submitted successfully!');
      setView('list'); // Go back to the list view after submission
    } catch (err) {
      setError('Failed to submit grievance. Please check your input: '+err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Helper function to render the current view based on the state
  const renderContent = () => {
    if (loading && !currentGrievance) {
      return <div className="text-center p-8">Loading grievances...</div>;
    }

    if (error) {
      return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    switch (view) {
      // DETAIL VIEW
      case 'detail':
        return (
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <button onClick={handleBackToList} className="cursor-pointer mb-6 text-indigo-600 hover:text-indigo-800 font-medium">
              &larr; Back to List
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentGrievance.category}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Filed on: {format(new Date(currentGrievance.createdAt), 'MMMM dd, yyyy')}
                </p>
              </div>
              <StatusBadge status={currentGrievance.status} />
            </div>
            <hr className="my-6" />
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{currentGrievance.description}</p>
            </div>
            {currentGrievance.attachments && currentGrievance.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {currentGrievance.attachments.map(file => (
                    <a key={file.public_id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      View Attachment
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Comments Section */}
            <div className="mt-8">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Conversation Log</h3>
                <div className="space-y-4">
                    {currentGrievance.comments && currentGrievance.comments.length > 0 ? (
                        currentGrievance.comments.map(comment => (
                            <div key={comment._id} className={`p-4 rounded-lg ${comment.role === 'warden' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                                <p className="font-bold text-gray-700">{comment.authorName} ({comment.role})</p>
                                <p className="text-gray-600">{comment.text}</p>
                                <p className="text-xs text-gray-400 mt-1 text-right">{format(new Date(comment.createdAt), 'p, MMMM dd')}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No comments yet.</p>
                    )}
                </div>
            </div>
          </div>
        );
      
      // CREATE VIEW
      case 'create':
        return (
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <button onClick={handleBackToList} className="cursor-pointer mb-6 text-indigo-600 hover:text-indigo-800 font-medium">
              &larr; Cancel
            </button>
            <h2 className="cursor-pointer text-2xl font-bold text-gray-800 mb-6">File a New Grievance</h2>

            {/* Grievance Form */}
            <form onSubmit={handleSubmitGrievance}>
              <div className="space-y-6">

                {/* Select Category of Grievance */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select id="category" name="category" value={formData.category} onChange={handleFormChange} className="cursor-pointer mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option>Maintenance</option>
                    <option>Mess/Food Quality</option>
                    <option>Cleanliness</option>
                    <option>Security</option>
                    <option>Inter-student Conflict</option>
                    <option>Staff Issues</option>
                    <option>Washing Machine</option>
                    <option>Internet/WiFi</option>
                    <option>Geyser</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleFormChange} required className="p-4 mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                  <p className="mt-2 text-sm text-gray-500">Please be as detailed as possible.</p>
                </div>

                {/* File Attachments and Anonymous Checkbox */}
                <div>
                    <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">Attachments (Optional)</label>
                    <input type="file" id="attachments" name="attachments" multiple onChange={handleFileChange} className="cursor-pointer mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>

                {/* Submit Anonymously Checkbox */}
                <div className="flex items-center">
                  <input id="isAnonymous" name="isAnonymous" type="checkbox" checked={formData.isAnonymous} onChange={handleFormChange} className="cursor-pointer h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">Submit Anonymously</label>
                </div>
              </div>

              {/* loading button  */}
              <div className="mt-8">
                <button type="submit" disabled={loading} className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                  {loading ? 'Submitting...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        );

      // LIST VIEW (Default)
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Grievances</h1>
              <button onClick={handleCreateNew} className="cursor-pointer px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                + File a New Grievance
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {grievances.length > 0 ? grievances.map((g) => (
                  <li key={g._id} onClick={() => handleViewDetails(g)} className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">{g.category}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Filed on: {format(new Date(g.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge status={g.status} />
                        <svg className="h-5 w-5 text-gray-400 ml-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </li>
                )) : (
                  <li className="p-6 text-center text-gray-500">You have not filed any grievances yet.</li>
                )}
              </ul>
            </div>
          </>
        );
    }
  };

  return <div className="max-w-4xl mx-auto p-4 md:p-6">{renderContent()}</div>;
};

export default StudentGrievance;
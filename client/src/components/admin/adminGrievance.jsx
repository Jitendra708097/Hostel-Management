import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../config/axiosClient';
import { format } from 'date-fns';
import FullPageRefreshButton from '../../utils/refreshButton';
import AdminHeader from './AdminHeader';

// Reusable StatusBadge component (same as student's)
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


const WardenGrievance = () => {
  // State for view management ('list' or 'detail')
  const [view, setView] = useState('list');
  const [grievances, setGrievances] = useState([]);
  const [currentGrievance, setCurrentGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  
console.log("current: ",currentGrievance);
console.log("grievance: ",grievances);
  // --- DATA FETCHING ---
  const fetchAllGrievances = useCallback(async () => {
    try {
      setLoading(true);
         const response = await axiosClient.get(`/grievance/fetch`);
      setGrievances(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch grievances.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGrievanceDetails = useCallback(async ({ _id }) => {
    try {
      console.log("_id: ",_id);
        setLoading(true);
        const response = await axiosClient.get(`/grievance/details/${_id}`);
        setCurrentGrievance(response.data.data);
    } catch (err) {
        setError('Failed to fetch grievance details.');
    } finally {
        setLoading(false);
    }
  }, []);

  // Effect to fetch data based on the current view
  useEffect(() => {
    if (view === 'list') {
      fetchAllGrievances();
    }
  }, [view, fetchAllGrievances]);

  // --- HANDLERS ---
  const handleViewDetails = (grievance) => {
    fetchGrievanceDetails(grievance);
    setView('detail');
  };

  const handleBackToList = () => {
    setCurrentGrievance(null);
    setView('list');
  };
  
  // const currentGrievance._id = ""
  // Handler for updating grievance status
  const handleUpdateStatus = async (status) => {
    console.log("Hello0");
    setActionLoading(true);
    try {
      const response = await axiosClient.put(`/grievance/${currentGrievance._id}/status`, { status });
      // Update the status in the local state to reflect the change immediately
      console.log(response.data.data);
      setCurrentGrievance(response.data.data);
    } catch (err) {
      alert('Failed to update status.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for submitting a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return; // Don't submit empty comments

    setActionLoading(true);
    try {
      const response = await axiosClient.post(`/grievance/${currentGrievance._id}/comment`, { text: newComment });
      setCurrentGrievance(response.data.data); // Update the whole grievance object with the new comment
      setNewComment(''); // Clear the input field
    } catch (err) {
      alert('Failed to add comment.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (loading && !currentGrievance) {
      return <div className="text-center p-8">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }
    
    // DETAIL VIEW
    if (view === 'detail' && currentGrievance) {
      return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <button onClick={handleBackToList} className="cursor-pointer mb-6 text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Dashboard
          </button>
          
          {/* Grievance Info */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentGrievance.category}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Filed by: <span className="font-medium text-gray-700">{currentGrievance.isAnonymous ? 'Anonymous' : currentGrievance.studentId?.userName || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-500">
                On: {format(new Date(currentGrievance.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
            <StatusBadge status={currentGrievance.status} />
          </div>
          <hr className="my-6" />

          {/* Warden Actions */}
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdateStatus('Approved')} disabled={actionLoading} className="cursor-pointer px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">Approve</button>
                <button onClick={() => handleUpdateStatus('Rejected')} disabled={actionLoading} className="cursor-pointer px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300">Reject</button>
                <button onClick={() => handleUpdateStatus('Resolved')} disabled={actionLoading} className="cursor-pointer px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">Mark as Resolved</button>
            </div>
          </div>
          
          {/* Details & Comments */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{currentGrievance.description}</p>
          </div>
          <div className="mt-8">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Conversation Log</h3>
            <div className="space-y-4 mb-6">
                {currentGrievance.comments && currentGrievance.comments.length > 0 ? (
                    currentGrievance.comments.map(comment => (
                        <div key={comment._id} className={`p-4 rounded-lg ${comment.role === 'warden' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                            <p className="font-bold text-gray-700">{comment.authorName} <span className="text-sm font-normal">({comment.role})</span></p>
                            <p className="text-gray-600">{comment.text}</p>
                            <p className="text-xs text-gray-400 mt-1 text-right">{format(new Date(comment.createdAt), 'p, MMMM dd')}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No comments yet. Add the first one below.</p>
                )}
            </div>
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                  className="p-4 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add your comment..."></textarea>
                <button type="submit" disabled={actionLoading} className="cursor-pointer mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                    {actionLoading ? 'Posting...' : 'Post Comment'}
                </button>
            </form>
          </div>
        </div>
      );
    }
    
    // LIST VIEW (Default)
    return (
      <>
      <div className='mb-6'>
        <AdminHeader title="Grievance Dashboard" subtitle="View and manage submitted grievances" actions={<FullPageRefreshButton content="Refresh" className="cursor-pointer h-10 flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-slate-600 hover:bg-amber-700" />} />
      </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {grievances.length > 0 ? grievances.map((g) => (
              <li key={g._id} onClick={() => handleViewDetails(g)} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">{g.category}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      By: <span className="font-medium text-gray-700">{g.isAnonymous ? 'Anonymous' : g.studentId?.userName || 'N/A'}</span> on {format(new Date(g.createdAt), 'MMM dd, yyyy')}
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
              <li className="p-6 text-center text-gray-500">No grievances have been filed.</li>
            )}
          </ul>
        </div>
      </>
    );
  };

  return <div className="max-w-4xl mx-auto p-4 md:p-6">{renderContent()}</div>;
};

export default WardenGrievance;
import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../config/axiosClient';
import { format } from 'date-fns';
import FullPageRefreshButton from '../../utils/refreshButton';
import AdminHeader from './AdminHeader';
import { ArrowLeft, ChevronRight, MessageSquare, Send } from 'lucide-react';

// Reusable StatusBadge component (same as student's)
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Approved: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    Resolved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || statusStyles.Pending}`}>
      {status}
    </span>
  );
};


const WardenGrievance = () => {
  const [view, setView] = useState('list');
  const [grievances, setGrievances] = useState([]);
  const [currentGrievance, setCurrentGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [notice, setNotice] = useState(null);
  
  // DATA FETCHING
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
        setLoading(true);
        const response = await axiosClient.get(`/grievance/details/${_id}`);
        setCurrentGrievance(response.data.data);
    } catch {
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
  
  // Handler for updating grievance status
  const handleUpdateStatus = async (status) => {
    setActionLoading(true);
    try {
      const response = await axiosClient.put(`/grievance/${currentGrievance._id}/status`, { status });
      setCurrentGrievance(response.data.data);
      setNotice({ type: 'success', message: `Grievance marked as ${status}.` });
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to update status.' });
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
      setNotice({ type: 'success', message: 'Comment posted.' });
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to add comment.' });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (loading && !currentGrievance) {
      return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>;
    }
    
    // DETAIL VIEW
    if (view === 'detail' && currentGrievance) {
      return (
        <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={handleBackToList} className="cursor-pointer mb-6 inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
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
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
            <h3 className="font-semibold text-slate-800 mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdateStatus('Approved')} disabled={actionLoading} className="cursor-pointer px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">Approve</button>
                <button onClick={() => handleUpdateStatus('Rejected')} disabled={actionLoading} className="cursor-pointer px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300">Reject</button>
                <button onClick={() => handleUpdateStatus('Resolved')} disabled={actionLoading} className="cursor-pointer px-3 py-1 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-emerald-300">Mark as Resolved</button>
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
                        <div key={comment._id} className={`p-4 rounded-lg border ${comment.role === 'warden' ? 'bg-cyan-50 border-cyan-100' : 'bg-slate-50 border-slate-200'}`}>
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
                  className="p-4 block w-full shadow-sm sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  placeholder="Add your comment..."></textarea>
                <button type="submit" disabled={actionLoading} className="cursor-pointer mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-700 rounded-md hover:bg-cyan-800 disabled:bg-cyan-300">
                    <Send className="h-4 w-4" />
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
        <AdminHeader title="Grievance Dashboard" subtitle="View and manage submitted grievances" actions={<FullPageRefreshButton content="Refresh" className="cursor-pointer h-10 flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50" />} />
      </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {grievances.length > 0 ? grievances.map((g) => (
              <li key={g._id} onClick={() => handleViewDetails(g)} className="p-4 hover:bg-cyan-50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cyan-700 truncate">{g.category}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      By: <span className="font-medium text-gray-700">{g.isAnonymous ? 'Anonymous' : g.studentId?.userName || 'N/A'}</span> on {format(new Date(g.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <StatusBadge status={g.status} />
                    <ChevronRight className="h-5 w-5 text-slate-400 ml-4" />
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {notice && (
          <div className={`mb-4 rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            {notice.message}
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default WardenGrievance;

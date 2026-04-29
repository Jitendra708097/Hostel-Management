import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../config/axiosClient';
import { format } from 'date-fns'; // For pretty date formatting
import { useSelector } from 'react-redux';
import { ArrowLeft, ChevronRight, FileText, Plus, Send, X } from 'lucide-react';

const ACCEPTED_ATTACHMENT_TYPES = 'image/*,video/*,application/pdf';

// A small, reusable component for displaying status badges
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

const StudentGrievance = () => {

  const [view, setView] = useState('list');
  const [grievances, setGrievances] = useState([]);
  const [currentGrievance, setCurrentGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ category: 'Maintenance', description: '', isAnonymous: false });
  const [files, setFiles] = useState([]);
  const [notice, setNotice] = useState(null);
  const { user } = useSelector((state) => state.auth);


  // useCallback is used to memoize the function, preventing re-creation on every render
  // fetch grievances from server 
  const fetchGrievances = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?._id) return;
      const response = await axiosClient.get(`/grievance/get/${user._id}`);
      setGrievances(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch grievances. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

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
      await axiosClient.post(`/grievance/submit/${user?._id}`, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotice({ type: 'success', message: 'Grievance submitted successfully.' });
      setError('');
      setView('list'); // Go back to the list view after submission
    } catch (err) {
      setNotice({ type: 'error', message: err?.response?.data?.message || 'Failed to submit grievance. Please check your input and try again.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Helper function to render the current view based on the state
  const renderContent = () => {
    if (loading && !currentGrievance) {
      return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">Loading grievances...</div>;
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
          <button onClick={fetchGrievances} className="mt-4 block mx-auto rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Try again
          </button>
        </div>
      );
    }

    switch (view) {
      // DETAIL VIEW
      case 'detail':
        return (
          <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={handleBackToList} className="cursor-pointer mb-6 inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to List
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentGrievance.category}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Filed on: {format(new Date(currentGrievance.createdAt), 'MMMM dd, yyyy')}
                </p>
              </div>
              <StatusBadge status={currentGrievance.status} />
            </div>
            <hr className="my-6" />
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{currentGrievance.description}</p>
            </div>
            {Array.isArray(currentGrievance.attachments) && currentGrievance.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {currentGrievance.attachments.map(file => (
                    <a key={file.public_id} href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100">
                      <FileText className="h-4 w-4" /> View Attachment
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
                            <div key={comment._id} className={`p-4 rounded-lg border ${comment.role === 'warden' ? 'bg-cyan-50 border-cyan-100' : 'bg-slate-50 border-slate-200'}`}>
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
          <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={handleBackToList} className="cursor-pointer mb-6 inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-medium">
              <X className="h-4 w-4" /> Cancel
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">File a New Grievance</h2>

            {/* Grievance Form */}
            <form onSubmit={handleSubmitGrievance}>
              <div className="space-y-6">

                {/* Select Category of Grievance */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select id="category" name="category" value={formData.category} onChange={handleFormChange} className="cursor-pointer mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm">
                    <option>Maintenance</option>
                    <option>Mess/Food Quality</option>
                    <option>Cleanliness</option>
                    <option>Security</option>
                    <option>Inter-student Conflict</option>
                    <option>Staff Issues</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleFormChange} required className="p-4 mt-1 block w-full shadow-sm sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                  <p className="mt-2 text-sm text-gray-500">Please be as detailed as possible.</p>
                </div>

                {/* File Attachments and Anonymous Checkbox */}
                <div>
                    <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">Attachments (Optional)</label>
                    <input type="file" id="attachments" name="attachments" accept={ACCEPTED_ATTACHMENT_TYPES} multiple onChange={handleFileChange} className="cursor-pointer mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
                    <p className="mt-2 text-xs text-slate-500">Upload up to 5 images, videos, or PDF files.</p>
                </div>

                {/* Submit Anonymously Checkbox */}
                <div className="flex items-center">
                  <input id="isAnonymous" name="isAnonymous" type="checkbox" checked={formData.isAnonymous} onChange={handleFormChange} className="cursor-pointer h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded" />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">Submit Anonymously</label>
                </div>
              </div>

              {/* loading button  */}
              <div className="mt-8">
                <button type="submit" disabled={loading} className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300">
                  <Send className="h-4 w-4" />
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-cyan-700">Student Support</p>
                <h1 className="text-3xl font-bold text-slate-900">My Grievances</h1>
              </div>
              <button onClick={handleCreateNew} className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-700 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
                <Plus className="h-4 w-4" /> File a New Grievance
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {grievances.length > 0 ? grievances.map((g) => (
                  <li key={g._id} onClick={() => handleViewDetails(g)} className="p-4 hover:bg-cyan-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cyan-700 truncate">{g.category}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Filed on: {format(new Date(g.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge status={g.status} />
                        <ChevronRight className="h-5 w-5 text-slate-400 ml-4" />
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {notice && (
          <div className={`mb-4 flex items-center justify-between rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentGrievance;

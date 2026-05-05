import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../../config/axiosClient';
import { checkAuthStatus, logout } from '../../redux/authSlicer';
import PasswordChangeForm from './changePassword';
import { LogOut, Save, X } from 'lucide-react';
import ProfilePhotoUploader from '../common/ProfilePhotoUploader';

const ProfileView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const { register, handleSubmit, reset, control, setError, formState: { isSubmitting } } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (!isAuthenticated || !user) return navigate('/login');

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(`/user/${user._id}`);
        // controller returns user object
        const profile = data.user || data;
        // populate form (omit nested fields)
        reset({
          userName: profile.userName || '',
          emailId: profile.emailId || '',
          phoneNo: profile.phoneNo || '',
          roomNo: profile.roomNo || '',
          course: profile.course || '',
          year: profile.year || '',
          institution: profile.institution || '',
          profilePhoto: null,
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setNotice({ type: 'error', message: err?.response?.data?.error || 'Could not load your profile details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, navigate, reset]);

  // this component calling the update api and finally updated user info 
  // and also dispatching checkAuth for refreshing existing info about user.
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          if (key === 'profilePhoto' && data[key] instanceof File) {
            formData.append('profilePhoto', data[key]);
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      const response = await axiosClient.put(`/user/update/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // refresh auth user in redux
      await dispatch(checkAuthStatus());
      const updatedProfile = response?.data?.user;
      reset({
        userName: updatedProfile?.userName || data.userName || '',
        emailId: updatedProfile?.emailId || user?.emailId || '',
        phoneNo: updatedProfile?.phoneNo || data.phoneNo || '',
        roomNo: updatedProfile?.roomNo || user?.roomNo || '',
        course: updatedProfile?.course || user?.course || '',
        year: updatedProfile?.year || user?.year || '',
        institution: updatedProfile?.institution || user?.institution || '',
        profilePhoto: null,
      });
      setNotice({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      console.error('Update failed', err);
      setNotice({ type: 'error', message: err?.response?.data?.error || err?.response?.data?.message || 'Update failed.' });
    }
  };

  // handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 disabled:bg-slate-100 disabled:text-slate-500';


  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-sm font-medium text-cyan-700">Student Profile</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Hostel Account</h1>
          <p className="mt-1 text-slate-600">Keep your personal and room details up to date.</p>
        </div>

        <div className="max-w-4xl mx-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Profile Details</h2>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <button onClick={handleLogout} className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>

          {notice && (
            <div className={`mb-5 flex items-center justify-between rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
              <span>{notice.message}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
            </div>
          )}

          {loading && <p className="mb-4 text-sm text-slate-500">Loading profile...</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
              <div className="col-span-1 flex flex-col items-center">
                <ProfilePhotoUploader
                  name="profilePhoto"
                  control={control}
                  setError={setError}
                  existingImageUrl={user?.profileURL || ''}
                  label="Add Photo"
                />
              </div>

              <div className="col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input {...register('userName')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input {...register('emailId')} disabled className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <input {...register('phoneNo')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Room No.</label>
                    <input {...register('roomNo')} className={inputClass} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Course</label>
                    <input {...register('course')} className={inputClass} disabled />
                  </div>

                  {/* select year */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Year</label>
                    <select {...register('year')} className={inputClass} disabled>
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Institution  */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Institution</label>
                    <select {...register('institution')} className={inputClass} disabled>
                      <option value="">Select</option>
                      <option value="HRIT">HRIT</option>
                      <option value="Virohan">Virohan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
 
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => navigate('/student/dashboard')} className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-cyan-700 px-5 py-2 font-semibold text-white hover:bg-cyan-800 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        <PasswordChangeForm />
      </div>
    </div>
  );
};

export default ProfileView;

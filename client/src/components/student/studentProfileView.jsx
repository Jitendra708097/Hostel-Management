import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../../config/axiosClient';
import ProfilePhotoUploader from '../common/ProfilePhotoUploader';
import { checkAuthStatus, logout } from '../../redux/authSlicer';
import { motion } from 'framer-motion';

const ProfileView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const { control, register, handleSubmit, reset, watch, formState: { isSubmitting } , setError } = useForm({
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, navigate, reset]);

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

      const resp = await axiosClient.put(`/user/update/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // refresh auth user in redux
      dispatch(checkAuthStatus());
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Update failed', err);
      alert(err?.response?.data?.message || 'Update failed');
    }
  };

  // handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (e) {
      // ignore
    }
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">Logout</button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-36 h-36 mb-4">
                  {user?.profileURL ? (
                    <img src={user.profileURL} alt="avatar" className="w-36 h-36 rounded-full object-cover shadow-md" />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">No Photo</div>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input {...register('userName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input {...register('emailId')} disabled className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input {...register('phoneNo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room No.</label>
                    <input {...register('roomNo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <input {...register('course')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>

                  {/* select year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select {...register('year')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Institution  */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                    <select {...register('institution')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="">Select</option>
                      <option value="HRIT">HRIT</option>
                      <option value="Virohan">Virohan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => navigate('/student/dashboard')} className="px-4 py-2 rounded-lg bg-gray-100">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

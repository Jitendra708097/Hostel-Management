import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, TrendingUp, AlertCircle } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import AdminHeader from './AdminHeader';
import FeeStructureList from './adminFeesStructureList';

const feeStructureSchema = z.object({
  structureName: z.string().min(3, { message: 'Structure name must be at least 3 characters.' }),
  description: z.string().optional(),
  components: z.object({
    admissionFee: z.coerce.number().min(0).default(0),
    securityDeposit: z.coerce.number().min(0).default(0),
    hostelFee: z.coerce.number().min(1, { message: 'Hostel Fee is required.' }),
  }),
});

const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-sm border border-slate-200 rounded-lg p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer w-full px-4 py-2 font-semibold text-white bg-cyan-700 rounded-md shadow-sm hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Input = ({ label, id, type = 'text', error, registration }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
    <input
      id={id}
      type={type}
      {...registration}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
);

const StatsCard = ({ title, value, icon, colorClass }) => (
  <Card>
    <div className="flex items-center">
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </Card>
);

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const getMonthKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
};

const buildMonthlyCollectionData = (payments) => {
  const today = new Date();
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  const totals = monthKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  payments.forEach((payment) => {
    if (payment.status && payment.status !== 'success') return;
    const key = getMonthKey(payment.createdAt);
    if (key && totals[key] !== undefined) {
      totals[key] += Number(payment.amount || 0);
    }
  });

  return monthKeys.map((key) => ({ name: monthLabel(key), collected: totals[key] }));
};

const CreateFeeStructureForm = ({ onCreated }) => {
  const [notice, setNotice] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(feeStructureSchema),
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/fees/structure', data);
      setNotice({ type: 'success', message: 'Fee structure created successfully.' });
      reset();
      onCreated?.();
    } catch (error) {
      setNotice({ type: 'error', message: error?.response?.data?.message || error?.response?.data?.error || 'Failed to create fee structure.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {notice && <p className={`rounded-md border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.message}</p>}
      <Input label="Structure Name" id="structureName" registration={register('structureName')} error={errors.structureName} />
      <Input label="Description (Optional)" id="description" registration={register('description')} error={errors.description} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Admission Fee" id="admissionFee" type="number" registration={register('components.admissionFee')} error={errors.components?.admissionFee} />
        <Input label="Security" id="securityDeposit" type="number" registration={register('components.securityDeposit')} error={errors.components?.securityDeposit} />
        <Input label="Hostel Fees" id="hostelFee" type="number" registration={register('components.hostelFee')} error={errors.components?.hostelFee} />
      </div>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Structure'}</Button>
    </form>
  );
};

const AdminFeesDashboard = () => {
  const [recentPayments, setRecentPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshDashboard = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const [paymentsResponse, studentsResponse, structuresResponse] = await Promise.all([
          axiosClient.get('/fees/payments'),
          axiosClient.get('/user/getAllStudents'),
          axiosClient.get('/fees/structures'),
        ]);

        setRecentPayments(paymentsResponse.data.data || []);
        setStudents(studentsResponse.data.data || []);
        setStructures(structuresResponse.data.data || []);
        setDashboardError('');
      } catch (error) {
        setDashboardError(error?.response?.data?.message || 'Unable to load fee dashboard data.');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey]);

  const successfulPayments = useMemo(
    () => recentPayments.filter((payment) => !payment.status || payment.status === 'success'),
    [recentPayments]
  );

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const collectedThisMonth = successfulPayments
      .filter((payment) => getMonthKey(payment.createdAt) === currentMonthKey)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const totalPaid = students.reduce((sum, student) => sum + Number(student.totalPaid || 0), 0);
    const totalDues = students.reduce((sum, student) => sum + Number(student.due || 0), 0);
    const totalExpected = totalPaid + totalDues;
    const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

    return {
      collectedThisMonth,
      totalDues,
      activeStudents: students.length,
      collectionRate,
      structuresCount: structures.length,
    };
  }, [students, structures.length, successfulPayments]);

  const monthlyCollectionData = useMemo(
    () => buildMonthlyCollectionData(successfulPayments),
    [successfulPayments]
  );

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
      <AdminHeader title="Fees Dashboard" subtitle="Manage fee structures and collections" />

      {dashboardError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {dashboardError}
          <button onClick={refreshDashboard} className="ml-3 font-semibold text-red-800 underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Collected (This Month)" value={dashboardLoading ? 'Loading...' : formatCurrency(dashboardStats.collectedThisMonth)} icon={<IndianRupee />} colorClass="bg-emerald-100 text-emerald-600" />
        <StatsCard title="Outstanding Dues" value={dashboardLoading ? 'Loading...' : formatCurrency(dashboardStats.totalDues)} icon={<AlertCircle />} colorClass="bg-red-100 text-red-600" />
        <StatsCard title="Active Students" value={dashboardLoading ? 'Loading...' : dashboardStats.activeStudents} icon={<Users />} colorClass="bg-cyan-100 text-cyan-600" />
        <StatsCard title="Collection Rate" value={dashboardLoading ? 'Loading...' : `${dashboardStats.collectionRate}%`} icon={<TrendingUp />} colorClass="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Monthly Fee Collection (Rs.)</h2>
              <span className="text-sm text-slate-500">{dashboardStats.structuresCount} fee structure{dashboardStats.structuresCount === 1 ? '' : 's'}</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="collected" fill="#0e7490" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Recent Payments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {successfulPayments.length > 0 ? successfulPayments.slice(0, 8).map(p => (
                    <tr key={p._id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.student?.userName || 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-700">Rs. {Number(p.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                  <tr><td colSpan="3" className="px-4 py-6 text-center text-slate-500">{dashboardLoading ? 'Loading payments...' : 'No recent payments found.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Create New Fee Structure</h2>
            <CreateFeeStructureForm onCreated={refreshDashboard} />
          </Card>
        </div>
      </div>

      <div className="py-8">
        <FeeStructureList refreshKey={refreshKey} onChanged={refreshDashboard} />
      </div>
    </div>
  );
};

export default AdminFeesDashboard;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, TrendingUp, AlertCircle, Database } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import AdminHeader from './AdminHeader';

// --- Zod Validation Schema ---
const feeStructureSchema = z.object({
  structureName: z.string().min(3, { message: "Structure name must be at least 3 characters." }),
  description: z.string().optional(),
  components: z.object({
    admissionFee: z.coerce.number().min(0).default(0),
    securityDeposit: z.coerce.number().min(0).default(0),
    hostelFee: z.coerce.number().min(1, { message: "Hostel Fee is required." }),
    // messCharges: z.coerce.number().min(0).default(0),
  })
});

// --- Reusable UI Components (defined internally) ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer w-full px-4 py-2 font-semibold text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Input = React.forwardRef(({ label, id, type = 'text', error, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={id} type={type} ref={ref} {...props}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
));

// --- Child Components (defined internally) ---
const StatsCard = ({ title, value, icon, colorClass }) => (
  <Card>
    <div className="flex items-center">
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </Card>
);


// it is creating fees structure and saving in Database
// through post api calling
const CreateFeeStructureForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(feeStructureSchema)
  });


  const onSubmit = async (data) => {
    // console.log("Submitting to API:", data);

    const response = await axiosClient.post('/fees/structure',data);
    alert("Fee Structure Created Successfully!");
    reset(); // Reset form after submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Structure Name" id="structureName" {...register('structureName')} error={errors.structureName} />
      <Input label="Description (Optional)" id="description" {...register('description')} error={errors.description} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Admission Fee" type="number" {...register('components.admissionFee')} error={errors.components?.admissionFee} />
        <Input label="Security" type="number" {...register('components.securityDeposit')} error={errors.components?.securityDeposit} />
        <Input label="Hostel Fees" type="number" {...register('components.hostelFee')} error={errors.components?.hostelFee} />
        {/* <Input label="Mess Charges" type="number" {...register('components.messCharges')} error={errors.components?.messCharges} /> */}
      </div>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Structure'}</Button>
    </form>
  );
};

// --- Mock Data ---
const monthlyCollectionData = [
  { name: 'Jan', collected: 40000 }, { name: 'Feb', collected: 30000 },
  { name: 'Mar', collected: 50000 }, { name: 'Apr', collected: 45000 },
  { name: 'May', collected: 48000 }, { name: 'Jun', collected: 52000 },
];

// --- Main Admin Dashboard Component ---
const AdminFeesDashboard = () => {
const [recentPayments,setRecentPayments] = useState([]);

useEffect(() => {

  try 
  {
     const fetchPayments = async () => 
     {
       const response = await axiosClient.get('/fees/payments');
       setRecentPayments(response.data.data);
       console.log("response: ",response);
     }

     fetchPayments();
  } 

  catch (error) {
    console.error("Error: ",error.message);
  }
},[]);

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
      <AdminHeader title="Fees Dashboard" subtitle="Manage fee structures and collections" />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Collected (This Month)" value="₹1,70,000" icon={<DollarSign />} colorClass="bg-emerald-100 text-emerald-600" />
        <StatsCard title="Outstanding Dues" value="₹25,000" icon={<AlertCircle />} colorClass="bg-red-100 text-red-600" />
        <StatsCard title="Active Students" value="85" icon={<Users />} colorClass="bg-sky-100 text-sky-600" />
        <StatsCard title="Collection Rate" value="87%" icon={<TrendingUp />} colorClass="bg-amber-100 text-amber-600" />
      </div>
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Monthly Fee Collection (₹)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCollectionData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="collected" fill="#0284c7" /></BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
            <div className="overflow-x-auto">
              <table className="admin-table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPayments.map(p => (<tr key={p._id}>
                      <td>{p.student?.userName}</td>
                      <td>₹{p.amount.toLocaleString()}</td>
                      <td>{p.createdAt}</td></tr>))}
                  </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Create New Fee Structure</h2>
            <CreateFeeStructureForm />
          </Card>
        </div>
      </div>
      
    </div>
  );
};

export default AdminFeesDashboard;
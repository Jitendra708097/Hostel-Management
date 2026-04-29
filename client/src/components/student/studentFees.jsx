import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../config/axiosClient';
import { BookOpen, Calendar, CheckCircle, CreditCard, IndianRupee, ServerCrash, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-sm border border-slate-200 rounded-lg p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-cyan-700 rounded-md shadow-sm hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all ${className}`}
  >
    {children}
  </button>
);

const StudentFees = () => {
  const [studentData, setStudentData] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const fetchStudentData = useCallback(async () => {
    if (!user?._id) {
      setError('Student ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get(`/fees/student/${user._id}`);
      setStudentData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch student data:', err);
      setError('Could not load your fee details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePayment = async () => {
    const amountToPay = Number(paidAmount);
    if (!studentData || studentData.totalDues <= 0) return;
    if (!amountToPay || amountToPay <= 0) {
      setNotice({ type: 'error', message: 'Enter a valid payment amount.' });
      return;
    }
    if (amountToPay > Number(studentData.totalDues || 0)) {
      setNotice({ type: 'error', message: 'Payment amount cannot be greater than remaining balance.' });
      return;
    }
    if (!window.Razorpay) {
      setNotice({ type: 'error', message: 'Payment gateway is still loading. Please try again in a moment.' });
      return;
    }

    setIsPaying(true);
    try {
      const { data: { order } } = await axiosClient.post('/fees/create-order', {
        amount: amountToPay,
        currency: 'INR',
      });

      const options = {
        key: 'rzp_test_Rf2qeCwbUhKxTr',
        amount: order.amount,
        currency: order.currency,
        name: 'RSD Accomodation pvt limited',
        description: `Fee Payment for ${studentData.userName}`,
        image: 'https://th.bing.com/th/id/OIP.cP6LXdNgVBxDJovJo-IxKQHaHa?w=177&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data } = await axiosClient.post('/fees/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setNotice({ type: 'success', message: data.message || 'Payment successful.' });
            setPaidAmount('');
            await fetchStudentData();
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            setNotice({ type: 'error', message: 'Payment completed, but automatic verification failed. Contact the hostel office with your payment ID.' });
          } finally {
            setIsPaying(false);
          }
        },
        prefill: { name: studentData.userName, email: studentData.emailId },
        theme: { color: '#0e7490' },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error creating Razorpay order:', err);
      setNotice({ type: 'error', message: err?.response?.data?.message || 'Could not initiate the payment process. Please check your connection and try again.' });
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-cyan-700 animate-pulse">Loading fee details...</p>
          <p className="text-slate-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-8">
        <Card className="text-center border-l-4 border-red-500">
          <ServerCrash className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">An Error Occurred</h2>
          <p className="text-slate-600">{error}</p>
          <button onClick={fetchStudentData} className="mt-5 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (!studentData) return null;

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
      {notice && (
        <div className={`mb-5 flex items-center justify-between rounded-lg border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="mb-8">
        <p className="text-sm font-medium text-cyan-700">Fee Payment</p>
        <h1 className="text-3xl font-bold text-slate-900">Hostel Fee Portal</h1>
        <p className="mt-1 text-slate-600">Review your assigned fee structure and make secure payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-linear-to-r from-blue-700 to-cyan-600 text-white border-0">
            <p className="text-lg font-medium text-sky-100">Current Remaining Balance</p>
            <p className="text-5xl font-bold">Rs. {Number(studentData.totalDues || 0).toLocaleString()}</p>
          </Card>

          <Card>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700">Payment Amount</label>
            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <IndianRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="paymentAmount"
                  type="number"
                  min={0}
                  max={studentData.totalDues}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                  placeholder="Enter the amount"
                />
              </div>
              <Button onClick={handlePayment} disabled={studentData.totalDues <= 0 || isPaying} className="cursor-pointer w-full sm:w-auto">
                <CreditCard className="h-4 w-4" />
                {isPaying ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-500">You can pay any amount up to your remaining balance.</p>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Fee Structure Details</h2>
            {studentData.feeStructure ? (
              <div className="space-y-4 text-slate-800">
                <div className="flex items-center"><BookOpen className="w-5 h-5 mr-3 text-cyan-700" /><span>Structure: <strong>{studentData.feeStructure?.structureName}</strong></span></div>
                <div className="flex items-center"><IndianRupee className="w-5 h-5 mr-3 text-cyan-700" /><span>Hostel Fee: <strong>Rs. {studentData.feeStructure.components.hostelFee?.toLocaleString()}</strong></span></div>
              </div>
            ) : (
              <p className="text-slate-600">No fee structure has been assigned to you yet.</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Payment History</h2>
            {studentData.paymentHistory && studentData.paymentHistory.length > 0 ? (
              <ul className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
                {studentData.paymentHistory.map(p => (
                  <li key={p._id} className="flex items-start">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mr-4 mt-1"><CheckCircle className="w-5 h-5" /></div>
                    <div>
                      <p className="font-semibold text-slate-800">Rs. {p.amount.toLocaleString()}</p>
                      <p className="text-sm text-slate-500 break-all">ID: {p.razorpay.paymentId}</p>
                      <p className="text-xs text-slate-400 flex items-center mt-1"><Calendar className="w-3 h-3 mr-1" />{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 mt-4">No past payments found.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentFees;

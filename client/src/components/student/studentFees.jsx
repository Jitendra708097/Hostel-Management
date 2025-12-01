import { useState, useEffect } from 'react';
import axiosClient from '../../config/axiosClient';
import { BookOpen, Calendar, CheckCircle, ServerCrash, DollarSign } from 'lucide-react';
import { useSelector } from 'react-redux';

// --- Reusable UI Components (Internalized for simplicity) ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all ${className}`}
  >
    {children}
  </button>
);

// --- Main Student Portal Component ---
const StudentFees = () => {
  // State for storing data, loading status, and errors
  const [studentData, setStudentData] = useState(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaying, setIsPaying] = useState(false); // Prevents multiple clicks while payment is processing 
  const { user } = useSelector((state) => state.auth);
  console.log(user)
  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?._id) {
        setError("Student ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        // <<< API CALL 1: Fetch Student Fee Details >>>
        // Replace with your actual endpoint to get student data.
        const response = await axiosClient.get(`/fees/student/${user?._id}`);
        console.log("Response: ",response.data.data);
        setStudentData(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
        setError("Could not load your fee details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user._id]); // This effect runs whenever the studentId prop changes

  // --- RAZORPAY SCRIPT LOADING ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // --- PAYMENT HANDLING ---
  const handlePayment = async () => {
    if (!studentData || studentData.totalDues <= 0) return;
    setIsPaying(true);

    try {
      // <<< API CALL 2: Create a Razorpay Order >>>
      // Replace with your actual endpoint to create an order.
      const { data: { order } } = await axiosClient.post('/fees/create-order', {
        amount: paidAmount,
        currency: 'INR',
      });

      // Razorpay payment options
      const options = {
        // <<< IMPORTANT: Replace with your actual Test Key ID >>>
        // It's highly recommended to use an environment variable for this.
        key: 'rzp_test_Rf2qeCwbUhKxTr', 
        amount: paidAmount,   //order.amount,
        currency: order.currency,
        name: 'RSD Accomodation pvt limited',
        description: `Fee Payment for ${studentData.userName}`,
        image:'https://th.bing.com/th/id/OIP.cP6LXdNgVBxDJovJo-IxKQHaHa?w=177&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
        order_id: order.id,
        handler: async (response) => {
          try {
            // <<< API CALL 3: Verify the Payment >>>
            // Replace with your actual endpoint to verify the payment signature.
            console.log("response: ",response);
            const { data } = await axiosClient.post(`/fees/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId: user?._id,
              amountPaid: paidAmount
            });

            alert(data.message || 'Payment successful!');
            window.location.reload(); // Reload to show updated dues and history

          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            alert("Your payment was successful, but we couldn't verify it automatically. Please contact the hostel office with your payment ID.");
            setIsPaying(false);
          }
        },
        prefill: { name: studentData.userName, email: studentData.emailId },
        theme: { color: '#0284c7' },
        modal: {
          ondismiss: function() {
            // Re-enable the button if the user closes the payment modal
            setIsPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      alert('Could not initiate the payment process. Please check your connection and try again.');
      setIsPaying(false);
    }
  };

  // --- UI RENDERING LOGIC ---

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-sky-600 animate-pulse">Loading Your Portal...</p>
          <p className="text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-8">
        <Card className="text-center border-l-4 border-red-500">
          <ServerCrash className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">An Error Occurred</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }
  
  // 3. Success State (Data Loaded)
  if (studentData) {
    return (
      <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-linear-to-r from-sky-600 to-cyan-500 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-lg font-medium text-sky-100">Current Outstanding Dues</p>
                  <p className="text-5xl font-bold">₹{studentData.totalDues.toLocaleString()}</p>
                </div>
              </div>
            </Card>
           
           <div>
              <input 
              type='Number'
              min={0}
              onChange={(e) => setPaidAmount(e.target.value)}
              className='bg-gray-200 border-blue-500 text-gray-600 p-2 font-medium text-lg hover:border-b-blue-800 mr-10 border-2 rounded-3xl m-5'
              placeholder='Enter the amount'
               />
              <Button onClick={handlePayment} disabled={studentData.totalDues <= 0 || isPaying} className="bg-gray-300 cursor-pointer text-sky-600 hover:bg-gray-100 w-full sm:w-auto">
                  {isPaying ? 'Processing...' : 'Pay Now'}
              </Button>
           </div>

            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Fee Structure Details</h2>
              {studentData.feeStructure ? (
                <div className="space-y-4 text-gray-800">
                  <div className="flex items-center"><BookOpen className="w-5 h-5 mr-3 text-gray-500" /><span>Structure: <strong>{studentData.feeStructure?.structureName}</strong></span></div>
                  <div className="flex items-center"><DollarSign className="w-5 h-5 mr-3 text-gray-500" /><span>Hostel Fee: <strong>₹{studentData.feeStructure.components.hostelFee?.toLocaleString()}</strong></span></div>
                </div>
              ) : (
                <p>No fee structure has been assigned to you yet.</p>
              )}
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Payment History</h2>
              {studentData.paymentHistory && studentData.paymentHistory.length > 0 ? (
                <ul className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
                  {studentData.paymentHistory.map(p => (
                    <li key={p._id} className="flex items-start">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mr-4 mt-1"><CheckCircle className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-gray-800">₹{p.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 break-all">ID: {p.razorpay.paymentId}</p>
                        <p className="text-xs text-gray-400 flex items-center mt-1"><Calendar className="w-3 h-3 mr-1" />{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 mt-4">No past payments found.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no data, error, or loading state is active
  return null; 
};

export default StudentFees;
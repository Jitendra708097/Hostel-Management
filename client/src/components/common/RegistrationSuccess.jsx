
const RegistrationSuccess = ({ onHome, onNew }) => {
  const goHome = () => {
    if (typeof onHome === 'function') return onHome();
    window.location.href = '/';
  };
  const newReg = () => {
    if (typeof onNew === 'function') return onNew();
    window.location.href = '/registration';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white  rounded-2xl shadow-lg p-8 text-center border border-gray-200/10">
        <h2 className="text-2xl font-bold text-indigo-600 mb-3">Registration Submitted</h2>
        <p className="text-sm text-slate-700 mb-6">Thank you — your registration has been submitted successfully. We'll review your details and contact you if anything else is required.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={goHome}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </button>
          <button
            onClick={newReg}
            className="px-4 py-2 bg-gray-200 text-slate-900 rounded-md hover:bg-gray-300 transition"
          >
            New Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;

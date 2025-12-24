import { useState } from 'react';
import { ClipboardList, User, FileText, Heart, BookOpen, CheckCircle, ArrowRight, ArrowLeft, Home, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { rulesList } from "../../../constants"; // Assuming this constant exists
import RegistrationSuccess from './RegistrationSuccess'; // Assuming this component exists
import axiosClient from '../../config/axiosClient'; // Assuming this client exists


const RegistrationPage = () => {
  const [step, setStep] = useState(1);
  // Updated styles for a light theme
  const lableStyles = 'block text-sm font-medium text-gray-700';
  const inputStyles = "mt-1 block w-full rounded-lg p-2.5 border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900 border-gray-300 shadow-sm";
  const errorInputStyles = 'border-red-500 ring-1 ring-red-500 bg-red-50 text-red-900';
  const iconInputStyles = 'absolute left-3 top-3.5 h-5 w-5 text-gray-400';

  // Zod schemas remain the same for validation logic
  const step1Schema = z.object({
    name: z.string().min(3, 'Full name is required').max(25, 'Full name Should less than 25 char'),
    fathersName: z.string().min(3, "Father's name is required").max(25, "Father's name Should less than 25 char"),
    dateOfBirth: z.string().min(1, 'Please enter a valid date of birth'),
    roomOption: z.enum(['Single', 'Double', 'Triple'], { message: 'Please select room option' }),
    branch: z.string().min(3, 'Enter branch name').max(50, 'Branch name should be less than 50 char'),
    year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year'], { message: 'Please select year' }),
    sessionStart: z.string().min(1, 'Please select session start'),
    sessionEnd: z.string().min(1, 'Please select session end'),
    permanentAddress: z.string().min(8, 'Enter your permanent address').max(100, 'Address should be less than 200 char'),
    phone: z.string().min(7, 'Phone is required').max(15, 'Phone number is too long'),
    localGuardianName: z.string().optional(),
    localGuardianAddress: z.string().min(10, 'Please enter local guardian address').max(100, 'Address should be less than 200 char'),
    localGuardianPhone: z.string().min(7, 'Local guardian phone is required').max(15, 'Phone number is too long'),
    emergencyContactName: z.string().optional(),
    emergencyContactAddress: z.string().min(10, 'Please enter emergency contact address').max(100, 'Address should be less than 200 char'),
    emergencyContactPhone: z.string().min(7, 'Emergency contact phone is required').max(15, 'Phone number is too long').optional(),
  });

  const step2Schema = z.object({
    course: z.string().min(1, 'Please select your course'),
    affidavitAgreement: z.literal(true, { errorMap: () => ({ message: 'You must agree to the affidavit terms' }) }),
  });

  const step3Schema = z.object({
    parentName: z.string().min(1, 'Parent name is required'),
    wardName: z.string().min(1, 'Ward name is required'),
    parentAddress: z.string().min(1, 'Parent address is required'),
    parentTelRes: z.string().optional(),
    parentTelOff: z.string().optional(),
    parentMob: z.string().min(7, 'Parent mobile is required').max(15, 'Mobile number is too long'),
    consentAgreement: z.literal(true, { errorMap: () => ({ message: 'You must agree to the medical consent' }) }),
  });

  const step4Schema = z.object({
    bloodGroup: z.string().min(1, 'Blood group is required'),
  });

  const step5Schema = z.object({
    rulesAgreement: z.literal(true, { errorMap: () => ({ message: 'You must accept the hostel rules' }) }),
  });

  const fullSchema = z.object({
    name: z.string().min(1, 'Full name is required'),
    fathersName: z.string().min(1, "Father's name is required"),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    roomOption: z.enum(['Single', 'Double', 'Triple'], { message: 'Room option is required' }),
    branch: z.string().min(1, 'Branch is required'),
    year: z.string().min(1, 'Year is required'),
    sessionStart: z.string().min(1, 'Session start is required'),
    sessionEnd: z.string().min(1, 'Session end is required'),
    permanentAddress: z.string().min(1, 'Permanent address is required'),
    phone: z.string().min(7, 'Phone is required').max(15, 'Phone number is too long'),
    localGuardianName: z.string().optional(),
    localGuardianAddress: z.string().min(1, 'Local guardian address is required'),
    localGuardianPhone: z.string().min(7, 'Local guardian phone is required').max(15, 'Phone number is too long'),
    emergencyContactName: z.string().optional(),
    emergencyContactAddress: z.string().min(1, 'Emergency contact address is required'),
    emergencyContactPhone: z.string().min(7, 'Emergency contact phone is required').max(15, 'Phone number is too long').optional(),
    course: z.string().min(1, 'Course is required'),
    affidavitAgreement: z.literal(true, { errorMap: () => ({ message: 'You must agree to the affidavit terms' }) }),
    parentName: z.string().min(1, 'Parent name is required'),
    wardName: z.string().min(1, 'Ward name is required'),
    parentAddress: z.string().min(1, 'Parent address is required'),
    parentTelRes: z.string().optional(),
    parentTelOff: z.string().optional(),
    parentMob: z.string().min(7, 'Parent mobile is required').max(15, 'Mobile number is too long'),
    consentAgreement: z.literal(true, { errorMap: () => ({ message: 'You must agree to the medical consent' }) }),
    bloodGroup: z.string().min(1, 'Blood group is required'),
    childhoodDiseases: z.object({ chickenPox: z.boolean(), measles: z.boolean(), mumps: z.boolean(), diphtheria: z.boolean(), }).optional(),
    sufferedDiseases: z.object({ tuberculosis: z.boolean(), rheumaticFever: z.boolean(), jaundice: z.boolean(), asthma: z.boolean(), epilepsy: z.boolean(), }).optional(),
    heartDisease: z.boolean().optional(), heartDiseaseDetails: z.string().optional(),
    gastrointestinalDisease: z.boolean().optional(), gastrointestinalDiseaseDetails: z.string().optional(),
    skinDisease: z.boolean().optional(), skinDiseaseDetails: z.string().optional(),
    psychiatricIllness: z.boolean().optional(), psychiatricIllnessDetails: z.string().optional(),
    sleepWalking: z.boolean().optional(), sleepWalkingDetails: z.string().optional(),
    surgeryInjury: z.boolean().optional(), surgeryInjuryDetails: z.string().optional(),
    drugAllergies: z.boolean().optional(), drugAllergiesDetails: z.string().optional(),
    otherAllergies: z.boolean().optional(), otherAllergiesDetails: z.string().optional(),
    otherAilment: z.boolean().optional(), otherAilmentDetails: z.string().optional(),
    rulesAgreement: z.literal(true, { errorMap: () => ({ message: 'You must accept the hostel rules' }) }),
  });


  const { register, handleSubmit, watch, getValues, setError, clearErrors, formState: { errors: formErrors }, reset } = useForm({
    defaultValues: {
      name: '', fathersName: '', dateOfBirth: '', roomOption: '', branch: '', year: '', sessionStart: '', sessionEnd: '', permanentAddress: '', phone: '', localGuardianName: '', localGuardianAddress: '', localGuardianPhone: '', emergencyContactName: '', emergencyContactAddress: '', emergencyContactPhone: '',
      course: '', affidavitAgreement: false,
      parentName: '', wardName: '', parentAddress: '', parentTelRes: '', parentTelOff: '', parentMob: '', consentAgreement: false,
      bloodGroup: '',
      childhoodDiseases: { chickenPox: false, measles: false, mumps: false, diphtheria: false },
      sufferedDiseases: { tuberculosis: false, rheumaticFever: false, jaundice: false, asthma: false, epilepsy: false },
      heartDisease: false, heartDiseaseDetails: '', gastrointestinalDisease: false, gastrointestinalDiseaseDetails: '', skinDisease: false, skinDiseaseDetails: '', psychiatricIllness: false, psychiatricIllnessDetails: '', sleepWalking: false, sleepWalkingDetails: '', surgeryInjury: false, surgeryInjuryDetails: '', drugAllergies: false, drugAllergiesDetails: '', otherAllergies: false, otherAllergiesDetails: '', otherAilment: false, otherAilmentDetails: '', rulesAgreement: false
    },
    mode: 'onTouched',
  });

  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const getError = (name) => {
    const parts = name.split('.');
    return parts.reduce((acc, part) => acc && acc[part], formErrors);
  };

  const renderFieldErrors = (name) => {
    const e = getError(name);
    if (!e) return null;
    return <p className="text-xs text-red-600 mt-1">{e.message}</p>;
  };

  const stepFields = {
    1: ['name', 'fathersName', 'dateOfBirth', 'roomOption', 'branch', 'year', 'sessionStart', 'sessionEnd', 'permanentAddress', 'phone', 'localGuardianAddress', 'localGuardianPhone', 'emergencyContactAddress'],
    2: ['course', 'affidavitAgreement'],
    3: ['parentName', 'wardName', 'parentAddress', 'parentMob', 'consentAgreement'],
    4: ['bloodGroup'],
    5: ['rulesAgreement'],
  };

  const stepSchemas = { 1: step1Schema, 2: step2Schema, 3: step3Schema, 4: step4Schema, 5: step5Schema };

  const validateFieldsWithSchema = (schema, fields = []) => {
    if (!schema) return true;
    const pick = {};
    fields.forEach(f => { pick[f] = true; });
    let partial = schema;
    try {
      partial = fields.length ? schema.pick(pick) : schema;
    } catch (e) {
      partial = schema;
    }
    const values = {};
    fields.forEach(f => { values[f] = getValues()[f]; });
    clearErrors(fields);
    const res = partial.safeParse(values);
    if (!res.success) {
      res.error.issues.forEach(issue => {
        const fieldPath = issue.path && issue.path.length ? issue.path.join('.') : fields[0];
        setError(fieldPath, { type: 'manual', message: issue.message });
      });
      return false;
    }
    return true;
  };

  const validateStep = (stepIndex) => {
    const fields = stepFields[stepIndex] || [];
    const schema = stepSchemas[stepIndex];
    return validateFieldsWithSchema(schema, fields);
  };

  const validateField = (fieldName) => {
    const stepIndex = Object.keys(stepFields).find(k => (stepFields[k] || []).includes(fieldName)) || step;
    const schema = stepSchemas[stepIndex];
    return validateFieldsWithSchema(schema, [fieldName]);
  };

  const [prevStepIndex, setPrevStepIndex] = useState(0);

  const nextStep = () => {
    if (validateStep(step)) {
      setPrevStepIndex(step);
      setStep(step + 1);
    } else {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const prevStepHandler = () => {
    setPrevStepIndex(step);
    setStep(step - 1);
  };

  const animClass = step > prevStepIndex ? 'animate-slideLeft' : 'animate-slideRight';

  const onSubmit = async (data) => {
    const res = fullSchema.safeParse(data);
    if (!res.success) {
      clearErrors();
      res.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        setError(path, { type: 'manual', message: issue.message });
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitError('');
      setSubmitting(true);
      await axiosClient.post('/registration/register', data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitting(false);
      setShowSuccessPage(true);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err?.response?.data?.message || err.message || 'Submission failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (showSuccessPage) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 text-gray-800">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-8">
            <RegistrationSuccess
              onHome={() => { window.location.href = '/'; }}
              onNew={() => {
                reset();
                setStep(1);
                setShowSuccessPage(false);
                setSubmitError('');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/20">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">RSD Girls & Boys Hostel Admission</h1>
              <p className="text-sm text-white/90">HRIT University, Ghaziabad (U.P.)</p>
            </div>
          </div>
        </div>

        <div className="px-8 pt-6 pb-4">
          <div className="flex justify-between items-start mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="text-center flex-1">
                <div className={`h-1.5 rounded-full mx-1 sm:mx-2 transition-all duration-500 ease-in-out ${step >= i ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <span className={`text-xs mt-2 block transition-colors duration-500 ${step >= i ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
                  {i === 1 && 'Personal'}
                  {i === 2 && 'Affidavit'}
                  {i === 3 && 'Consent'}
                  {i === 4 && 'Medical'}
                  {i === 5 && 'Rules'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6" noValidate>
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center">
              <span className="text-xl mr-2">⚠️</span> {submitError}
            </div>
          )}

          {step === 1 && (
            <div className={`space-y-6 ${animClass}`}>
              <div className="flex items-center space-x-3 text-indigo-700 mb-6">
                <User className="h-8 w-8" />
                <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={lableStyles}>Student Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className={iconInputStyles} />
                    <input type="text" {...register('name')} onBlur={() => validateField('name')} className={`${inputStyles} pl-10 ${getError('name') ? errorInputStyles : ''}`} />
                    {renderFieldErrors('name')}
                  </div>
                </div>
                <div>
                  <label className={lableStyles}>Father's Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className={iconInputStyles} />
                    <input type="text" {...register('fathersName')} onBlur={() => validateField('fathersName')} className={`${inputStyles} pl-10 ${getError('fathersName') ? errorInputStyles : ''}`} />
                    {renderFieldErrors('fathersName')}
                  </div>
                </div>
                <div>
                  <label className={lableStyles}>Date of Birth <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className={iconInputStyles} />
                    <input type="date" {...register('dateOfBirth')} onBlur={() => validateField('dateOfBirth')} className={`${inputStyles} pl-10 ${getError('dateOfBirth') ? errorInputStyles : ''}`} />
                    {renderFieldErrors('dateOfBirth')}
                  </div>
                </div>
                <div>
                  <label className={lableStyles}>Room Option <span className="text-red-500">*</span></label>
                  <select {...register('roomOption')} onBlur={() => validateField('roomOption')} className={`${inputStyles} ${getError('roomOption') ? errorInputStyles : ''}`}>
                    <option value="">Select Option</option>
                    <option value="Single">Single Seater</option>
                    <option value="Double">Double Seater</option>
                    <option value="Triple">Triple Seater</option>
                  </select>
                  {renderFieldErrors('roomOption')}
                </div>
                <div>
                  <label className={lableStyles}>Year <span className="text-red-500">*</span></label>
                  <select {...register('year')} onBlur={() => validateField('year')} className={`${inputStyles} ${getError('year') ? errorInputStyles : ''}`}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  {renderFieldErrors('year')}
                </div>
                <div>
                  <label className={lableStyles}>Branch <span className="text-red-500">*</span></label>
                  <input type="text" {...register('branch')} onBlur={() => validateField('branch')} className={`${inputStyles} ${getError('branch') ? errorInputStyles : ''}`} />
                  {renderFieldErrors('branch')}
                </div>
                <div>
                  <label className={lableStyles}>Session Start <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className={iconInputStyles} />
                    <input type="date" {...register('sessionStart')} onBlur={() => validateField('sessionStart')} className={`${inputStyles} pl-10 ${getError('sessionStart') ? errorInputStyles : ''}`} />
                    {renderFieldErrors('sessionStart')}
                  </div>
                </div>
                <div>
                  <label className={lableStyles}>Session End <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className={iconInputStyles} />
                    <input type="date" {...register('sessionEnd')} onBlur={() => validateField('sessionEnd')} className={`${inputStyles} pl-10 ${getError('sessionEnd') ? errorInputStyles : ''}`} />
                    {renderFieldErrors('sessionEnd')}
                  </div>
                </div>
              </div>
              <div>
                <label className={lableStyles}>Permanent Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className={iconInputStyles} />
                  <textarea {...register('permanentAddress')} rows={3} onBlur={() => validateField('permanentAddress')} className={`${inputStyles} pl-10 ${getError('permanentAddress') ? errorInputStyles : ''}`} />
                  {renderFieldErrors('permanentAddress')}
                </div>
              </div>
              <div>
                <label className={lableStyles}>Phone/Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className={iconInputStyles} />
                  <input type="tel" {...register('phone')} onBlur={() => validateField('phone')} className={`${inputStyles} pl-10 ${getError('phone') ? errorInputStyles : ''}`} />
                  {renderFieldErrors('phone')}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={lableStyles}>Local Guardian's Name (Optional)</label>
                    <div className="relative">
                        <User className={iconInputStyles} />
                        <input type="text" {...register('localGuardianName')} onBlur={() => validateField('localGuardianName')} className={`${inputStyles} pl-10 ${getError('localGuardianName') ? errorInputStyles : ''}`} />
                        {renderFieldErrors('localGuardianName')}
                    </div>
                </div>
                <div>
                    <label className={lableStyles}>Local Guardian's Phone <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Phone className={iconInputStyles} />
                        <input type="tel" {...register('localGuardianPhone')} onBlur={() => validateField('localGuardianPhone')} className={`${inputStyles} pl-10 ${getError('localGuardianPhone') ? errorInputStyles : ''}`} />
                        {renderFieldErrors('localGuardianPhone')}
                    </div>
                </div>
              </div>
              <div>
                  <label className={lableStyles}>Local Guardian's Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <MapPin className={iconInputStyles} />
                      <textarea {...register('localGuardianAddress')} rows={2} onBlur={() => validateField('localGuardianAddress')} className={`${inputStyles} pl-10 ${getError('localGuardianAddress') ? errorInputStyles : ''}`} />
                      {renderFieldErrors('localGuardianAddress')}
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={lableStyles}>Emergency Contact Name (Optional)</label>
                    <div className="relative">
                        <User className={iconInputStyles} />
                        <input type="text" {...register('emergencyContactName')} onBlur={() => validateField('emergencyContactName')} className={`${inputStyles} pl-10 ${getError('emergencyContactName') ? errorInputStyles : ''}`} />
                        {renderFieldErrors('emergencyContactName')}
                    </div>
                </div>
                <div>
                    <label className={lableStyles}>Emergency Contact Phone (Optional)</label>
                    <div className="relative">
                        <Phone className={iconInputStyles} />
                        <input type="tel" {...register('emergencyContactPhone')} onBlur={() => validateField('emergencyContactPhone')} className={`${inputStyles} pl-10 ${getError('emergencyContactPhone') ? errorInputStyles : ''}`} />
                        {renderFieldErrors('emergencyContactPhone')}
                    </div>
                </div>
              </div>
              <div>
                  <label className={lableStyles}>Emergency Contact Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <MapPin className={iconInputStyles} />
                      <textarea {...register('emergencyContactAddress')} rows={2} onBlur={() => validateField('emergencyContactAddress')} className={`${inputStyles} pl-10 ${getError('emergencyContactAddress') ? errorInputStyles : ''}`} />
                      {renderFieldErrors('emergencyContactAddress')}
                  </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={nextStep} className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`space-y-6 ${animClass}`}>
                <div className="flex items-center space-x-3 text-indigo-700 mb-6">
                    <FileText className="h-8 w-8" />
                    <h2 className="text-2xl font-semibold text-gray-800">Anti-Ragging Affidavit</h2>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-800">
                    <p className="text-sm mb-4">
                        I, <span className="font-semibold">{watch('name') || '[Student Name]'}</span>, a student of
                        <select
                            {...register('course')}
                            onBlur={() => validateField('course')}
                            className={`mx-2 px-2 py-1 border-b-2 bg-transparent focus:outline-none focus:border-indigo-500 ${getError('course') ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">[Select Course]</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="B.Pharm">B.Pharm</option>
                            <option value="BBA">BBA</option>
                            <option value="BCA">BCA</option>
                        </select>
                        hereby undertake an oath to abide by the following:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>I am aware of the law regarding prohibition of ragging as well as the punishments.</li>
                        <li>I shall not indulge in any act of ragging and if found guilty, will be liable for punishment including expulsion from the institute.</li>
                    </ol>
                    <div className="mt-6">
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id="affidavitAgreement"
                                {...register('affidavitAgreement')}
                                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${getError('affidavitAgreement') ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            />
                            <label htmlFor="affidavitAgreement" className="ml-3 block text-sm text-gray-900">
                                I agree to the terms of this affidavit <span className="text-red-500">*</span>
                            </label>
                        </div>
                        {renderFieldErrors('affidavitAgreement')}
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={prevStepHandler} className="flex items-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </button>
                    <button type="button" onClick={nextStep} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
          )}

          {step === 3 && (
            <div className={`space-y-6 ${animClass}`}>
                <div className="flex items-center space-x-3 text-indigo-700 mb-6">
                    <Heart className="h-8 w-8" />
                    <h2 className="text-2xl font-semibold text-gray-800">Medical & Legal Consent</h2>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-800">
                    <p className="text-sm mb-4 leading-relaxed">
                        I <input type="text" {...register('parentName')} onBlur={() => validateField('parentName')} placeholder="Parent/Guardian Name" className={`mx-1 px-2 py-1 border-b-2 bg-transparent focus:outline-none focus:border-indigo-500 ${getError('parentName') ? 'border-red-500' : 'border-gray-300'}`} />
                        hereby authorize HRIT Group to arrange for any necessary medical treatment for my ward
                        <input type="text" {...register('wardName')} onBlur={() => validateField('wardName')} placeholder="Ward Name" className={`mx-1 px-2 py-1 border-b-2 bg-transparent focus:outline-none focus:border-indigo-500 ${getError('wardName') ? 'border-red-500' : 'border-gray-300'}`} />
                        as per the professional judgement of the medical personnel. The entire expense will be borne by me.
                    </p>
                    <div className="text-sm mt-6 space-y-4">
                        <div>
                            <label className={lableStyles}>Parent/Guardian Address <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <MapPin className={iconInputStyles} />
                                <textarea {...register('parentAddress')} onBlur={() => validateField('parentAddress')} rows={2} className={`${inputStyles} pl-10 ${getError('parentAddress') ? errorInputStyles : ''}`} />
                                {renderFieldErrors('parentAddress')}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={lableStyles}>Tel. No. (Res.) (Optional)</label>
                                <div className="relative">
                                    <Phone className={iconInputStyles} />
                                    <input type="tel" {...register('parentTelRes')} onBlur={() => validateField('parentTelRes')} className={`${inputStyles} pl-10 ${getError('parentTelRes') ? errorInputStyles : ''}`} />
                                    {renderFieldErrors('parentTelRes')}
                                </div>
                            </div>
                            <div>
                                <label className={lableStyles}>Mobile No. <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className={iconInputStyles} />
                                    <input type="tel" {...register('parentMob')} onBlur={() => validateField('parentMob')} className={`${inputStyles} pl-10 ${getError('parentMob') ? errorInputStyles : ''}`} />
                                    {renderFieldErrors('parentMob')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center">
                        <input type="checkbox" id="consentAgreement" {...register('consentAgreement')} className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${getError('consentAgreement') ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
                        <label htmlFor="consentAgreement" className="ml-3 block text-sm text-gray-900">
                            I agree to the terms of this medical consent <span className="text-red-500">*</span>
                        </label>
                    </div>
                    {renderFieldErrors('consentAgreement')}
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={prevStepHandler} className="flex items-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </button>
                    <button type="button" onClick={nextStep} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
          )}

          {step === 4 && (
            <div className={`space-y-6 ${animClass}`}>
                <div className="flex items-center space-x-3 text-indigo-700 mb-6">
                    <ClipboardList className="h-8 w-8" />
                    <h2 className="text-2xl font-semibold text-gray-800">Student Medical Record</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className={lableStyles}>Name of Student</label>
                        <input type="text" value={watch('name')} className={`${inputStyles} cursor-not-allowed bg-gray-200`} readOnly />
                    </div>
                    <div>
                        <label className={lableStyles}>Blood Group <span className="text-red-500">*</span></label>
                        <input type="text" {...register('bloodGroup')} onBlur={() => validateField('bloodGroup')} className={`${inputStyles} ${getError('bloodGroup') ? errorInputStyles : ''}`} />
                        {renderFieldErrors('bloodGroup')}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-gray-800 mb-2">1. Has your ward suffered from the following childhood diseases?</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.keys(watch('childhoodDiseases') || {}).map(disease => (
                                <div key={disease} className="flex items-center">
                                    <input type="checkbox" id={disease} {...register(`childhoodDiseases.${disease}`)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                    <label htmlFor={disease} className="ml-2 block text-sm text-gray-900 capitalize">{disease.replace(/([A-Z])/g, ' $1')}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Simplified Yes/No questions */}
                    {[
                        { key: 'heartDisease', label: '3. Does she/he suffer from any heart disease?' },
                        { key: 'gastrointestinalDisease', label: '4. Any gastrointestinal disease?' },
                        { key: 'skinDisease', label: '5. Any skin disease?' },
                        { key: 'psychiatricIllness', label: '6. Any psychiatric illness?' },
                        { key: 'sleepWalking', label: '7. Does she/he sleep walk?' },
                        { key: 'surgeryInjury', label: '8. Any major surgery/injury?' },
                        { key: 'drugAllergies', label: '9. Any drug allergies?' },
                    ].map(item => (
                        <div key={item.key}>
                            <h3 className="font-medium text-gray-800 mb-2">{item.label}</h3>
                            <div className="flex items-center mb-2 space-x-6">
                                <label className="flex items-center"><input type="radio" {...register(item.key)} value="true" className="h-4 w-4 text-indigo-600" /> <span className="ml-2">Yes</span></label>
                                <label className="flex items-center"><input type="radio" {...register(item.key)} value="false" className="h-4 w-4 text-indigo-600" /> <span className="ml-2">No</span></label>
                            </div>
                            {watch(item.key) === 'true' && (
                                <div className="mt-2">
                                    <label className={lableStyles}>If yes, please provide details:</label>
                                    <textarea {...register(`${item.key}Details`)} rows={2} className={`${inputStyles} ${getError(`${item.key}Details`) ? errorInputStyles : ''}`} />
                                    {renderFieldErrors(`${item.key}Details`)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={prevStepHandler} className="flex items-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </button>
                    <button type="button" onClick={nextStep} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
          )}

          {step === 5 && (
            <div className={`space-y-6 ${animClass}`}>
              <div className="flex items-center space-x-3 text-indigo-700 mb-6">
                <BookOpen className="h-8 w-8" />
                <h2 className="text-2xl font-semibold text-gray-800">Hostel & Mess Rules</h2>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto custom-scrollbar">
                <ol className="list-decimal pl-5 space-y-4 text-sm text-gray-700 marker:font-semibold marker:text-indigo-600">
                  {rulesList.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ol>
                <div className="mt-6 flex items-center">
                  <input
                    type="checkbox"
                    id="rulesAgreement"
                    {...register('rulesAgreement')}
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${getError('rulesAgreement') ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  />
                  <label htmlFor="rulesAgreement" className="ml-3 block text-sm text-gray-900">
                    I agree to abide by all Hostel & Mess Rules <span className="text-red-500">*</span>
                  </label>
                </div>
                {renderFieldErrors('rulesAgreement')}
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStepHandler}
                  className="flex items-center px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center min-w-[180px] px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        /* Keyframe animations for transitions */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Applying animations */
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideLeft { animation: slideLeft 0.4s ease-out forwards; }
        .animate-slideRight { animation: slideRight 0.4s ease-out forwards; }

        /* Custom Scrollbar for Rules section */
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default RegistrationPage;
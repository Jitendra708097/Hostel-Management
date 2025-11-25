import React, { useState, useEffect } from 'react';

const RSDHostelForm = () => {
  const [formData, setFormData] = useState({
    // Hostel Registration Form
    name: '',
    fathersName: '',
    dateOfBirth: '',
    roomOption: '',
    branch: '',
    year: '',
    sessionStart: '',
    sessionEnd: '',
    permanentAddress: '',
    phone: '',
    localGuardianName: '',
    localGuardianAddress: '',
    localGuardianPhone: '',
    emergencyContactName: '',
    emergencyContactAddress: '',
    emergencyContactPhone: '',
    
    // Affidavit
    studentNameAffidavit: '',
    courseAffidavit: '',
    yearAffidavit: '',
    branchAffidavit: '',
    affidavitDate: '',
    guardianNameAffidavit: '',
    
    // Medical & Legal Consent
    parentNameConsent: '',
    wardNameConsent: '',
    consentAddress: '',
    telRes: '',
    telOff: '',
    mobNoConsent: '',
    consentDate: '',
    
    // Medical Record
    studentNameMedical: '',
    dobMedical: '',
    parentNameMedical: '',
    addressMedical: '',
    bloodGroup: '',
    
    // Medical History
    childhoodDiseases: {
      chickenPox: false,
      measles: false,
      mumps: false,
      diphtheria: false
    },
    diseases: {
      tuberculosis: false,
      rheumaticFever: false,
      hepatitis: false,
      asthma: false,
      epilepsy: false
    },
    heartDisease: '',
    gastrointestinalDisease: '',
    skinDisease: '',
    psychiatricIllness: '',
    sleepWalking: '',
    surgeries: '',
    drugAllergies: '',
    otherAllergies: '',
    otherAilments: '',
    
    // Office Use
    roomNo: '',
    furniture: {
      bed: '',
      table: '',
      chair: '',
      cfl: '',
      fan: ''
    },
    feesDeposited: '',
    securityDeposited: '',
    receiptNo: ''
  });

  const [currentPage, setCurrentPage] = useState(0);

  // Simulate backend data loading
  useEffect(() => {
    // In real implementation, this would be an API call
    const loadFormData = async () => {
      // Mock data - replace with actual API call
      const mockData = {
        name: 'John Doe',
        fathersName: 'Robert Doe',
        // ... other form fields
      };
      setFormData(prev => ({ ...prev, ...mockData }));
    };
    
    loadFormData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('hostel-forms');
    const htmlContent = element.innerHTML;
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RSD Hostel Registration Forms</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rsd-hostel-registration.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const forms = [
    // Form 1: Hostel Registration
    <div key="registration" className="bg-white p-6 border border-gray-300 mb-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">RSD HOSTEL</h1>
        <p className="text-sm">HOSTEL FOR BOYS & GIRLS IN HRIT CAMPUS</p>
        <p className="text-xs">ADD. 8TH K/M MILESTONE DELHI, MEERUT ROAD, JALALABAD-0069 MORTA GHAZIABAD, UP, 201206</p>
      </div>

      <h2 className="text-xl font-bold text-center mb-4 border-b-2 border-black pb-2">Hostel registration form</h2>
      
      <div className="mb-4">
        <p className="font-semibold mb-2">COURSE: B.Tech/M.Tech/B.Pharma/M.Pharma/ BHMCT/BBA(HM) MCA/MBA/PGDW/PGCM/BBA/BCA/B.COM/Polytechnic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name:</label>
          <div className="border-b border-black min-h-6">{formData.name}</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Father's Name:</label>
          <div className="border-b border-black min-h-6">{formData.fathersName}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth:</label>
          <div className="border-b border-black min-h-6">{formData.dateOfBirth}</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Room Option: Double/Triple Seater</label>
          <div className="border-b border-black min-h-6">{formData.roomOption}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Branch:</label>
          <div className="border-b border-black min-h-6">{formData.branch}</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year:</label>
          <div className="border-b border-black min-h-6">{formData.year}</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Session: 20......20......</label>
          <div className="border-b border-black min-h-6">{formData.sessionStart} - {formData.sessionEnd}</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Permanent Address (full Details):</label>
        <div className="border-b border-black min-h-12">{formData.permanentAddress}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Ph./Mob.No:</label>
        <div className="border-b border-black min-h-6">{formData.phone}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Local Guardian's Name & Address:</label>
        <div className="border-b border-black min-h-12">{formData.localGuardianName} - {formData.localGuardianAddress}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Ph./Mob.No:</label>
        <div className="border-b border-black min-h-6">{formData.localGuardianPhone}</div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Contact Person Name. Address & Ph.No.during Emergency:</label>
        <div className="border-b border-black min-h-12">{formData.emergencyContactName} - {formData.emergencyContactAddress} - {formData.emergencyContactPhone}</div>
      </div>

      <div className="border-2 border-black p-4 mb-6">
        <h3 className="font-bold text-center mb-2">Declaration</h3>
        <p className="text-sm mb-4">
          We hereby declare that all the information given by us are correct and true to the best of our knowledge. 
          We have read hostel and mess rules & regulations and we will abide by the same. 
          Failure to abide by rules will lead to expulsion from the hostel.
        </p>
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Signature of Guardian</p>
          </div>
          <div>
            <p className="font-semibold">Dated: {new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold">Signature of Student</p>
          </div>
        </div>
      </div>

      <div className="border-2 border-black p-4">
        <h3 className="font-bold text-center mb-4">For Office Use Only</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room No. Allotted:</label>
            <div className="border-b border-black min-h-6">{formData.roomNo}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Issued Furniture/ Electric Accessories:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">No. of Bed:</label>
              <div className="border-b border-black min-h-6">{formData.furniture.bed}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Table:</label>
              <div className="border-b border-black min-h-6">{formData.furniture.table}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chair:</label>
              <div className="border-b border-black min-h-6">{formData.furniture.chair}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CFL:</label>
              <div className="border-b border-black min-h-6">{formData.furniture.cfl}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fan:</label>
              <div className="border-b border-black min-h-6">{formData.furniture.fan}</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Signature of student for receiving of issued items:</p>
          <div className="border-b border-black min-h-6 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fees deposited:</label>
            <div className="border-b border-black min-h-6">{formData.feesDeposited}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Security Deposited:</label>
            <div className="border-b border-black min-h-6">{formData.securityDeposited}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Receipt No:</label>
            <div className="border-b border-black min-h-6">{formData.receiptNo}</div>
          </div>
        </div>
      </div>
    </div>,

    // Form 2: Affidavit
    <div key="affidavit" className="bg-white p-6 border border-gray-300 mb-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">AFFIDAVIT BY STUDENTS SEEKING ADMISSION TO RSD HOSTEL</h1>
      </div>

      <div className="mb-6">
        <p className="mb-4">
          I, <span className="border-b border-black inline-block min-w-48 px-2">{formData.studentNameAffidavit}</span> a student of <span className="border-b border-black inline-block min-w-48 px-2">{formData.courseAffidavit}</span>
        </p>
        <p className="mb-4">
          <span className="border-b border-black inline-block min-w-24 px-2">{formData.yearAffidavit}</span> (year) <span className="border-b border-black inline-block min-w-48 px-2">{formData.branchAffidavit}</span> (branch) of
        </p>
        <p className="text-center mb-4">
          B.Tech/M.Tech/B.Pharma/M.Pharma/BHMCT/BBA(HM)MCA/MBA/PGDM/PGCM/BBA/BCA/B.COM/Polytechnic
        </p>
        <p className="mb-4">hereby undertake an oath to abide by the followings:</p>
        
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>I am aware of the law regarding rehabilitation of ragging as well as the punishments.</li>
          <li>
            I shall not indulge in any act of ragging inside and outside the hostel and if found involved 
            in the act of ragging/guilty of the offence of ragging and / or abetting ragging will be liable 
            to the punishment appropriately including expulsion from the hostel and/ or institute.
          </li>
        </ol>
      </div>

      <div className="text-right mb-8">
        <p>Date: <span className="border-b border-black inline-block min-w-32 px-2">{formData.affidavitDate}</span></p>
        <p>Signature of Student Name: <span className="border-b border-black inline-block min-w-48 px-2">{formData.studentNameAffidavit}</span></p>
      </div>

      <div className="border-t-2 border-black pt-6">
        <h2 className="text-xl font-bold text-center mb-4">ENDORSEMENT OF GUARDIAN/PARENT</h2>
        <p className="mb-4">
          I, <span className="border-b border-black inline-block min-w-48 px-2">{formData.guardianNameAffidavit}</span> Guardian/Parent of <span className="border-b border-black inline-block min-w-48 px-2">{formData.studentNameAffidavit}</span>
        </p>
        <p className="mb-4">
          Student of <span className="border-b border-black inline-block min-w-64 px-2">{formData.courseAffidavit}</span> is fully aware of act regarding prohibition of ragging and of my ward is found involved in the act of ragging of any kind found guilty of the offence of ragging and / or abetting ragging will be liable to the punishment appropriately including expulsion from the hostel and / or Institution.
        </p>
        
        <div className="text-right">
          <p>Date: <span className="border-b border-black inline-block min-w-32 px-2">{formData.affidavitDate}</span></p>
          <p>Signature of Guardian/Parent Name: <span className="border-b border-black inline-block min-w-48 px-2">{formData.guardianNameAffidavit}</span></p>
        </div>
      </div>
    </div>,

    // Form 3: Medical & Legal Consent
    <div key="medical-consent" className="bg-white p-6 border border-gray-300 mb-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">RSD HOSTEL</h1>
        <p className="text-sm">HOSTEL FOR BOYS & GIRLS IN HRIT CAMPUS</p>
        <p className="text-xs">ADD. 8TH K/M MILESTONE DELHI, MEERUT ROAD, JALALABAD-0069 MORTA GHAZIABAD, UP 201206</p>
      </div>

      <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-black pb-2">MEDICAL & LEGAL CONSENT STATEMENT</h2>
      <p className="text-center text-sm mb-6">(To be signed by Parent / Guardian before joining RSD hostel)</p>

      <div className="space-y-4 mb-6">
        <p>
          I <span className="border-b border-black inline-block min-w-64 px-2">{formData.parentNameConsent}</span> hereby authorize HRIT Group to arrange for any necessary medical tests, treatment or surgery for my ward <span className="border-b border-black inline-block min-w-64 px-2">{formData.wardNameConsent}</span> including diagnostic examination, the administration of anesthetics (local, general or spinal) and blood transfusion, as also any other emergency medical procedure not mentioned herein based upon the professional judgement of the registered medical and nursing personnel associated with HRIT Group or a hospital the child is referred to by the medical staff. The entire expenses incurred in a hospital shall be borne by me.
        </p>
        
        <p>
          I also hereby authorize the HRIT Group authorities to sign on my behalf, with regard to any emergency surgery, diagnostic procedure or medical treatment.
        </p>
      </div>

      <div className="mt-8">
        <p>Date: <span className="border-b border-black inline-block min-w-32 px-2">{formData.consentDate}</span></p>
        <p className="mb-4">Signature of Parent/Guardian: <span className="border-b border-black inline-block min-w-48 px-2">{formData.parentNameConsent}</span></p>
        
        <p>Address: <span className="border-b border-black inline-block min-w-64 px-2">{formData.consentAddress}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p>Tel.No(Res.): <span className="border-b border-black inline-block min-w-32 px-2">{formData.telRes}</span></p>
          </div>
          <div>
            <p>(Off.): <span className="border-b border-black inline-block min-w-32 px-2">{formData.telOff}</span></p>
          </div>
          <div>
            <p>Mob No: <span className="border-b border-black inline-block min-w-32 px-2">{formData.mobNoConsent}</span></p>
          </div>
        </div>
      </div>
    </div>,

    // Form 4: Medical Record
    <div key="medical-record" className="bg-white p-6 border border-gray-300 mb-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">RSD HOSTEL</h1>
        <p className="text-sm">HOSTEL FOR BOYS & GIRLS IN HRIT CAMPUS</p>
        <p className="text-xs">ADD. 8TH VAN MILESTONE DELHI, MEERUT ROAD, JALALABAD-0069 MORTA GHAZIABAO, UP, 201206</p>
      </div>

      <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-black pb-2">STUDENT MEDICAL RECORD</h2>
      <p className="text-center text-sm mb-6">(To be filled & signed by parent / Guardian before joining RSD hostel)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p>Name of Student: <span className="border-b border-black inline-block min-w-48 px-2">{formData.studentNameMedical}</span></p>
        </div>
        <div>
          <p>Date of Birth: <span className="border-b border-black inline-block min-w-32 px-2">{formData.dobMedical}</span></p>
        </div>
      </div>

      <div className="mb-6">
        <p>Name of Parent / Guardian: <span className="border-b border-black inline-block min-w-64 px-2">{formData.parentNameMedical}</span></p>
      </div>

      <div className="mb-6">
        <p>Address: <span className="border-b border-black inline-block min-w-full px-2">{formData.addressMedical}</span></p>
      </div>

      <div className="mb-6">
        <p className="font-semibold">Blood Group: <span className="border-b border-black inline-block min-w-24 px-2">{formData.bloodGroup}</span></p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="font-semibold mb-2">1. Has your ward suffered from the following childhood disease?</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span>a. Chicken Pox: {formData.childhoodDiseases.chickenPox ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>b. Measles: {formData.childhoodDiseases.measles ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>c. Mumps: {formData.childhoodDiseases.mumps ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>d. Diphtheria: {formData.childhoodDiseases.diphtheria ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2">2. Has she/he suffered or suffers from any of the following disease?</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span>a. Tuberculosis: {formData.diseases.tuberculosis ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>b. Rheumatic fever: {formData.diseases.rheumaticFever ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>c. Infective hepatitis/jaundice: {formData.diseases.hepatitis ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>d. Bronchial Asthma: {formData.diseases.asthma ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span>e. Epilepsy: {formData.diseases.epilepsy ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Add other medical questions similarly */}
        <div>
          <p className="font-semibold mb-2">3. Does she/he suffer from any heart disease? {formData.heartDisease ? 'Yes' : 'No'}</p>
          {formData.heartDisease && <p>Details: {formData.heartDisease}</p>}
        </div>

        {/* Continue with other medical questions... */}
      </div>

      <div className="mt-8 text-sm">
        <p className="font-semibold">Note: please attach photocopies of any relevant health records/prescriptions and also mention the name and Tel No. of treating doctor if any to be contacted for past details in an emergency.</p>
        <div className="mt-4">
          <p>Date: <span className="border-b border-black inline-block min-w-32 px-2">{new Date().toLocaleDateString()}</span></p>
          <p>Signature of Parent / Guardian: <span className="border-b border-black inline-block min-w-48 px-2">{formData.parentNameMedical}</span></p>
          <p>M.NO-</p>
        </div>
      </div>
    </div>,

    // Form 5: Rules & Regulations
    <div key="rules" className="bg-white p-6 border border-gray-300">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">RSD HOSTEL</h1>
        <p className="text-sm">HOSTEL FOR BOYS & GIRLS IN HRIT CAMPUS</p>
        <p className="text-xs">ADD. 8TH K/M MILESTONE DELHI, MEERUT ROAD, JALALABAD-0069 MORTA GHAZIABAD, UP, 201206</p>
      </div>

      <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-black pb-2">HOSTEL & MESS RULES & REGULATIONS</h2>

      <div className="space-y-4 text-sm">
        <ol className="list-decimal list-inside space-y-3">
          <li>Every student shall be required to maintain high standard of discipline, decency & decorum, etiquette and conduct himself/herself in a disciplined & dignified manner.</li>
          <li>Each resident of Hostel will be issued Hostel Identity Card signed by RSD authority.</li>
          <li>Students shall do nothing which may cause disturbance in the studies or may be deemed vulgar in any way, which jeopardizes the normal life of the hostel.</li>
          {/* Continue with all 41 rules... */}
          <li>Students are required to check all electric fittings and furniture and other articles/ items issued to them at the time of occupying the room. They have to pay the damages/shortages, if any, at the end of every academic semester.</li>
          <li>Shifting of furniture from one room to another is not allowed. Students are also not allowed to use electric appliances like Cheater/cornerator/cooler, immersion rod, electric iron and any inflammable material etc. If found using them it will be confiscated and a fine be imposed by RSD authority.</li>
          {/* Add remaining rules... */}
        </ol>
      </div>

      <div className="mt-8 border-t-2 border-black pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p>Signature of student</p>
          </div>
          <div>
            <p>Date: <span className="border-b border-black inline-block min-w-32 px-2">{new Date().toLocaleDateString()}</span></p>
          </div>
          <div>
            <p>Signature of Guardian</p>
          </div>
        </div>
      </div>
    </div>
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Control Buttons */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 print:hidden">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(forms.length - 1, prev + 1))}
                disabled={currentPage === forms.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Print Form
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Download Form
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {forms.length}
            </span>
          </div>
        </div>

        {/* Forms Container */}
        <div id="hostel-forms" className="space-y-6">
          {forms[currentPage]}
        </div>

        {/* Page Navigation for Print */}
        <div className="print:block hidden">
          <div className="page-break"></div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default RSDHostelForm;
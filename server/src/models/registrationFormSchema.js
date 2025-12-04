const mongoose = require('mongoose');

const StudentRegistrationSchema = new mongoose.Schema({
  // Personal Information
  name: { type: String, required: true },
  fathersName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  roomOption: { type: String, enum: ['Double', 'Triple'], required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  sessionStart: { type: Number, required: true },
  sessionEnd: { type: Number, required: true },
  permanentAddress: { type: String, required: true },
  phone: { type: String, required: true },
  localGuardianName: { type: String },
  localGuardianAddress: { type: String },
  localGuardianPhone: { type: String },
  emergencyContactName: { type: String },
  emergencyContactAddress: { type: String },
  emergencyContactPhone: { type: String },

  // Affidavit
  course: { type: String, required: true },
  affidavitAgreement: { type: Boolean, required: true },

  // Medical Consent
  parentName: { type: String, required: true },
  wardName: { type: String, required: true },
  parentAddress: { type: String, required: true },
  parentTelRes: { type: String },
  parentTelOff: { type: String },
  parentMob: { type: String, required: true },
  consentAgreement: { type: Boolean, required: true },

  // Medical Record
  bloodGroup: { type: String, required: true },
  childhoodDiseases: {
    chickenPox: { type: Boolean, default: false },
    measles: { type: Boolean, default: false },
    mumps: { type: Boolean, default: false },
    diphtheria: { type: Boolean, default: false }
  },
  sufferedDiseases: {
    tuberculosis: { type: Boolean, default: false },
    rheumaticFever: { type: Boolean, default: false },
    jaundice: { type: Boolean, default: false },
    asthma: { type: Boolean, default: false },
    epilepsy: { type: Boolean, default: false }
  },
  heartDisease: { type: Boolean, default: false },
  heartDiseaseDetails: { type: String },
  gastrointestinalDisease: { type: Boolean, default: false },
  gastrointestinalDiseaseDetails: { type: String },
  skinDisease: { type: Boolean, default: false },
  skinDiseaseDetails: { type: String },
  psychiatricIllness: { type: Boolean, default: false },
  psychiatricIllnessDetails: { type: String },
  sleepWalking: { type: Boolean, default: false },
  sleepWalkingDetails: { type: String },
  surgeryInjury: { type: Boolean, default: false },
  surgeryInjuryDetails: { type: String },
  drugAllergies: { type: Boolean, default: false },
  drugAllergiesDetails: { type: String },
  otherAllergies: { type: Boolean, default: false },
  otherAllergiesDetails: { type: String },
  otherAilment: { type: Boolean, default: false },
  otherAilmentDetails: { type: String },

  // Rules Agreement
  rulesAgreement: { type: Boolean, required: true }
}, { timestamps: true });

const StudentRegistration = mongoose.model('StudentRegistration', StudentRegistrationSchema);
module.exports = StudentRegistration;



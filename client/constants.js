import { Wifi, WashingMachine, Dumbbell, ShieldCheck, Coffee, Utensils, BriefcaseMedical, Cctv, Power } from 'lucide-react';


export const COURSES = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Business Administration',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Architecture'
];

export const DUMMY_FACILITIES = [
  { name: 'High-Speed Wi-Fi', icon: Wifi },
  { name: 'Laundry Service', icon: WashingMachine },
  { name: 'Modern Gym', icon: Dumbbell },
  { name: '24/7 Security', icon: ShieldCheck },
  { name: 'Mess & Cafeteria', icon: Utensils },
  { name: 'Common Room', icon: Coffee },
  { name: 'Doctor on Call', icon: BriefcaseMedical },
  { name: 'CCTV Surveillance', icon: Cctv },
  { name: '24/7 Power Backup', icon: Power },
];

export const DUMMY_FEE_TIERS = [
  {
    type: 'Triple Occupancy',
    price: 85000,
    features: ['Shared Room (3)', 'Common Washroom', 'Standard Furnishing', 'Non-AC'],
  },
  {
    type: 'Double Occupancy',
    price: 95000,
    features: ['Shared Room (2)', 'Common Washroom', 'Premium Furnishing', 'Non-AC Room'],
  },
  {
    type: 'Single Occupancy',
    price: 115000,
    features: ['Private Room', 'Attached Washroom', 'Premium Furnishing', 'Non-AC Room'],
  },
  {
    type: 'AC Single Occupancy',
    price: `${130000}`,
    features: ['Private Room', 'Attached Washroom', 'Premium Furnishing', 'AC Room'],
  },
  {
    type: 'AC Double Occupancy',
    price: `${107000} `,
    features: ['Shared Room (2)', 'Common Washroom', 'Premium Furnishing', 'AC Room'],  
  },
  {
    type: 'AC Triple Occupancy',
    price: `${95000} `,
    features: ['Shared Room (3)', 'Common Washroom', 'Standard Furnishing', 'AC Room'],  
  }
];

export const MESS_TIMINGS = [
  {meal: 'Breakfast',breakfast: '8:45 AM – 9:30 AM'},
  {meal: 'Lunch',lunch: '1:00 PM – 2:00 PM'},
  {meal: 'Snacks',snacks: '5:00 PM – 5:30 PM'},
  {meal: 'Dinner',dinner: '8:00 PM – 9:00 PM'}
];

export const LEADERCARD_DATA = [
    {
      image: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606073/chancellor_ulu89h.jpg',
      name: "Dr. Anil Aggarwal",
      title: "Hon'ble Chancellor Ex Member of Parliament (R.S.) ",
      quote: "At HRIT University, we believe in shaping the future of our youth. As Franklin D. Roosevelt said, “We cannot always build the future for our youth, but we can build our youth for the future.” That’s why we are committed to providing a holistic education that equips our students with the knowledge, skills, and values needed to thrive in today’s competitive landscape."
    },
    {
      image: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606073/dk-sharma_vwiday.jpg',
      name: "Prof. (Dr.) Devendra Kumar Sharma",
      title: "Vice-Chancellor",
      quote: "The higher education is that which does not merely give us information, but makes our life in harmony with our existence"
    },
    {
      image: 'https://res.cloudinary.com/dvjndnhc7/image/upload/v1764606075/abhay-yadav_ogome6.jpg',
      name: "Adv. Abhay Yadav",
      title: "Hostel Director(RSD)",
      quote: "Ensuring a smooth, efficient, and supportive administrative framework for all our students and staff."
    }
  ];

  // Rules and regulations as an array for maintainability and easier rendering
export const rulesList = [
    `Every student shall be required to maintain high standard of discipline, decency & decorum, etiquette and conduct himself/herself in a disciplined & dignified manner.`,
    `Each resident of Hostel will be issued Hostel Identity Card signed by RSD authority.`,
    `Students shall do nothing which may cause disturbance in the studies or may be deemed vulgar in any way, which jeopardizes the normal life of the hostel.`,
    `Students are required to check all electric fittings and furniture and other articles/ items issued to them at the time of occupying the room. They have to pay the damages/shortages, if any, at the end of every academic semester.`,
    `Shifting of furniture from one room to another is not allowed. Students are also not allowed to use electric appliances like Cheater/cornerator/cooler, immersion rod, electric iron and any inflammable material etc. If found using them it will be confiscated and a fine be imposed by RSD authority.`,
    `Students are not allowed to interchange their room. Request for mutual exchange be forwarded through warden to RSD Authority for approval.`,
    `Keeping unwanted reading materials, Audios, Windows etc. & also Gambling and playing cards, smoking, consumption of liquor inside or outside the hostel and use of intoxicants are strictly prohibited.`,
    `Formation of society/club etc. is not permitted without the prior permission of RSD Authority.`,
    `All the inmates of the hostels cannot take part in any subversive forum or any kind of strike.`,
    `Students shall be required to vacate the room as and when required and ordered by RSD Authority.`,
    `Student shall be in no case, return to the hostel after 9:00 PM or as otherwise notified (which ever is earlier) except in case of emergency with the prior permission of Hostel Warden/Resident RSD hostel authority.`,
    `The RSD authorities and its representatives are authorized to search any room any time, open or locked, if required, under urgent and express circumstances.`,
    `Attendance will be taken in the hostel every evening at an appointed time. Absence without leave during the night is a punishable offence and fine of Rs. 500/- will be imposed which has to be paid within a week's time. If repeated, the inmate may be fined Rs. 1000/-or asked to vacate the Hostel at once.`,
    `Student shall leave the hostel only with prior approval of leave by concerned RSD Management. Students are required to sign with date completing all entries in the leave application & registers of the hostel and gate whenever they proceed on sanctioned leave from the hostel or return to the hostel after availing leaves. No student is allowed to stay in the Hostel during classes without valid reason & permission of the Warden of RSD authority.`,
    `The inmates are required to make proper entry in the register placed with the main gatekeeper. They must write the place where they wish to go and the purpose for which they are going out and expected time to return Hostel before 10:00 PM or as otherwise notified. (whichever is earlier)`,
    `No private Function will be celebrated by any student in the Mess/Hostel & Campus for special reason seek the writer permission of RSD Authority should be sought.`,
    `Day scholars are not allowed to stay in the hostel. If they are found in any room, a fine of Rs. 1000/- will be imposed for the first time and if repeated the inmates may be fined Rs. 1500/- and/or asked to leave hostel at once. Guest may be allowed for stay with charges on prior approval authorized person.`,
    `Mess timing should be observed strictly as notified from time to time. No item of mess can be taken outside the mess premises. SELF SERVICE SYSTEM is in the mess.`,
    `Sharing of trials is not permitted.`,
    `Food must not be wasted.`,
    `Students must come to mess properly dressed.`,
    `No student is permitted to enter the Kitchen, Mess Committee members of RSD Authority can however monitor activities inside the Kitchen.`,
    `A high standard of hygiene & cleanliness must be maintained in the mess. Dropping of food on table or floor, spilling of water, using water cooler for washing hands or spitting in the mess must be avoided.`,
    `Student will not inter-act with the mess staff. They will give their problems to the mess committee of RSD Authority who will resolve them after discussion with RSD management.`,
    `Day scholars are not allowed to avail the mess facility. Guests may be allowed on paid basis.`,
    `Hostellers are not allowed to keep any vehicle inside the campus without the permission of the RSD Authority. No frequent movement or over loading is allowed in campus.`,
    `Student are expected to behave properly with the hostel & mess staff. Disciplinary action will be taken in case of misbehavior with the staff by any student.`,
    `Room service is not allowed, SELF SERVICE SYSTEM is in the mess.`,
    `Hostel fee & Security will not be refunded in case of expulsion. If the student leaves the hostel on his / her own in between the academic session, Hostel fee will not be refundable. Security is refundable after completion of the course period and within 3 years of completion courses after which it will be forfeited. (1 session bond)`,
    `Every hostel inmate shall submit the written undertaking from his/her parents as to the deceased behavior and conduct of himself/ herself. In case, a student is found indulged in any act of induced relief misconduct including ragging/discernicism from class/ misrepresentative etc., subversive for RSD discipline & decorum, he/she shall have to vacate the hostel as ordered by RSD management.`,
    `In case of any authority dispute between inmates, the aggrieved parties shall have to give written representation through RSD Hostel authority for his observations & then to RSD discipline committees. They shall take appropriate action against the concerned inmates. If any inmate takes any action of his/her own and takes law & order in his/her hand to take`,
    `revenge or to retaliate with evil intents, he/she shall be held equally responsible for the dispute and suitable action will be taken against both the parties. No student is allowed to contact media/ police or any outside authority without due hostel permission of RSD Authority. If he/she defies the, appropriate action shall be initiated against the inmate(s) concerned.`,
    `Providing hostel is a facility to the students, which can be withdrawn at any time. Continuance of this facility is squarely subject to the satisfactory conduct and behavior of the inmate(s) concerned, where discipline, decency & decorum and etiquette are maintained.`,
    `Student Shall have to maintain cleanliness of their rooms and the hostels premises along with due upkeep of all the fittings and facilities provided to them in the rooms as well as in the hostels, mess & campus.`,
    `It shall be mandatory for all hostel inmates to adhere to the rules of the dress code as prescribed by the hostel concerned. Non-compliance of dress code shall invite appropriate disciplinary action. On off time & days also they must come outside hostel, properly dressed.`,
    `Hostel inmate(s) shall live together peacefully, friendly and brotherly in their hostel(s) to create conducive academic environment without the least prejudice and dislike. Anybody found to create bickering and braveries shall render himself/herself liable to stem punishment as decided by RSD discipline committee.`,
    `Hostel inmate(s) are especially required to comply with recent order of the Hon’ble Supreme Court about RAGGING, “…if any incident of ragging comes to the notice of the authority, the concerned student shall be given liberty to explain and if his explanation is not found satisfactory, the authority would expel him from the hostel.`,
    `Rules given above will be strictly followed by the students. Any violation of these rules shall result in appropriate disciplinary action being taken against the student.`,
    `MEDICAL FACILITY-A dispensary exists in the campus for the hostlers. In case of the exigencies. The hostel has tie up with good Hospitals. All expenses of the Hospitals shall be borne by students. First Aid Box is also available with RSD authority. Conveyance may be provided on payment basis, subject to availability.`,
    `Amendments/ changes or relaxation etc., if any, in the Hostel / Mess Rules & Regulations shall be notified by RSD authorities & that will be binding to the hostlers.`,
    `No one are allowed to leave the hostel a session (11 months). If the student wants to leave the hostel during his/her a session, he/she has to pay the fees for the entire staying fees of his session, only he/she can leave the hostel.`,
    `No one are allowed to waste electricity in hostel premises, if he/she found guilty then they have to pay compensation of 200rs to 500rs.`
  ];
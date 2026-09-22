export interface EmergencyContact {
  id: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  phoneNumbers: Array<{
    display: string;
    tel: string;
  }>;
  availableHours: string;
  iconType: 'security' | 'medical' | 'environment' | 'fire' | 'complain';
  badgeColor: string;
}

export const KKU_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'sec_kku',
    titleTh: 'กองป้องกันและรักษาความปลอดภัย มข.',
    titleEn: 'KKU Security & Safety Division',
    descTh: 'แจ้งเหตุฉุกเฉิน / อุบัติเหตุ / ความปลอดภัย ตลอด 24 ชม.',
    descEn: '24/7 Campus Emergency, Traffic Accidents & Safety Control',
    phoneNumbers: [
      { display: '043-202-111', tel: '043202111' },
      { display: '081-708-0289', tel: '0817080289' },
    ],
    availableHours: '24 ชั่วโมง',
    iconType: 'security',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'ems_srinagarind',
    titleTh: 'ศูนย์บริการทางการแพทย์ฉุกเฉิน รพ.ศรีนครินทร์ (กู้ชีพ)',
    titleEn: 'Emergency Medical Services (EMS), Srinagarind Hospital',
    descTh: 'เจ็บป่วยฉุกเฉิน / รถพยาบาลกู้ชีพ / อุบัติเหตุรุนแรง',
    descEn: 'Emergency Ambulance & Critical Medical Response',
    phoneNumbers: [
      { display: '043-363-111', tel: '043363111' },
      { display: '1669', tel: '1669' },
    ],
    availableHours: '24 ชั่วโมง',
    iconType: 'medical',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'utility_envi',
    titleTh: 'กองสาธารณูปโภคและสิ่งแวดล้อม',
    titleEn: 'Utilities and Environment Division',
    descTh: 'แจ้งท่ออุดตัน / น้ำท่วมขัง / ไฟฟ้าดับ / ปัญหาสิ่งแวดล้อม',
    descEn: 'Clogged Drainage, Water Issues, Blackout & Campus Sanitation',
    phoneNumbers: [
      { display: '043-202-222', tel: '043202222' },
      { display: '043-009-700 ต่อ 42777', tel: '043009700' },
    ],
    availableHours: 'วันและเวลาราชการ (มีเวรฉุกเฉิน)',
    iconType: 'environment',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'disaster_fire',
    titleTh: 'งานป้องกันและบรรเทาสาธารณภัย มข.',
    titleEn: 'Disaster Prevention and Mitigation Unit',
    descTh: 'ดับเพลิง / สัตว์มีพิษ / งูเข้าอาคาร / ต้นไม้ล้มกีดขวาง',
    descEn: 'Firefighting, Venomous Animals, Snakes & Disaster Rescue',
    phoneNumbers: [
      { display: '043-202-199', tel: '043202199' },
    ],
    availableHours: '24 ชั่วโมง',
    iconType: 'fire',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'complain_center',
    titleTh: 'ศูนย์รับเรื่องร้องเรียน มหาวิทยาลัยขอนแก่น',
    titleEn: 'KKU Complaint & Public Relations Center',
    descTh: 'รับเรื่องร้องเรียนทั่วไป / ประสานงานติดตามเรื่อง / ให้คำแนะนำ',
    descEn: 'Campus General Complaints, Follow-ups & Inquiries',
    phoneNumbers: [
      { display: '043-009-700', tel: '043009700' },
    ],
    availableHours: 'จันทร์ - ศุกร์ 08:30 - 16:30 น.',
    iconType: 'complain',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
];

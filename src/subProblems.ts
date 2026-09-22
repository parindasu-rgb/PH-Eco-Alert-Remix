import { PriorityLevel, ReportCategory, ReportUrgency, SubProblemOption } from './types';

export interface PriorityInfo {
  level: PriorityLevel;
  colorDot: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  labelTh: string;
  labelEn: string;
  actionTh: string;
  actionEn: string;
  descTh: string;
  descEn: string;
  slaTh: string;
  slaEn: string;
  iconType: 'critical' | 'plan' | 'delegate';
}

export const PRIORITY_CONFIG: Record<PriorityLevel, PriorityInfo> = {
  red: {
    level: 'red',
    colorDot: 'bg-rose-500 ring-4 ring-rose-200 animate-pulse',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-300',
    badgeText: 'text-rose-700',
    cardBg: 'bg-gradient-to-br from-rose-50/90 to-red-50/70',
    cardBorder: 'border-rose-200 ring-1 ring-rose-300/60',
    labelTh: 'ด่วนและสำคัญมาก (ทำทันที)',
    labelEn: 'Urgent & Critical (Do Immediately)',
    actionTh: 'ทำทันที',
    actionEn: 'Immediate Action',
    descTh: 'ปัญหาที่ส่งผลกระทบรุนแรงต่อชีวิตหรือความปลอดภัย',
    descEn: 'Severe impact on life, health, and campus safety',
    slaTh: 'เข้าดำเนินการภายใน 15-30 นาที',
    slaEn: 'Response within 15-30 mins',
    iconType: 'critical',
  },
  yellow: {
    level: 'yellow',
    colorDot: 'bg-amber-500 ring-4 ring-amber-200',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-800',
    cardBg: 'bg-gradient-to-br from-amber-50/90 to-yellow-50/70',
    cardBorder: 'border-amber-200 ring-1 ring-amber-300/60',
    labelTh: 'สำคัญแต่ไม่ด่วน (วางแผนทำ)',
    labelEn: 'Important but Not Urgent (Plan & Schedule)',
    actionTh: 'วางแผนทำ',
    actionEn: 'Plan & Schedule',
    descTh: 'ปัญหาที่มีผลระยะยาวหรือต้องใช้เวลาดำเนินการ',
    descEn: 'Long-term impact or requires planned operational schedule',
    slaTh: 'จัดสรรคิวงานและเริ่มภายใน 24-48 ชั่วโมง',
    slaEn: 'Scheduled within 24-48 hrs',
    iconType: 'plan',
  },
  green: {
    level: 'green',
    colorDot: 'bg-emerald-500 ring-4 ring-emerald-200',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    badgeText: 'text-emerald-800',
    cardBg: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/70',
    cardBorder: 'border-emerald-200 ring-1 ring-emerald-300/60',
    labelTh: 'ด่วนแต่ไม่สำคัญ (มอบหมายผู้อื่น)',
    labelEn: 'Urgent but Minor (Delegate / Fast Action)',
    actionTh: 'มอบหมายผู้อื่น',
    actionEn: 'Delegate & Resolve',
    descTh: 'ปัญหาที่จัดการได้เร็วและไม่ได้ส่งผลกระทบใหญ่หลวง',
    descEn: 'Quick resolution with low overall systemic impact',
    slaTh: 'มอบหมายทีมเข้าตรวจสอบภายใน 2-4 ชั่วโมง',
    slaEn: 'Delegated response within 2-4 hrs',
    iconType: 'delegate',
  },
};

export const SUB_PROBLEMS_BY_CATEGORY: Record<ReportCategory, SubProblemOption[]> = {
  infrastructure_utilities: [
    {
      id: 'infrastructure-building-damage',
      nameTh: 'อาคารชำรุดเสียหาย',
      nameEn: 'Building Damage',
      category: 'infrastructure_utilities',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'อาคารหรือส่วนประกอบอาคารชำรุด, ผนัง พื้น ฝ้า เพดาน เสียหาย, ประตูหรือหน้าต่างชำรุด',
      exampleEn: 'Building structure damage, wall/floor/ceiling damage, broken door/window',
    },
    {
      id: 'infrastructure-electrical-system',
      nameTh: 'ระบบไฟฟ้า',
      nameEn: 'Electrical System',
      category: 'infrastructure_utilities',
      priorityLevel: 'red',
      urgency: 'critical',
      exampleTh: 'ไฟฟ้าขัดข้อง, อุปกรณ์ไฟฟ้าชำรุด, ไฟส่องสว่างไม่ทำงาน, สายไฟหรือระบบไฟฟ้ามีปัญหา',
      exampleEn: 'Power outage, faulty electrical equipment, lights out, wiring issues',
    },
    {
      id: 'infrastructure-drainage-system',
      nameTh: 'การระบายน้ำ',
      nameEn: 'Drainage System',
      category: 'infrastructure_utilities',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'น้ำท่วมขัง, ท่อระบายน้ำอุดตัน, น้ำระบายไม่ทัน, ฝาท่อหรือรางระบายน้ำชำรุด',
      exampleEn: 'Water ponding, clogged drains, poor drainage, broken manhole/drain covers',
    },
  ],

  traffic: [
    {
      id: 'traffic-congestion',
      nameTh: 'รถติด',
      nameEn: 'Traffic Congestion',
      category: 'traffic',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'การจราจรติดขัด รถหนาแน่นในพื้นที่คณะ ชะลอตัวช่วงเวลาเร่งด่วน',
      exampleEn: 'Traffic congestion or delays within faculty premises during rush hour',
    },
    {
      id: 'traffic-accident',
      nameTh: 'อุบัติเหตุ',
      nameEn: 'Accident',
      category: 'traffic',
      priorityLevel: 'red',
      urgency: 'critical',
      exampleTh: 'อุบัติเหตุรถยนต์ รถจักรยานยนต์ หรือคนเดินเท้า',
      exampleEn: 'Vehicle collision, motorcycle accident, or pedestrian injury',
    },
    {
      id: 'traffic-signal-system',
      nameTh: 'ระบบสัญญาณไฟ',
      nameEn: 'Traffic Signal System',
      category: 'traffic',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'สัญญาณไฟจราจรขัดข้อง ป้ายเตือนหรือไฟกระพริบชำรุด',
      exampleEn: 'Traffic light malfunction, broken caution flasher or warning sign',
    },
  ],

  water: [
    {
      id: 'water-flooding',
      nameTh: 'น้ำท่วมขัง',
      nameEn: 'Ponding / Waterlogging',
      category: 'water',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'น้ำท่วมขังรอการระบาย ทางเดินเท้า ลานจอดรถ',
      exampleEn: 'Water ponding waiting for drainage on walkways or parking',
    },
    {
      id: 'water-wastewater',
      nameTh: 'น้ำเสีย',
      nameEn: 'Wastewater / Sewage Leak',
      category: 'water',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'น้ำเสียจากท่อ อาคาร โรงอาหาร ส่งผลระยะยาว',
      exampleEn: 'Wastewater from drains or buildings needing maintenance',
    },
    {
      id: 'water-clogged',
      nameTh: 'ท่อน้ำอุดตัน',
      nameEn: 'Clogged Drain / Pipe Blockage',
      category: 'water',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'เศษใบไม้ดินทรายอุดตันท่อระบายน้ำ',
      exampleEn: 'Leaves or debris blocking drainage grates',
    },
  ],

  air: [
    {
      id: 'air-pm',
      nameTh: 'ฝุ่น PM2.5/10',
      nameEn: 'Dust PM2.5 / PM10',
      category: 'air',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'ปริมาณฝุ่นละอองสะสม หรือฝุ่นจากการก่อสร้าง/การจราจร',
      exampleEn: 'High particulate matter accumulation in campus area',
    },
    {
      id: 'air-smoke',
      nameTh: 'ควันจากรถ/ควันไฟ',
      nameEn: 'Vehicle / Smoke Fumes',
      category: 'air',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'ควันดำจากยานพาหนะ ควันไฟจากการเผาเศษหญ้า',
      exampleEn: 'Exhaust smoke from vehicles or open burning',
    },
    {
      id: 'air-chemical',
      nameTh: 'กลิ่นสารเคมี',
      nameEn: 'Chemical Odor / Toxic Fumes',
      category: 'air',
      priorityLevel: 'red',
      urgency: 'critical',
      exampleTh: 'กลิ่นสารเคมีระเหย กลิ่นฉุนรุนแรงจากห้องปฏิบัติการหรือถังบรรจุ',
      exampleEn: 'Intense chemical vapor or lab solvent fumes',
    },
    {
      id: 'air-ventilation',
      nameTh: 'อากาศไม่ถ่ายเท/แออัด',
      nameEn: 'Poor Ventilation / Stuffy Area',
      category: 'air',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'ห้องเรียน ห้องแล็บ หรือโถงทางเดินอากาศอับชื้นไม่หมุนเวียน',
      exampleEn: 'Stuffy, poorly ventilated rooms or crowded corridors',
    },
  ],

  noise: [
    {
      id: 'noise-general',
      nameTh: 'เสียงรบกวน',
      nameEn: 'General Noise Disturbance',
      category: 'noise',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'เสียงกิจกรรม เสียงเพลง หรือเสียงพูดคุยรบกวนการเรียน',
      exampleEn: 'General loud noise or event sound affecting study areas',
    },
    {
      id: 'noise-construction',
      nameTh: 'เสียงจากการก่อสร้าง',
      nameEn: 'Construction Noise',
      category: 'noise',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'การเจาะ ทุบ หรือก่อสร้างนอกช่วงเวลาที่ได้รับอนุญาต',
      exampleEn: 'Loud construction, drilling, or renovation work',
    },
    {
      id: 'noise-machinery',
      nameTh: 'เสียงเครื่องจักร',
      nameEn: 'Machinery / Generator Noise',
      category: 'noise',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'เสียงปั๊มน้ำ เครื่องกำเนิดไฟฟ้า หรือระบบระบายอากาศทำงานผิดปกติ',
      exampleEn: 'Loud generator, water pump, or HVAC mechanical noise',
    },
  ],

  odor: [
    {
      id: 'odor-unpleasant',
      nameTh: 'กลิ่นไม่พึงประสงค์',
      nameEn: 'Unpleasant Odor',
      category: 'odor',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'กลิ่นอับชื้น กลิ่นปุ๋ย หรือกลิ่นรบกวนบริเวณทั่วไป',
      exampleEn: 'Musty, fertilizer, or general stale odor in vicinity',
    },
    {
      id: 'odor-waste',
      nameTh: 'กลิ่นขยะ/ของเสีย',
      nameEn: 'Garbage / Waste Odor',
      category: 'odor',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'กลิ่นเศษอาหารเน่าเสีย กลิ่นถังขยะหมักหมม',
      exampleEn: 'Smell from decaying food waste or garbage bins',
    },
    {
      id: 'odor-drain',
      nameTh: 'กลิ่นท่อน้ำทิ้ง',
      nameEn: 'Sewer / Drain Odor',
      category: 'odor',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'กลิ่นก๊าซไข่เน่าจากท่อระบายน้ำหรือบ่อดักไขมัน',
      exampleEn: 'Sewer gas or grease trap smell backflowing into area',
    },
    {
      id: 'odor-smoke',
      nameTh: 'กลิ่นควัน',
      nameEn: 'Smoke Odor',
      category: 'odor',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'กลิ่นควันบุหรี่ ควันเตาปิ้งย่าง หรือควันเผาไหม้',
      exampleEn: 'Odor from tobacco smoke, cooking, or burning residues',
    },
  ],

  waste: [
    {
      id: 'waste-overflow',
      nameTh: 'ขยะล้นถัง',
      nameEn: 'Overflowing Trash Bins',
      category: 'waste',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'ถังขยะเต็ม ไม่มีที่ทิ้ง ขยะล้นออกนอกถัง',
      exampleEn: 'Trash bins full, waste overflowing around the bin area',
    },
    {
      id: 'waste-pile',
      nameTh: 'กองขยะ',
      nameEn: 'Garbage Pile / Illegal Dumping',
      category: 'waste',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'กองเศษวัสดุก่อสร้าง กิ่งไม้ หรือขยะสะสมขนาดใหญ่',
      exampleEn: 'Large piles of accumulated waste or bulk debris',
    },
    {
      id: 'waste-hazardous',
      nameTh: 'ขยะอันตราย',
      nameEn: 'Hazardous / Toxic Waste',
      category: 'waste',
      priorityLevel: 'red',
      urgency: 'critical',
      exampleTh: 'สารเคมีอันตราย ขยะติดเชื้อ แบตเตอรี่ หรือหลอดไฟแตก',
      exampleEn: 'Chemical containers, infectious waste, broken bulbs/batteries',
    },
  ],

  vector: [
    {
      id: 'vector-mosquito',
      nameTh: 'ยุง/ยุงลาย',
      nameEn: 'Mosquitoes / Larvae Breeding',
      category: 'vector',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'แหล่งเพาะพันธุ์ลูกน้ำยุงลาย ยุงชุกชุมบริเวณร่มไม้',
      exampleEn: 'Mosquito breeding in stagnant water or dense vegetation',
    },
    {
      id: 'vector-wasp',
      nameTh: 'ผึ้ง/ต่อ/แตน',
      nameEn: 'Bees / Wasps / Hornets',
      category: 'vector',
      priorityLevel: 'red',
      urgency: 'critical',
      exampleTh: 'รังต่อ รังแตน หรือรังผึ้งขนาดใหญ่ใกล้ทางเดิน/อาคารเรียน',
      exampleEn: 'Wasp, hornet, or bee nest near building entrances or walkways',
    },
    {
      id: 'vector-snake',
      nameTh: 'งู/สัตว์มีพิษ',
      nameEn: 'Snakes / Venomous Creatures',
      category: 'vector',
      priorityLevel: 'red',
      urgency: 'critical',
      exampleTh: 'พบงู ตะขาบ แมงป่อง ในอาคาร ห้องน้ำ หรือทางสัญจร',
      exampleEn: 'Venomous snakes, centipedes, or scorpions found on premise',
    },
    {
      id: 'vector-stray',
      nameTh: 'สุนัข/แมวจรจัด',
      nameEn: 'Stray Dogs / Cats Risk',
      category: 'vector',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'สุนัขจรจัดดุร้าย หรือแมวจรจัดในพื้นที่รับประทานอาหาร',
      exampleEn: 'Aggressive stray animals or animals in dining areas',
    },
  ],

  others: [
    {
      id: 'others-light',
      nameTh: 'ไฟส่องสว่างดับ',
      nameEn: 'Street / Area Light Out',
      category: 'others',
      priorityLevel: 'green',
      urgency: 'low',
      exampleTh: 'หลอดไฟทางเดิน ลานจอดรถ หรือเสาไฟถนนดับ มืดเสี่ยงอันตราย',
      exampleEn: 'Walkway or street lighting lamp broken or out',
    },
    {
      id: 'others-tree',
      nameTh: 'ต้นไม้หักโค่น',
      nameEn: 'Fallen / Dangerous Tree',
      category: 'others',
      priorityLevel: 'yellow',
      urgency: 'medium',
      exampleTh: 'กิ่งไม้ใหญ่พาดสายไฟ หรือต้นไม้เอียงเสี่ยงหักโค่น',
      exampleEn: 'Fallen branches on power lines or leaning hazardous trees',
    },
    {
      id: 'others-custom',
      nameTh: 'อื่น ๆ',
      nameEn: 'Other Issue (Specify details)',
      category: 'others',
      priorityLevel: 'yellow',
      urgency: 'medium',
      requiresCustomInput: true,
      exampleTh: 'ปัญหาอื่น ๆ นอกเหนือจากตัวเลือกข้างต้น (กรุณาระบุรายละเอียดเพิ่มเติม)',
      exampleEn: 'Other issues not listed above (please describe below)',
    },
  ],
};

export function getSubProblemsForCategory(category: ReportCategory): SubProblemOption[] {
  return SUB_PROBLEMS_BY_CATEGORY[category] || SUB_PROBLEMS_BY_CATEGORY.water;
}

export function findSubProblemById(subProblemId: string): SubProblemOption | undefined {
  for (const list of Object.values(SUB_PROBLEMS_BY_CATEGORY)) {
    const found = list.find((item) => item.id === subProblemId);
    if (found) return found;
  }
  return undefined;
}

import { ReportCategory } from '../types';

export interface EnvironmentalSubcategoryConfig {
  id: string; // The standard code, e.g. "building_damage", "electrical_system", "drainage_system", "traffic_congestion", "accident", "traffic_signal_system"
  subProblemId: string; // The internal matching id in SUB_PROBLEMS_BY_CATEGORY
  name: string;
  nameEn: string;
  exampleTh?: string;
  exampleEn?: string;
  priorityLevel?: 'red' | 'yellow' | 'green';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EnvironmentalCategoryConfig {
  id: ReportCategory;
  name: string;
  nameEn: string;
  titleTh: string; // Alias for name
  titleEn: string; // Alias for nameEn
  descTh: string;
  descEn: string;
  iconName:
    | 'wrench'
    | 'car'
    | 'droplets'
    | 'wind'
    | 'volume2'
    | 'biohazard'
    | 'trash2'
    | 'bug'
    | 'helpCircle';
  badgeColor: string;
  badgeBg: string;
  activeBorder: string;
  activeBg: string;
  subcategories: EnvironmentalSubcategoryConfig[];
}

export const ENVIRONMENTAL_CATEGORIES: EnvironmentalCategoryConfig[] = [
  {
    id: 'infrastructure_utilities',
    name: 'ระบบสาธารณูปโภค',
    nameEn: 'Infrastructure & Utilities',
    titleTh: 'ระบบสาธารณูปโภค',
    titleEn: 'Infrastructure & Utilities',
    descTh: 'ปัญหาที่เกี่ยวข้องกับอาคาร ระบบไฟฟ้า และระบบระบายน้ำภายในพื้นที่',
    descEn: 'Building damage, electrical systems, and drainage issues in campus area',
    iconName: 'wrench',
    badgeColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-50',
    subcategories: [
      {
        id: 'building_damage',
        subProblemId: 'infrastructure-building-damage',
        name: 'อาคารชำรุดเสียหาย',
        nameEn: 'Building Damage',
        exampleTh: 'อาคารหรือส่วนประกอบอาคารชำรุด, ผนัง พื้น ฝ้า เพดาน เสียหาย, ประตูหรือหน้าต่างชำรุด',
        exampleEn: 'Building structure damage, wall/floor/ceiling damage, broken door/window',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'electrical_system',
        subProblemId: 'infrastructure-electrical-system',
        name: 'ระบบไฟฟ้า',
        nameEn: 'Electrical System',
        exampleTh: 'ไฟฟ้าขัดข้อง, อุปกรณ์ไฟฟ้าชำรุด, ไฟส่องสว่างไม่ทำงาน, สายไฟหรือระบบไฟฟ้ามีปัญหา',
        exampleEn: 'Power outage, faulty electrical equipment, lights out, wiring issues',
        priorityLevel: 'red',
        urgency: 'critical',
      },
      {
        id: 'drainage_system',
        subProblemId: 'infrastructure-drainage-system',
        name: 'การระบายน้ำ',
        nameEn: 'Drainage System',
        exampleTh: 'น้ำท่วมขัง, ท่อระบายน้ำอุดตัน, น้ำระบายไม่ทัน, ฝาท่อหรือรางระบายน้ำชำรุด',
        exampleEn: 'Water ponding, clogged drains, poor drainage, broken manhole/drain covers',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
    ],
  },
  {
    id: 'traffic',
    name: 'การจราจร',
    nameEn: 'Traffic',
    titleTh: 'การจราจร',
    titleEn: 'Traffic',
    descTh: 'ปัญหาที่เกี่ยวข้องกับการจราจร การเดินทาง และความปลอดภัยในการใช้เส้นทางภายในพื้นที่',
    descEn: 'Traffic congestion, accidents, and route safety in campus area',
    iconName: 'car',
    badgeColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-100',
    activeBorder: 'border-indigo-500',
    activeBg: 'bg-indigo-50',
    subcategories: [
      {
        id: 'traffic_congestion',
        subProblemId: 'traffic-congestion',
        name: 'รถติด',
        nameEn: 'Traffic Congestion',
        exampleTh: 'การจราจรติดขัด รถหนาแน่นในพื้นที่คณะ ชะลอตัวช่วงเวลาเร่งด่วน',
        exampleEn: 'Traffic congestion or delays within faculty premises during rush hour',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'accident',
        subProblemId: 'traffic-accident',
        name: 'อุบัติเหตุ',
        nameEn: 'Accident',
        exampleTh: 'อุบัติเหตุรถยนต์ รถจักรยานยนต์ หรือคนเดินเท้า',
        exampleEn: 'Vehicle collision, motorcycle accident, or pedestrian injury',
        priorityLevel: 'red',
        urgency: 'critical',
      },
      {
        id: 'traffic_signal_system',
        subProblemId: 'traffic-signal-system',
        name: 'ระบบสัญญาณไฟ',
        nameEn: 'Traffic Signal System',
        exampleTh: 'สัญญาณไฟจราจรขัดข้อง ป้ายเตือนหรือไฟกระพริบชำรุด',
        exampleEn: 'Traffic light malfunction, broken caution flasher or warning sign',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
    ],
  },
  {
    id: 'water',
    name: 'คุณภาพน้ำ / น้ำเสีย',
    nameEn: 'Water Quality / Wastewater',
    titleTh: 'คุณภาพน้ำ / น้ำเสีย',
    titleEn: 'Water Quality / Wastewater',
    descTh: 'น้ำท่วมขัง น้ำเสีย ท่อน้ำอุดตัน น้ำรั่วซึม',
    descEn: 'Ponding, wastewater leaks, clogged drains, pipe bursts',
    iconName: 'droplets',
    badgeColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50',
    subcategories: [
      {
        id: 'water_flooding',
        subProblemId: 'water-flooding',
        name: 'น้ำท่วมขัง',
        nameEn: 'Ponding / Waterlogging',
        exampleTh: 'น้ำท่วมขังรอการระบาย ทางเดินเท้า ลานจอดรถ',
        exampleEn: 'Water ponding waiting for drainage on walkways or parking',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'water_wastewater',
        subProblemId: 'water-wastewater',
        name: 'น้ำเสีย',
        nameEn: 'Wastewater / Sewage Leak',
        exampleTh: 'น้ำเสียจากท่อ อาคาร โรงอาหาร ส่งผลระยะยาว',
        exampleEn: 'Wastewater from drains or buildings needing maintenance',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'water_clogged',
        subProblemId: 'water-clogged',
        name: 'ท่อน้ำอุดตัน',
        nameEn: 'Clogged Drain / Pipe Blockage',
        exampleTh: 'เศษใบไม้ดินทรายอุดตันท่อระบายน้ำ',
        exampleEn: 'Leaves or debris blocking drainage grates',
        priorityLevel: 'green',
        urgency: 'low',
      },
    ],
  },
  {
    id: 'air',
    name: 'มลพิษอากาศ / ฝุ่นควัน',
    nameEn: 'Air Pollution / PM2.5',
    titleTh: 'มลพิษอากาศ / ฝุ่นควัน',
    titleEn: 'Air Pollution / PM2.5',
    descTh: 'ฝุ่น PM2.5/10 ควันจากรถ กลิ่นสารเคมี อากาศไม่ถ่ายเท',
    descEn: 'Dust, smoke, chemical fumes, poor ventilation',
    iconName: 'wind',
    badgeColor: 'text-sky-700',
    badgeBg: 'bg-sky-100',
    activeBorder: 'border-sky-500',
    activeBg: 'bg-sky-50',
    subcategories: [
      {
        id: 'air_pm',
        subProblemId: 'air-pm',
        name: 'ฝุ่น PM2.5/10',
        nameEn: 'Dust PM2.5 / PM10',
        exampleTh: 'ปริมาณฝุ่นละอองสะสม หรือฝุ่นจากการก่อสร้าง/การจราจร',
        exampleEn: 'High particulate matter accumulation in campus area',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'air_smoke',
        subProblemId: 'air-smoke',
        name: 'ควันจากรถ/ควันไฟ',
        nameEn: 'Vehicle / Smoke Fumes',
        exampleTh: 'ควันดำจากยานพาหนะ ควันไฟจากการเผาเศษหญ้า',
        exampleEn: 'Exhaust smoke from vehicles or open burning',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'air_chemical',
        subProblemId: 'air-chemical',
        name: 'กลิ่นสารเคมี',
        nameEn: 'Chemical Odor / Toxic Fumes',
        exampleTh: 'กลิ่นสารเคมีระเหย กลิ่นฉุนรุนแรงจากห้องปฏิบัติการหรือถังบรรจุ',
        exampleEn: 'Intense chemical vapor or lab solvent fumes',
        priorityLevel: 'red',
        urgency: 'critical',
      },
      {
        id: 'air_ventilation',
        subProblemId: 'air-ventilation',
        name: 'อากาศไม่ถ่ายเท/แออัด',
        nameEn: 'Poor Ventilation / Stuffy Area',
        exampleTh: 'ห้องเรียน ห้องแล็บ หรือโถงทางเดินอากาศอับชื้นไม่หมุนเวียน',
        exampleEn: 'Stuffy, poorly ventilated rooms or crowded corridors',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
    ],
  },
  {
    id: 'noise',
    name: 'เสียงดังรบกวน',
    nameEn: 'Noise Disturbance',
    titleTh: 'เสียงดังรบกวน',
    titleEn: 'Noise Disturbance',
    descTh: 'เสียงรบกวน เสียงก่อสร้าง เสียงเครื่องจักร',
    descEn: 'General noise, construction, generator/machine sound',
    iconName: 'volume2',
    badgeColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-50',
    subcategories: [
      {
        id: 'noise_general',
        subProblemId: 'noise-general',
        name: 'เสียงรบกวน',
        nameEn: 'General Noise Disturbance',
        exampleTh: 'เสียงกิจกรรม เสียงเพลง หรือเสียงพูดคุยรบกวนการเรียน',
        exampleEn: 'General loud noise or event sound affecting study areas',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'noise_construction',
        subProblemId: 'noise-construction',
        name: 'เสียงจากการก่อสร้าง',
        nameEn: 'Construction Noise',
        exampleTh: 'การเจาะ ทุบ หรือก่อสร้างนอกช่วงเวลาที่ได้รับอนุญาต',
        exampleEn: 'Loud construction, drilling, or renovation work',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'noise_machinery',
        subProblemId: 'noise-machinery',
        name: 'เสียงเครื่องจักร',
        nameEn: 'Machinery / Generator Noise',
        exampleTh: 'เสียงปั๊มน้ำ เครื่องกำเนิดไฟฟ้า หรือระบบระบายอากาศทำงานผิดปกติ',
        exampleEn: 'Loud generator, water pump, or HVAC mechanical noise',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
    ],
  },
  {
    id: 'odor',
    name: 'กลิ่นเหม็น / สารเคมี',
    nameEn: 'Odor / Gas Leak',
    titleTh: 'กลิ่นเหม็น / สารเคมี',
    titleEn: 'Odor / Gas Leak',
    descTh: 'กลิ่นไม่พึงประสงค์ กลิ่นขยะ กลิ่นท่อน้ำทิ้ง กลิ่นควัน',
    descEn: 'Unpleasant smell, trash odor, sewer smell, smoke smell',
    iconName: 'biohazard',
    badgeColor: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    activeBorder: 'border-purple-500',
    activeBg: 'bg-purple-50',
    subcategories: [
      {
        id: 'odor_unpleasant',
        subProblemId: 'odor-unpleasant',
        name: 'กลิ่นไม่พึงประสงค์',
        nameEn: 'Unpleasant Odor',
        exampleTh: 'กลิ่นอับชื้น กลิ่นปุ๋ย หรือกลิ่นรบกวนบริเวณทั่วไป',
        exampleEn: 'Musty, fertilizer, or general stale odor in vicinity',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'odor_waste',
        subProblemId: 'odor-waste',
        name: 'กลิ่นขยะ/ของเสีย',
        nameEn: 'Garbage / Waste Odor',
        exampleTh: 'กลิ่นเศษอาหารเน่าเสีย กลิ่นถังขยะหมักหมม',
        exampleEn: 'Smell from decaying food waste or garbage bins',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'odor_drain',
        subProblemId: 'odor-drain',
        name: 'กลิ่นท่อน้ำทิ้ง',
        nameEn: 'Sewer / Drain Odor',
        exampleTh: 'กลิ่นก๊าซไข่เน่าจากท่อระบายน้ำหรือบ่อดักไขมัน',
        exampleEn: 'Sewer gas or grease trap smell backflowing into area',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'odor_smoke',
        subProblemId: 'odor-smoke',
        name: 'กลิ่นควัน',
        nameEn: 'Smoke Odor',
        exampleTh: 'กลิ่นควันบุหรี่ ควันเตาปิ้งย่าง หรือควันเผาไหม้',
        exampleEn: 'Odor from tobacco smoke, cooking, or burning residues',
        priorityLevel: 'green',
        urgency: 'low',
      },
    ],
  },
  {
    id: 'waste',
    name: 'ขยะ / สิ่งปฏิกูล',
    nameEn: 'Waste & Sanitation',
    titleTh: 'ขยะ / สิ่งปฏิกูล',
    titleEn: 'Waste & Sanitation',
    descTh: 'ขยะล้นถัง ขยะติดเชื้อ จุดทิ้งขยะไม่ถูกสุขลักษณะ',
    descEn: 'Overflowing bins, hazardous or infectious waste, improper dumping',
    iconName: 'trash2',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50',
    subcategories: [
      {
        id: 'waste_overflow',
        subProblemId: 'waste-overflow',
        name: 'ขยะล้นถัง',
        nameEn: 'Overflowing Garbage Bins',
        exampleTh: 'ขยะล้นออกมานอกถัง ไม่มีฝาปิด สุนัขหรือสัตว์คุ้ยเขี่ย',
        exampleEn: 'Bins overflowing, uncollected bags, scattered waste',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'waste_infectious',
        subProblemId: 'waste-infectious',
        name: 'ขยะอันตราย/ขยะติดเชื้อ',
        nameEn: 'Hazardous / Infectious Waste',
        exampleTh: 'ขยะสารเคมี เข็มฉีดยา หน้ากากอนามัย หรือหลอดไฟแตกตกค้าง',
        exampleEn: 'Chemical containers, infectious waste, broken bulbs/batteries',
        priorityLevel: 'red',
        urgency: 'critical',
      },
      {
        id: 'waste_improper',
        subProblemId: 'waste-improper',
        name: 'จุดทิ้งขยะไม่ถูกสุขลักษณะ',
        nameEn: 'Improper Dumping Site',
        exampleTh: 'การลักลอบทิ้งขยะนอกจุดที่กำหนด ส่งกลิ่นเหม็นและสกปรก',
        exampleEn: 'Illegal dumping in undesignated campus grounds',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
    ],
  },
  {
    id: 'vector',
    name: 'พาหะนำโรค / สัตว์มีพิษ',
    nameEn: 'Vectors & Poisonous Animals',
    titleTh: 'พาหะนำโรค / สัตว์มีพิษ',
    titleEn: 'Vectors & Poisonous Animals',
    descTh: 'ยุงลาย แมลงสาบ หนู งู สัตว์มีพิษ สัตว์จรจัด',
    descEn: 'Mosquito breeding, vermin, venomous snakes/wasps, stray animals',
    iconName: 'bug',
    badgeColor: 'text-rose-700',
    badgeBg: 'bg-rose-100',
    activeBorder: 'border-rose-500',
    activeBg: 'bg-rose-50',
    subcategories: [
      {
        id: 'vector_mosquito',
        subProblemId: 'vector-mosquito',
        name: 'ยุงลาย/แหล่งเพาะพันธุ์',
        nameEn: 'Mosquitoes / Breeding Sites',
        exampleTh: 'แอ่งน้ำขังในจานรองกระถาง ยางรถเก่า ลูกน้ำยุงลายชุกชุม',
        exampleEn: 'Stagnant water breeding Aedes mosquitoes and larvae',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'vector_rodent',
        subProblemId: 'vector-rodent',
        name: 'หนู/แมลงสาบ',
        nameEn: 'Rats / Cockroaches',
        exampleTh: 'พบหนูหรือแมลงสาบชุกชุมในอาคาร โรงอาหาร หรือห้องน้ำ',
        exampleEn: 'Infestation of rats or cockroaches in cafeterias or buildings',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'vector_snake',
        subProblemId: 'vector-snake',
        name: 'งู/สัตว์เลื้อยคลานมีพิษ',
        nameEn: 'Snakes / Venomous Reptiles',
        exampleTh: 'พบงู ต่อ แตน ผึ้งหลวง หรือตะขาบ ในอาคารหรือทางเดิน',
        exampleEn: 'Venomous snake, hornets, wasps, or dangerous reptiles seen',
        priorityLevel: 'red',
        urgency: 'critical',
      },
      {
        id: 'vector_stray',
        subProblemId: 'vector-stray',
        name: 'สุนัข/แมวจรจัดดุร้าย',
        nameEn: 'Stray / Aggressive Animals',
        exampleTh: 'สุนัขจรจัดแสดงพฤติกรรมดุร้าย เสี่ยงกัดนักศึกษาหรือผู้สัญจร',
        exampleEn: 'Aggressive stray dogs showing rabies risk or biting threats',
        priorityLevel: 'red',
        urgency: 'critical',
      },
    ],
  },
  {
    id: 'others',
    name: 'ปัญหาอื่นๆ',
    nameEn: 'Other Environmental Issues',
    titleTh: 'ปัญหาอื่นๆ',
    titleEn: 'Other Environmental Issues',
    descTh: 'ไฟฟ้าส่องสว่างดับ ต้นไม้หักโค่น ปัญหาอื่นๆ',
    descEn: 'Street lights broken, fallen branches/trees, and other issues',
    iconName: 'helpCircle',
    badgeColor: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    activeBorder: 'border-slate-500',
    activeBg: 'bg-slate-50',
    subcategories: [
      {
        id: 'others_light',
        subProblemId: 'others-light',
        name: 'ไฟฟ้าส่องสว่างดับ',
        nameEn: 'Lighting Broken / Outage',
        exampleTh: 'หลอดไฟทางเดิน ลานจอดรถ หรือเสาไฟถนนดับ มืดเสี่ยงอันตราย',
        exampleEn: 'Walkway or street lighting lamp broken or out',
        priorityLevel: 'green',
        urgency: 'low',
      },
      {
        id: 'others_tree',
        subProblemId: 'others-tree',
        name: 'ต้นไม้หักโค่น',
        nameEn: 'Fallen / Dangerous Tree',
        exampleTh: 'กิ่งไม้ใหญ่พาดสายไฟ หรือต้นไม้เอียงเสี่ยงหักโค่น',
        exampleEn: 'Fallen branches on power lines or leaning hazardous trees',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
      {
        id: 'others_custom',
        subProblemId: 'others-custom',
        name: 'อื่น ๆ',
        nameEn: 'Other Issue (Specify details)',
        exampleTh: 'ปัญหาอื่น ๆ นอกเหนือจากตัวเลือกข้างต้น (กรุณาระบุรายละเอียดเพิ่มเติม)',
        exampleEn: 'Other issues not listed above (please describe below)',
        priorityLevel: 'yellow',
        urgency: 'medium',
      },
    ],
  },
];

/**
 * Helper to find a category by its ID
 */
export function getCategoryConfigById(id: string): EnvironmentalCategoryConfig | undefined {
  return ENVIRONMENTAL_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Helper to map subcategory code or subproblem ID to standard IDs
 */
export function resolveCategoryAndSubcategory(
  categoryId?: string,
  subProblemOrSubcategoryId?: string
): {
  category: ReportCategory;
  subProblemId: string;
  subcategoryId: string;
} {
  const defaultCategory: ReportCategory = 'infrastructure_utilities';
  const matchedCat = ENVIRONMENTAL_CATEGORIES.find((c) => c.id === categoryId) || ENVIRONMENTAL_CATEGORIES[0];
  const catId = (matchedCat ? matchedCat.id : defaultCategory) as ReportCategory;

  let matchedSub = matchedCat?.subcategories.find(
    (s) => s.id === subProblemOrSubcategoryId || s.subProblemId === subProblemOrSubcategoryId
  );

  if (!matchedSub && matchedCat && matchedCat.subcategories.length > 0) {
    matchedSub = matchedCat.subcategories[0];
  }

  return {
    category: catId,
    subProblemId: matchedSub ? matchedSub.subProblemId : '',
    subcategoryId: matchedSub ? matchedSub.id : '',
  };
}

import type { LessonId, LessonSummary, Level } from '../types/course';

const coreLessons: Omit<LessonSummary, 'level'>[] = [
  {
    id: 'overview',
    order: 1,
    title: 'ภาพรวมระบบ Authentication',
    shortTitle: 'ภาพรวม',
    description:
      'เข้าใจ flow ของ Register, Login และ Session รวมถึงบทบาทของ Frontend, Backend และฐานข้อมูลก่อนเริ่มลงมือ',
    durationMinutes: 10,
    outcomes: [
      'อธิบาย flow ของการสมัครสมาชิกและเข้าสู่ระบบ',
      'แยก responsibilities ของ Frontend, Backend และ Database',
      'วางแผนเส้นทางสร้าง Authentication ที่เข้าใจง่าย',
    ],
    tags: ['Authentication', 'Flow'],
  },
  {
    id: 'installation',
    order: 2,
    title: 'ติดตั้งเครื่องมือและตรวจสอบ Node.js',
    shortTitle: 'ติดตั้ง',
    description:
      'ติดตั้ง Node.js, MySQL, HeidiSQL และ VS Code พร้อมตรวจสอบ environment เพื่อเตรียมเครื่องมือสำหรับ hands-on labs',
    durationMinutes: 30,
    outcomes: [
      'ตรวจสอบ Node.js และ npm ผ่าน Terminal ได้',
      'เชื่อมต่อ MySQL ด้วย HeidiSQL และสร้าง database สำหรับฝึกได้',
      'เตรียม VS Code extensions และโปรเจกต์สำหรับ workshop ถัดไป',
    ],
    tags: ['Node.js', 'MySQL', 'Setup'],
  },
  {
    id: 'setup',
    order: 3,
    title: 'จัดโครงโปรเจกต์และตั้งค่า Environment',
    shortTitle: 'โครงโปรเจกต์',
    description:
      'จัดระเบียบไฟล์ Frontend และ Backend ตั้งค่า environment variables และทำความเข้าใจการเริ่ม server สำหรับพัฒนา',
    durationMinutes: 25,
    outcomes: [
      'สร้างโครงโปรเจกต์ที่แยก Frontend และ Backend ชัดเจน',
      'จัดการ configuration และ secrets ด้วย environment variables',
      'เริ่ม development server และตรวจสอบ health endpoint พื้นฐาน',
    ],
    tags: ['Express', 'Environment', 'Project Structure'],
  },
  {
    id: 'database',
    order: 4,
    title: 'ออกแบบตาราง users ด้วย MySQL',
    shortTitle: 'Database',
    description:
      'เรียนรู้ data types, constraints และ SQL queries ที่จำเป็นสำหรับเก็บข้อมูลผู้ใช้ โดยไม่จัดเก็บ plaintext password',
    durationMinutes: 35,
    outcomes: [
      'ออกแบบตาราง users พร้อม primary key และ unique constraints',
      'เขียน SQL เพื่อสร้าง ตรวจสอบ และQuery ข้อมูลผู้ใช้',
      'อธิบายเหตุผลที่ไม่ควรเก็บ plaintext password ใน database',
    ],
    tags: ['MySQL', 'SQL', 'Users'],
  },
  {
    id: 'backend',
    order: 5,
    title: 'สร้าง Register และ Login ด้วย Express',
    shortTitle: 'Backend',
    description:
      'สร้าง API สำหรับสมัครสมาชิกและเข้าสู่ระบบ แยก route, controller และ service พร้อม hash password ก่อนบันทึก',
    durationMinutes: 40,
    outcomes: [
      'สร้าง Register และ Login endpoints ด้วย Express',
      'ตรวจสอบ input และจัดการ error response ให้สม่ำเสมอ',
      'Hash password ด้วย bcrypt และเปรียบเทียบผลลัพธ์เมื่อ Login',
    ],
    tags: ['Node.js', 'Express', 'bcrypt'],
  },
  {
    id: 'api',
    order: 6,
    title: 'เชื่อมต่อ Frontend กับ REST API',
    shortTitle: 'API',
    description:
      'ทำความเข้าใจ HTTP methods, status codes และ JSON จากนั้นเรียก Backend API จาก Vue 3 พร้อมจัดการสถานะ loading และ error',
    durationMinutes: 35,
    outcomes: [
      'อธิบาย HTTP method, status code และรูปแบบ JSON ของ API',
      'เรียก REST API จาก Vue 3 ด้วย Axios',
      'จัดการ loading, success และ error states บนหน้าจอ',
    ],
    tags: ['REST API', 'Axios', 'JSON'],
  },
  {
    id: 'frontend',
    order: 7,
    title: 'สร้างหน้าจอ Authentication ด้วย Vue 3',
    shortTitle: 'Frontend',
    description:
      'ออกแบบหน้า Register และ Login ที่ใช้งานง่าย ตรวจสอบฟอร์มและเชื่อม authentication state เข้ากับ navigation',
    durationMinutes: 45,
    outcomes: [
      'สร้างฟอร์ม Register และ Login พร้อม client-side validation',
      'จัดการ authentication state และ navigation guard เบื้องต้น',
      'ออกแบบ feedback ที่เข้าใจง่ายทั้งผู้ใช้และ screen reader',
    ],
    tags: ['Vue 3', 'Forms', 'Authentication'],
  },
  {
    id: 'testing',
    order: 8,
    title: 'ทดสอบ Flow และ Validation',
    shortTitle: 'Testing',
    description:
      'ทดสอบเส้นทาง Register ถึง Login ด้วย manual test cases และ unit tests เพื่อค้นพบปัญหา validation และ error handling',
    durationMinutes: 30,
    outcomes: [
      'เขียน test cases สำหรับ happy path และ invalid inputs',
      'ทดสอบ API พื้นฐานด้วย Vitest และ Supertest',
      'ตรวจสอบว่า error messages ไม่เปิดเผยข้อมูลสำคัญ',
    ],
    tags: ['Testing', 'Validation', 'Vitest'],
  },
];

const advancedLessons: Omit<LessonSummary, 'level'>[] = [
  {
    id: 'security',
    order: 9,
    title: 'ความปลอดภัยและ JWT Middleware',
    shortTitle: 'Security',
    description:
      'เข้าใจ JWT lifecycle และออกแบบ authentication middleware พร้อมวิเคราะห์ security trade-offs ระหว่าง Session และ Token',
    durationMinutes: 40,
    outcomes: [
      'ออกแบบ JWT middleware สำหรับปกป้อง private routes',
      'เปรียบเทียบ security trade-offs ของ Session และ JWT',
      'จัดการ token expiration, rotation และการป้องกัน attacks พื้นฐาน',
    ],
    tags: ['JWT', 'Middleware', 'Security'],
  },
  {
    id: 'devops',
    order: 10,
    title: 'Docker และ CI/CD สำหรับ Authentication',
    shortTitle: 'DevOps',
    description:
      'แพ็กเกจ Authentication services ด้วย Docker และออกแบบ CI/CD pipeline พร้อมการจัดการ secrets และ environment แยกตามสถานการณ์',
    durationMinutes: 35,
    outcomes: [
      'สร้าง Docker image และ compose services สำหรับ Backend, Frontend และ MySQL',
      'ออกแบบ CI/CD pipeline ที่รัน tests และตรวจสอบ build ก่อน deploy',
      'แยก configuration และ secrets ตาม development, staging และ production',
    ],
    tags: ['Docker', 'CI/CD', 'Deployment'],
  },
];

export const certificateLessons: LessonSummary[] = coreLessons.map((lesson) => ({
  ...lesson,
  level: 'certificate',
}));

export const diplomaLessons: LessonSummary[] = [
  ...coreLessons.map((lesson) => ({
    ...lesson,
    level: 'diploma' as const,
  })),
  ...advancedLessons.map((lesson) => ({
    ...lesson,
    level: 'diploma' as const,
  })),
];

export function getLessonsForLevel(level: Level): LessonSummary[] {
  return level === 'diploma' ? diplomaLessons : certificateLessons;
}

export function getLessonSummary(level: Level, id: LessonId): LessonSummary | undefined {
  return getLessonsForLevel(level).find((lesson) => lesson.id === id);
}

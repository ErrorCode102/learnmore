import { defineSnippet } from './defineSnippet';

export const databaseSnippets = [
  defineSnippet(
    'database-users-schema',
    'database/schema.sql',
    'sql',
    `CREATE DATABASE IF NOT EXISTS authlab
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE authlab;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;`,
    [
      'สร้างฐานข้อมูล authlab หากยังไม่มี โดยไม่ลบข้อมูลเดิมในเครื่องฝึก',
      'กำหนด character set เป็น utf8mb4 เพื่อเก็บ emoji และตัวอักษรยูนิโคดได้ครบ',
      'เลือก collation สำหรับภาษาไทยและการเปรียบเทียบอีเมลแบบไม่แยกตัวพิมพ์ใหญ่เล็ก',
      'เลือกใช้งานฐานข้อมูล authlab สำหรับคำสั่งสร้างตารางถัดไป',
      'เว้นบรรทัดเพื่อแยกการเลือก database จากคำจำกัดความของตาราง',
      'สร้างตาราง users หากยังไม่มี เพื่อป้องกันการรันซ้ำทับโครงสร้างเดิม',
      'สร้าง id ตัวเลขแบบไม่ติดลบและเพิ่มค่าเองเมื่อมีแถวใหม่',
      'เก็บ email เป็นข้อความยาวสูงสุด 255 ตัวและห้ามเป็นค่าว่าง',
      'เก็บเฉพาะ password hash จาก bcrypt ห้ามเก็บ plaintext password',
      'บันทึกเวลาสร้างแถวโดยอัตโนมัติเมื่อ INSERT ข้อมูล',
      'อัปเดตเวลาล่าสุดโดยอัตโนมัติเมื่อแถวถูกแก้ไข',
      'กำหนด id เป็น primary key เพื่อระบุผู้ใช้หนึ่งรายโดยไม่ซ้ำ',
      'เพิ่ม unique constraint ให้ email ซ้ำกันไม่ได้แม้จะส่ง request พร้อมกัน',
      'เลือก InnoDB เพื่อรองรับ transaction และ foreign key ในส่วนขยาย',
      'รับรอง character set ของตารางให้ตรงกับ database แม้เซิร์ฟเวอร์ตั้งค่าเริ่มต้นอื่น',
      'กำหนด collation ของตารางให้การค้นหาและ unique check ใช้งานแบบเดียวกัน',
    ],
    'รันครั้งหนึ่งใน HeidiSQL หรือ mysql client ก่อนเริ่ม Backend',
  ),
  defineSnippet(
    'database-parameterized-select',
    'auth-backend/src/db/parameterizedQuery.js',
    'javascript',
    `const email = 'student@example.com';

const [rows] = await pool.execute(
  'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
  [email],
);

if (rows.length === 0) {
  throw new Error('USER_NOT_FOUND');
}`,
    [
      'กำหนดค่าอีเมลจาก input ของผู้ใช้เป็นข้อมูล ไม่ใช่ส่วนหนึ่งของ SQL string',
      'เปิด connection pool เพื่อส่งคำสั่งแบบ asynchronous ไปยัง MySQL',
      'เขียน SQL ด้วย placeholder ? แทนค่าที่เปลี่ยนได้เพื่อแยกโค้ดกับข้อมูล',
      'ส่ง email เป็น parameter แถวที่สอง การแยกค่าไว้อ่านเองทำให้ MySQL ไม่ตีความข้อมูลเป็น SQL',
      'อ่านผลลัพธ์แบบ array destructuring โดย rows คือแถวที่ query พบ',
      'ตรวจสอบกรณีไม่พบผู้ใช้ก่อนไม่ให้ controller เข้าถึง rows[0] โดยไม่มีข้อมูล',
      'โยน error ที่ควบคุมเองเพื่อให้ชั้น controller เลือก response ที่เหมาะสม',
    ],
    'ตัวอย่าง query แบบ parameterized ที่ใช้ซ้ำใน Register, Login และ /me',
  ),
  defineSnippet(
    'database-schema-verification',
    'terminal/verify-schema.sql',
    'sql',
    `USE authlab;
SHOW CREATE TABLE users;
SELECT COUNT(*) AS user_count FROM users;`,
    [
      'เลือก database authlab เพื่อให้คำสั่งตรวจสอบใช้ตารางที่สอน',
      'แสดงคำสั่งสร้างตารางจริงเพื่อตรวจ primary key, unique, charset และ collation',
      'นับจำนวนผู้ใช้ทั้งหมดเพื่อยืนยันว่าตารางว่างและพร้อมใช้งานก่อนทดสอบ Register',
    ],
    'ผลลัพธ์ที่คาดหวัง: มี PK/UNIQUE, utf8mb4 และ user_count = 0',
  ),
];

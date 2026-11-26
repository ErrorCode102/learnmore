import { defineSnippet } from './defineSnippet';

export const installationSnippets = [
  defineSnippet(
    'installation-windows-tool-check',
    'terminal/windows-tool-check.txt',
    'text',
    `node --version
npm --version
where node
mysql --version
git --version
where git
code --version`,
    [
      'ตรวจสอบเวอร์ชัน Node.js โดยควรใช้ LTS ที่แนะนำปัจจุบันและต้องไม่ต่ำกว่า reference floor 18',
      'ตรวจสอบว่า npm ถูกติดตั้งมาพร้อม Node.js และสามารถเรียกใช้งานจาก Terminal ได้',
      'แสดงตำแหน่งไฟล์ executable ของ Node.js เพื่อยืนยันว่าใช้ตัวติดตั้งไม่ใช่โปรแกรมอื่น',
      'ตรวจสอบว่า MySQL หรือ MariaDB client มีคำสั่ง mysql ใน PATH ของ Windows',
      'ตรวจสอบการติดตั้ง Git ซึ่งใช้สำหรับควบคุมเวอร์ชันและClone โปรเจกต์',
      'แสดงตำแหน่ง Git executable เพื่อยืนยันว่า Terminal เรียกตัวติดตั้งที่ต้องการ',
      'ตรวจสอบว่า VS Code CLI ทำงานได้ เพื่อเปิดโปรเจกต์จาก Terminal ได้',
    ],
    'เปิด Windows Terminal แล้วพิมพ์ทีละคำสั่ง บันทึกผลลัพธ์ที่ได้',
  ),
  defineSnippet(
    'installation-mysql-verification',
    'terminal/mysql-verification.sql',
    'sql',
    `SELECT VERSION() AS server_version;
SHOW VARIABLES LIKE 'character_set_server';
SHOW VARIABLES LIKE 'collation_server';`,
    [
      ' query เวอร์ชันเซิร์ฟเวอร์เพื่อแยกว่าใช้ MySQL หรือ MariaDB และเลือกคำสั่งที่เหมาะ',
      'แสดง character set เริ่มต้นของเซิร์ฟเวอร์เพื่อเตรียมตรวจสอบการรองรับ utf8mb4',
      'แสดง collation เริ่มต้นเพื่อยืนยันว่าการเรียงตัวอักษรภาษาไทยใช้งานได้ตามการตั้งค่า',
    ],
    'คาดว่ามีเลขเวอร์ชันและค่า character set/collation ของเซิร์ฟเวอร์',
  ),
  defineSnippet(
    'installation-mysql-login',
    'terminal/mysql-login.txt',
    'text',
    `mysql -u root -p
EXIT;`,
    [
      'เชื่อมต่อ MySQL ในฐานะ root แล้วพิมพ์รหัสผ่านที่ตั้งระหว่างติดตั้งโดยไม่ใส่รหัสในคำสั่ง',
      'ออกจาก mysql client หลังตรวจสอบเสร็จเพื่อกลับมาใช้ Windows Terminal ตามปกติ',
    ],
    'พิมพ์ได้ทั้งใน Terminal หรือ SQL tab ของ HeidiSQL',
  ),
];

import type { Level } from '../types/course';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const quizzes: Record<Level, QuizQuestion[]> = {
  certificate: [
    {
      id: 'cert-http-semantics',
      prompt: 'คำขอ GET /api/users ที่อ่านข้อมูลผู้ใช้สำเร็จโดยไม่สร้างข้อมูลใหม่ ควรตอบ HTTP status code ใด?',
      options: ['200 OK', '201 Created', '204 No Content', '404 Not Found'],
      answer: 0,
      explanation:
        'GET ใช้เพื่ออ่านข้อมูลโดยไม่ควรเปลี่ยน state ของ server และคำขอที่สำเร็จสามารถตอบ 200 OK ส่วน 201 Created ใช้เมื่อสร้างทรัพยากรใหม่สำเร็จ',
    },
    {
      id: 'cert-sql-safety',
      prompt: 'วิธีใดป้องกัน SQL injection และไม่อนุญาตให้อีเมลผู้ใช้ซ้ำในตาราง users พร้อมกัน?',
      options: [
        'ต่อ string จาก input เข้า SQL และตรวจอีเมลเฉพาะที่ Frontend',
        'ใช้ parameterized query และกำหนด UNIQUE constraint บนคอลัมน์ email',
        'เข้ารหัสอีเมลด้วย Base64 แล้วนำไปใส่ใน SQL โดยไม่ตรวจซ้ำ',
        'เก็บอีเมลทั้งหมดใน plaintext และลบข้อมูลซ้ำหลังจากบันทึก',
      ],
      answer: 1,
      explanation:
        'Parameterized query แยกค่าจากคำสั่ง SQL จึงป้องกัน SQL injection ส่วน UNIQUE constraint บังคับที่ระดับ database ให้อีเมลไม่ซ้ำแม้การตรวจจาก Frontend ถูกข้าม',
    },
    {
      id: 'cert-bcrypt-password',
      prompt: 'การเก็บและตรวจสอบ password สำหรับ Register และ Login ด้วย bcrypt ควรทำอย่างไร?',
      options: [
        'Hash password ด้วย salt ก่อนบันทึก และใช้ bcrypt.compare เมื่อ Login',
        'เข้ารหัส password ด้วย Base64 แล้วเก็บไว้เป็น plaintext',
        'เก็บ password เดิมเพื่อให้ Admin เปิดดูได้เมื่อผู้ใช้ลืม',
        'ใช้ MD5 โดยไม่มี salt เพราะสร้าง hash ได้เร็วและสั้น',
      ],
      answer: 0,
      explanation:
        'bcrypt.hash สร้าง hash พร้อม salt และ bcrypt.compare ตรวจ password กับ hash ได้โดยไม่ต้องกู้คืนข้อความเดิม จึงห้ามเก็บ plaintext password',
    },
    {
      id: 'cert-server-validation',
      prompt: 'ทำไม Backend ต้องตรวจสอบข้อมูล (validation) อีกครั้ง ทั้งที่ Frontend ตรวจฟอร์มแล้ว?',
      options: [
        'เพื่อให้ Frontend ไม่ต้องแสดงข้อความ error ให้ผู้ใช้',
        'เพราะข้อมูลจาก Frontend เป็นข้อมูลที่เชื่อถือได้เสมอ',
        'เพราะ client-side validation สามารถถูกข้ามและ server ต้องเป็นแนวรบสุดท้าย',
        'เพื่อเลี่ยงการกำหนด constraint ใน database',
      ],
      answer: 2,
      explanation:
        'ผู้ใช้สามารถข้าม Frontend หรือเรียก API โดยตรงได้ ดังนั้น server ต้องตรวจ input และ business rules ก่อนประมวลผล พร้อมคืน error ที่ปลอดภัยเมื่อข้อมูลไม่ถูกต้อง',
    },
    {
      id: 'cert-flow-testing',
      prompt: 'แบบฝึกหัดใดช่วยค้นหา bug ใน flow Register → Login ได้ดีที่สุดสำหรับผู้เริ่มต้น?',
      options: [
        'ทดสอบเฉพาะกรณีที่กรอกข้อมูลถูกต้องและสมัครสำเร็จครั้งเดียว',
        'ทดสอบด้วยบัญชี production เพื่อให้ผลลัพธ์เหมือนผู้ใช้จริง',
        'ทดสอบ happy path และ invalid inputs รวมถึง error handling ของ API',
        'ข้ามการทดสอบ เพราะ validation ที่ Frontend รองรับทุกกรณีแล้ว',
      ],
      answer: 2,
      explanation:
        'Manual test cases ควรครอบคลุมทั้ง happy path และ invalid inputs เช่น อีเมลซ้ำ รหัสผ่านสั้น หรือข้อมูลไม่ครบ เพื่อยืนยันว่า flow และ error handling ทำงานตามคาด',
    },
  ],
  diploma: [
    {
      id: 'dip-http-semantics',
      prompt: 'คำขอ DELETE /api/users/:id ลบผู้ใช้สำเร็จและ server ไม่ส่ง response body ควรใช้ HTTP status code ใด?',
      options: ['201 Created', '200 OK', '204 No Content', '401 Unauthorized'],
      answer: 2,
      explanation:
        'DELETE ใช้เพื่อลบทรัพยากร และ 204 No Content เหมาะกับคำขอที่สำเร็จโดยไม่ต้องส่ง body กลับ ส่วน 201 Created บ่งชี้การสร้างทรัพยากรใหม่',
    },
    {
      id: 'dip-sql-safety',
      prompt: 'การ query ผู้ใช้จากอีเมลที่ผู้ใช้กรอกอย่างปลอดภัยและป้องกันข้อมูลซ้ำควรออกแบบอย่างไร?',
      options: [
        'นำ email มาต่อใน SQL string และปล่อยให้ database จัดการ error เอง',
        'ใช้ parameterized query พร้อม UNIQUE constraint และจัดการ duplicate error',
        'เข้ารหัส SQL string ทั้งหมดด้วย Base64 ก่อนส่งไปยัง MySQL',
        'ใช้ SELECT * โดยไม่ตรวจ email เพื่อลดการทำงานของ server',
      ],
      answer: 1,
      explanation:
        'Parameterized query ป้องกัน SQL injection ส่วน UNIQUE constraint ป้องกันอีเมลซ้ำที่ระดับข้อมูล การจัดการ duplicate error อย่างชัดเจนช่วยให้ API ตอบกลับได้สม่ำเสมอ',
    },
    {
      id: 'dip-jwt-middleware',
      prompt: 'JWT middleware ควรตรวจสอบอะไรก่อนอนุญาตให้ request เข้า protected route?',
      options: [
        'ถอดรหัส JWT เพียงเพื่ออ่าน payload โดยไม่ตรวจ signature หรือ expiration',
        'ตรวจ signature, expiration และสิทธิ์ จาก validated claims ก่อนส่งต่อไป controller',
        'เชื่อว่า JWT ที่มี payload ผู้ใช้มาถึงแล้วมาจาก client ที่น่าเชื่อถือ',
        'เก็บ JWT secret ไว้ใน repository เพื่อให้ทุก environment ใช้คีย์เดียวกัน',
      ],
      answer: 1,
      explanation:
        'JWT middleware ต้องตรวจ signature ด้วย secret ที่ปลอดภัยและตรวจ expiration พร้อม claims ที่จำเป็นก่อนใช้ข้อมูลผู้ใช้ การถอดรหัสอย่างเดียวไม่ยืนยันว่า token ถูกต้องหรือยังไม่หมดอายุ',
    },
    {
      id: 'dip-server-validation',
      prompt: 'เมื่อ API รับ JSON ที่รูปแบบถูกต้องแต่ email ว่างหรือ password ไม่ผ่าน policy ควรทำอย่างไร?',
      options: [
        'ยอมรับข้อมูลเพราะ JSON parse สำเร็จและบันทึกผู้ใช้ตามนั้น',
        'ปล่อยให้ database ตัดตัวอักษรและแก้ค่าเองโดยไม่แจ้งผู้ใช้',
        'ตรวจ validation ที่ server และคืน error เช่น 422 โดยไม่เปิดเผยรายละเอียดภายใน',
        'เปลี่ยน error เป็น success เพื่อไม่ให้ client แสดง popup',
      ],
      answer: 2,
      explanation:
        'การ parse JSON ไม่ได้พิสูจน์ว่าข้อมูลผ่าน business rules server ต้องตรวจสอบ email, password และ fields ที่จำเป็น แล้วคืน error response ที่มีประโยชน์แต่ไม่รั่วข้อมูลภายใน',
    },
    {
      id: 'dip-devops-security',
      prompt: 'แบบ Docker และ CI/CD ที่ปลอดภัยสำหรับ Authentication ควรกำหนด pipeline อย่างไร?',
      options: [
        'Commit secrets ไว้ใน Dockerfile เพื่อให้ image ใช้งานได้ทุก environment',
        'Deploy โดยตรงจากทุก commit โดยไม่รัน tests หรือตรวจสอบ build',
        'รัน tests และตรวจสอบ build ก่อน deploy โดยฉีด secrets จากการจัดการ secrets แยกตาม environment',
        'แยก secret แต่ log ค่าเต็มใน pipeline เพื่อให้ตรวจสอบปัญหาได้ง่าย',
      ],
      answer: 2,
      explanation:
        'CI/CD ควรรัน tests และตรวจสอบ build ก่อน deploy ส่วน secrets ต้องไม่ถูก commit หรือฝังใน Docker image และควรฉีดจากระบบจัดการ secrets แยกตาม environment โดยไม่ log ค่าจริง',
    },
  ],
};

import { defineSnippet } from './defineSnippet';

export const testingSnippets = [
  defineSnippet(
    'testing-install-vitest',
    'terminal/run-unit-tests.sh',
    'bash',
    `cd auth-backend
npm install --save-dev vitest
npx vitest run src/utils/passwordPolicy.test.js`,
    [
      'เข้าโฟลเดอร์ Backend เพราะ pure helper และ test อยู่ภายใต้ package นี้',
      'ติดตั้ง Vitest เป็น development dependency สำหรับรัน unit test แบบ standalone',
      'รันเฉพาะไฟล์ password policy test และคาดว่าผ่านทุกกรณีที่ประกาศไว้',
    ],
    'ผลลัพธ์ที่คาดหวัง: 1 test file passed และไม่มี error',
  ),
  defineSnippet(
    'testing-password-policy-unit',
    'auth-backend/src/utils/passwordPolicy.test.js',
    'javascript',
    `import { describe, expect, it } from 'vitest';
import { isPasswordStrongEnough } from './passwordPolicy.js';

describe('isPasswordStrongEnough', () => {
  it('accepts a password that meets every rule', () => {
    expect(isPasswordStrongEnough('StudyPass1!')).toBe(true);
  });

  it.each(['short1!', 'lowercase1!', 'NoNumbers!', 'NoSymbol1'])('rejects weak input %s', (password) => {
    expect(isPasswordStrongEnough(password)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isPasswordStrongEnough(undefined)).toBe(false);
  });
});`,
    [
      'นำเข้า describe, expect และ it จาก Vitest สำหรับประกาศ test suite',
      'นำเข้า pure function ที่ต้องการทดสอบโดยไม่ต้องต่อ MySQL หรือ Express',
      'เว้นบรรทัดก่อนเปิด suite',
      'เปิด suite ที่ตั้งชื่อตามฟังก์ชันเพื่อรายงานผลอ่านง่าย',
      'ประกาศ test สำหรับกรณีรหัสผ่านผ่านทุกกฎ',
      'ยืนยันว่า StudyPass1! มีความยาวและสี่กลุ่มอักขระครบ',
      'ปิด test case แรก',
      'เว้นบรรทัดเพื่อแยก positive case ออกจาก negative cases',
      'ประกาศ parameterized tests สำหรับ weak password หลายค่า',
      'ยืนยันว่าทุก weak password ถูกปฏิเสธเหมือนกัน',
      'ปิด parameterized test',
      'เว้นบรรทัดก่อน edge case ของ type',
      'ประกาศ test สำหรับ input ที่ไม่ใช่ string',
      'ยืนยันว่า undefined ไม่ทำให้ฟังก์ชัน throw และคืน false',
      'ปิด test case และ suite โดยปิด describe block',
    ],
    'ทดสอบ logic เพียว ๆ ทำให้เร็วและช่วยจับการเปลี่ยน policy ก่อน deploy',
  ),
  defineSnippet(
    'testing-api-matrix',
    'api/testing-matrix.http',
    'text',
    `@baseUrl = http://localhost:3000
@email = student-matrix@example.com
@password = StudyPass1!

### 1. Register สำเร็จ: คาดหวัง 201
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{"email":"{{email}}","password":"{{password}}"}

### 2. Duplicate user: คาดหวัง 409
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{"email":"{{email}}","password":"{{password}}"}

### 3. Weak password: คาดหวัง 422
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{"email":"weak@example.com","password":"123"}

### 4. Wrong password: คาดหวัง 401 และข้อความเดียวกัน
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{"email":"{{email}}","password":"WrongPass9!"}

### 5. Missing token: คาดหวัง 401
GET {{baseUrl}}/api/auth/me

### 6. Expired token: คาดหวัง 401
GET {{baseUrl}}/api/auth/me
Authorization: Bearer <นำ expired token จาก terminal/create-expired-token.sh>`,
    [
      'กำหนด baseUrl ของ Backend สำหรับ matrix ทั้งหมด',
      'กำหนด email ตัวอย่างสำหรับ Register และ Login',
      'กำหนด password ตัวอย่างที่ผ่าน policy เพื่อแยก error ออกจาก weak password',
      'เว้นบรรทัดก่อน test case แรก',
      'เปิด happy path Register และระบุสถานะ 201 ที่คาดหวัง',
      'กำหนด POST register ด้วย JSON content type',
      'เว้นบรรทัดก่อน request body',
      'ส่ง email/password จากตัวแปรเพื่อทดสอบผู้ใช้ใหม่',
      'เว้นบรรทัดระหว่าง test cases',
      'เปิด duplicate user case ที่คาดหวัง 409',
      'กำหนด POST register ซ้ำด้วย endpoint เดียวกัน',
      'กำหนด content type เป็น JSON เช่นเดิม',
      'เว้นบรรทัดก่อน body ของ duplicate case',
      'ส่ง payload เดียวกันเพื่อกระตุ้น unique constraint หรือ existing check',
      'เว้นบรรทัดก่อน weak password case',
      'เปิด weak password test ที่คาดหวัง 422',
      'กำหนด POST register สำหรับ input ที่ไม่ผ่าน policy',
      'กำหนด JSON content type ให้ body ถูก parse',
      'เว้นบรรทัดก่อน weak body',
      'ส่ง password สามตัวเพื่อให้ server validation ปฏิเสธ',
      'เว้นบรรทัดก่อน wrong password case',
      'เปิด wrong password test พร้อมสถานะ 401 และข้อความ generic',
      'กำหนด POST login สำหรับ email ที่มีอยู่จริง',
      'กำหนด JSON content type ของ Login',
      'เว้นบรรทัดก่อน request body',
      'ส่ง password ที่ผ่าน format แต่ไม่ตรงกับผู้ใช้',
      'เว้นบรรทัดก่อน missing token case',
      'เปิด protected request โดยไม่ส่ง Authorization',
      'กำหนด GET /me เพื่อคาดหวัง 401 จาก middleware',
      'เว้นบรรทัดก่อน expired token case',
      'เปิด protected request ด้วย token ที่หมดอายุแล้ว',
      'แนบ expired token จากคำสั่งทดสอบ โดยไม่เก็บ token จริงในไฟล์',
    ],
    'ล้าง student-matrix@example.com ก่อนรันซ้ำ หรือเปลี่ยน @email ให้ไม่ชน unique constraint',
  ),
  defineSnippet(
    'testing-create-expired-token',
    'terminal/create-expired-token.sh',
    'bash',
    `cd auth-backend
node --input-type=module -e "import 'dotenv/config'; import jwt from 'jsonwebtoken'; console.log(jwt.sign({ sub: '1' }, process.env.JWT_SECRET, { expiresIn: -1, issuer: 'authlab', audience: 'authlab-client' }));"`,
    [
      'เข้าโฟลเดอร์ Backend เพื่อโหลด dependency และ .env ของโปรเจกต์',
      'sign JWT จาก secret ใน env ด้วยอายุ -1 วินาที แล้วพิมพ์ token สำหรับ negative test',
    ],
    'ใช้เฉพาะ environment ทดสอบ; ห้าม log token ใน production หรือ commit ค่าที่ได้',
  ),
];

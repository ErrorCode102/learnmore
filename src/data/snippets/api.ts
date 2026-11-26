import { defineSnippet } from './defineSnippet';

export const apiSnippets = [
  defineSnippet(
    'api-thunder-client-requests',
    'api/authlab.http',
    'text',
    `@baseUrl = http://localhost:3000

### Register: คาดหวัง 201
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "StudyPass1!"
}

### Login: คาดหวัง 200
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "StudyPass1!"
}

### Me: คาดหวัง 200 เมื่อ token ถูกต้อง
GET {{baseUrl}}/api/auth/me
Authorization: Bearer <นำ token จาก response ของ Login>

### Me: คาดหวัง 401 เมื่อไม่มี token
GET {{baseUrl}}/api/auth/me`,
    [
      'กำหนดตัวแปร baseUrl เพื่อเปลี่ยนเครื่องเป้าหมายโดยไม่แก้ทุก request',
      'เว้นบรรทัดเพื่อแยก configuration ออกจาก request แรก',
      'เปิด separators และคำอธิบายผลที่คาดหวังของ Register',
      'กำหนด POST ไปยัง endpoint สมัครสมาชิกเต็มภายใต้ /api/auth',
      'บอก Thunder Client ให้อ่าน body เป็น JSON',
      'เว้นบรรทัดเพื่อแยก headers ออกจาก JSON body',
      'เปิด JSON object ของ Register',
      'ส่ง email ตัวอย่างที่ไม่ใช่ secret และใช้ได้สำหรับการฝึก',
      'ส่ง password ตัวอย่างที่ผ่าน policy แปดตัวและมีสี่กลุ่มอักขระ',
      'ปิด JSON body ของ Register',
      'เว้นบรรทัดเพื่อแยก Register ออกจาก Login',
      'เปิด separator ของ Login พร้อมสถานะ 200 ที่คาดหวัง',
      'กำหนด POST ไปยัง endpoint เข้าสู่ระบบ',
      'กำหนด content type เป็น JSON สำหรับ Login',
      'เว้นบรรทัดเพื่อแยก header ออกจาก body',
      'เปิด JSON object ของ Login',
      'ส่ง email เดียวกันกับผู้ใช้ที่ Register สำเร็จ',
      'ส่ง password เดิมเพื่อให้ bcrypt.compare ตรวจสอบได้',
      'ปิด JSON body ของ Login',
      'เว้นบรรทัดเพื่อแยก Login ออกจาก protected request',
      'เปิด separator ของ /me ที่ใช้ token จริง',
      'กำหนด GET /me โดยไม่ส่ง password หรือ user id อีกครั้ง',
      'แนบ Authorization header แบบ Bearer และแทน token จาก response',
      'เว้นบรรทัดเพื่อแยก positive case ออกจาก negative case',
      'เปิด separator ของ /me เมื่อไม่มี token',
      'ยิง GET /me โดยไม่แนบ header เพื่อคาดว่าจะได้ 401',
    ],
    'เปิดไฟล์ใน Thunder Client แล้วส่ง Request ทีละอันและตรวจ Status code',
  ),
  defineSnippet(
    'api-curl-smoke-test',
    'terminal/test-auth-api.sh',
    'bash',
    `BASE_URL=http://localhost:3000
EMAIL="student-$(date +%s)@example.com"
PASSWORD='StudyPass1!'

curl -i -X POST "$BASE_URL/api/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
curl -i -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"WrongPass9!\"}"
curl -i -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
TOKEN='<นำ access token จาก response ของ Login ที่สำเร็จ>'
curl -i "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -i "$BASE_URL/api/auth/me"`,
    [
      'กำหนด URL พื้นฐานของ Backend ที่รันจากบท Setup',
      'สร้าง email เฉพาะด้วย timestamp เพื่อทดสอบซ้ำโดยไม่ชน unique constraint',
      'เก็บ password ตัวอย่างในตัวแปร shell เพื่อไม่ต้องพิมพ์ซ้ำใน command',
      'เว้นบรรทัดเพื่อแยก configuration ออกจาก test cases',
      'Register ผู้ใช้ใหม่พร้อม -i เพื่อดู status code และ response headers',
      'Login ด้วยรหัสผ่านผิดเพื่อคาดหวัง 401 และข้อความ credential ที่ไม่เปิดเผยบัญชี',
      'Login ด้วยรหัสผ่านถูกเพื่อคาดหวัง 200 พร้อม token ใน data',
      'นำ token จาก response มาวางในตัวแปร โดยไม่มี token จริงใน repository',
      'เรียก /me ด้วย Bearer token เพื่อคาดหวังข้อมูลผู้ใช้โดยไม่มี password_hash',
      'เรียก /me โดยไม่มี header เพื่อคาดหวัง 401 จาก requireAuth',
    ],
    'รันใน Git Bash; บน PowerShell ใช้ curl.exe เพื่อไม่ให้ alias ขัดเจน',
  ),
  defineSnippet(
    'api-response-examples',
    'api/response-examples.json',
    'json',
    `{
  "register201": {
    "status": "success",
    "message": "สมัครสมาชิกสำเร็จ",
    "data": {
      "token": "<access token>",
      "user": { "id": 1, "email": "student@example.com", "created_at": "2026-01-01T00:00:00.000Z" }
    }
  },
  "validation422": {
    "status": "error",
    "message": "ข้อมูลที่กรอกไม่ถูกต้อง",
    "data": {
      "errors": [{ "field": "password", "message": "รหัสผ่านต้องมี 8–72 ตัว อักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ" }]
    }
  },
  "unauthorized401": {
    "status": "error",
    "message": "ต้องเข้าสู่ระบบก่อน",
    "data": null
  }
}`,
    [
      'เปิด object ตัวอย่างที่แยก response ตามสถานะเพื่อเทียบกับผลทดสอบ',
      'กำหนด key ของ Register ที่คาดว่าจะตอบ 201 Created',
      'เปิด response object ของ Register',
      'กำหนด status success เมื่อ resource ผู้ใช้ถูกสร้างสำเร็จ',
      'ส่ง message ภาษาไทยที่ Frontend นำไปแสดงเป็น feedback',
      'เปิด data object ที่เก็บผลลัพธ์หลัก',
      'ส่ง access token ในฟิลด์ token โดยตัวอย่างใช้ placeholder ไม่ใช่ token จริง',
      'ส่ง public user ที่มี id, email และ created_at เท่านั้น',
      'ปิด data object ของ Register',
      'ปิด response object ของ Register',
      'เว้นบรรทัดเพื่อแยก success response ออกจาก validation error',
      'กำหนด key ของ input ที่ไม่ผ่าน policy และคาดว่าจะตอบ 422',
      'เปิด response object ของ validation error',
      'กำหนด status error เพื่อให้ client แยกเส้นทาง success/error',
      'ส่ง message ทั่วไปสำหรับ input ที่กรอกไม่ถูกต้อง',
      'เปิด data object ซึ่งยังคงมี errors ที่แก้ไขได้',
      'เปิด errors array สำหรับ Frontend map กลับไปหาฟิลด์',
      'ระบุ field password และ message ที่อธิบาย policy เดียวกัน',
      'ปิด error item ใน array',
      'ปิด errors array',
      'ปิด data object ของ validation response',
      'ปิด validation response object',
      'เว้นบรรทัดเพื่อแยก validation ออกจาก authentication error',
      'กำหนด key ของ /me ที่ไม่มี token และคาดว่าจะตอบ 401',
      'เปิด response object ของ unauthorized case',
      'กำหนด status error สำหรับ request ที่ต้องเข้าสู่ระบบ',
      'ใช้ generic message เพื่อไม่เปิดเผยรายละเอียดของ token หรือสถานะ account',
      'กำหนด data เป็น null เมื่อไม่มีผลลัพธ์ที่ส่งกลับได้อย่างปลอดภัย',
      'ปิด unauthorized response object',
      'ปิด object ตัวอย่างทั้งหมด',
    ],
    'ทุก response จริงมี keys status, message, data เรียงลำดับเดียวกัน',
  ),
  defineSnippet(
    'api-devtools-network-checklist',
    'terminal/devtools-network-check.txt',
    'text',
    `เปิด Chrome DevTools > Network
กรอง Fetch/XHR แล้วรีเฟรชหน้า Login
ตรวจ Request URL เป็น /api/auth/login
ตรวจ Method เป็น POST
ตรวจ Request Payload มี email/password
ตรวจ Status Code เป็น 200 หรือ 401
ตรวจ Response มี status/message/data
ตรวจว่า Response ไม่มี password_hash
ตรวจ CORS เฉพาะเมื่อเรียก Backend โดยตรงไม่ผ่าน Vite proxy`,
    [
      'เปิด DevTools เพื่อดูข้อมูล request ที่ browser ส่งจริง',
      'กรอง Fetch/XHR และรีเฟรชเพื่อไม่ให้ request ไฟล์ static กดดัน',
      'ยืนยัน path ของ Login ตรงกับ route ที่กำหนดใน Express',
      'ตรวจ HTTP method ว่าเป็น POST ไม่ใช่ GET โดยไม่ตั้งใจ',
      'ดู payload ที่ส่งไปตรวจว่ามีเฉพาะ email และ password ที่ฟอร์มต้องการ',
      'อ่าน status code เพื่อแยก success 200, validation 422 และ credential 401',
      'ตรวจ response envelope ว่ามี status, message และ data ครบ',
      'ยืนยันว่า server ไม่รั่ว password hash ผ่าน Network response',
      'ตรวจ CORS เมื่อเรียกข้าม origin โดยตรง เพราะ Vite proxy ทำให้ request เป็น same-origin',
    ],
    'การตรวจ Network ช่วยยืนยันว่า Frontend, proxy และ Backend ใช้ contract เดียวกัน',
  ),
];

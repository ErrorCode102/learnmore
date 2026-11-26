import { defineSnippet } from './defineSnippet';

export const setupSnippets = [
  defineSnippet(
    'setup-create-project',
    'terminal/create-authlab.sh',
    'bash',
    `mkdir -p auth-lab && cd auth-lab
mkdir -p auth-backend/src/{controllers,db,middleware,models,routes,services,utils}
cd auth-backend
npm init -y
npm pkg set type=module "scripts.start=node src/server.js" "scripts.dev=nodemon src/server.js"
npm install express@^5.1.0 mysql2 bcryptjs jsonwebtoken cors dotenv express-validator helmet express-rate-limit cookie-parser
npm install --save-dev nodemon
cd ..
npm create vite@latest auth-frontend -- --template vue-ts
cd auth-frontend
npm install
npm install axios pinia
mkdir -p src/{api,router,stores,views}
npm install --save-dev tailwindcss @tailwindcss/vite
npm pkg set "scripts.dev=vite --host 0.0.0.0"
code .`,
    [
      'สร้างโฟลเดอร์ auth-lab แล้วเข้าไปทำงานเพื่อให้ Backend และ Frontend อยู่ใต้ root เดียวกัน',
      'สร้างโฟลเดอร์ย่อยของ Backend แยก controller, database, middleware, model, route, service และ utility',
      'เข้าโฟลเดอร์ Backend เพื่อติดตั้ง dependency และแก้ไข package.json ของส่วนนี้',
      'สร้าง package.json เริ่มต้นพร้อม metadata ขั้นต่ำสำหรับ Node project',
      'เปิดใช้ ESM และกำหนดคำสั่ง start/dev โดย dev ใช้ nodemon รีสตาร์ตเมื่อไฟล์เปลี่ยน',
      'ติดตั้ง library สำหรับ HTTP, MySQL, hash, JWT, CORS, env, validation, security header, rate limit และ cookie parser',
      'ติดตั้ง nodemon เป็น development dependency เพื่อไม่รวมใน production runtime โดยไม่จำเป็น',
      'กลับสู่ root ของ auth-lab ก่อนสร้าง Frontend เพื่อไม่สร้างซ้อนอยู่ใน Backend',
      'สร้าง Vue 3 project แบบ TypeScript ด้วย Vite ตามชื่อ auth-frontend ตรงกับ workshop',
      'เข้าโฟลเดอร์ Frontend เพื่อติดตั้ง dependency ที่ Vite scaffold กำหนด',
      'ติดตั้ง dependency จาก package.json ที่ Vite สร้างให้ก่อนเรียกใช้งาน Vue',
      'เพิ่ม Axios สำหรับเรียก REST API และ Pinia สำหรับเก็บ authentication state',
      'สร้างโฟลเดอร์ api, router, stores และ views ให้ตรงกับไฟล์ที่บท Frontend จะสอน',
      'ติดตั้ง Tailwind CSS และ Vite plugin เป็น development dependencies สำหรับ utility classes ในฟอร์ม',
      'เปิด Vite dev server ให้รับการเชื่อมต่อจากเครื่องอื่นในเครือข่ายฝึกได้',
      'เปิด root ทั้งหมดใน VS Code เพื่อแก้ไขไฟล์ทั้งสองส่วนในหน้าต่างเดียว',
    ],
    'เลือก Git Bash ใน Windows Terminal แล้วรันทีละคำสั่ง; brace expansion ไม่ทำงานใน PowerShell และผลลัพธ์ควรสร้าง auth-backend/auth-frontend',
  ),
  defineSnippet(
    'setup-backend-package',
    'auth-backend/package.json',
    'json',
    `{
  "name": "auth-backend",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^5.1.0",
    "express-rate-limit": "^7.5.0",
    "express-validator": "^7.2.0",
    "helmet": "^8.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.14.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}`,
    [
      'เปิด object ของ package.json ซึ่งเป็น metadata และ configuration หลักของ Backend',
      'ตั้งชื่อ package เป็น auth-backend เพื่อแยกชื่อจาก Frontend ชัดเจน',
      'ป้องกันไม่ให้ package นี้ถูก publish ไปยัง npm registry โดยไม่ตั้งใจ',
      'กำหนด type module ทำให้ไฟล์ .js ใช้ import/export แบบ ESM ได้',
      'เปิดกลุ่ม scripts สำหรับคำสั่งที่เรียกผ่าน npm',
      'กำหนด start ให้ production ใช้ Node โดยตรงไม่พึ่ง nodemon',
      'กำหนด dev ให้ nodemon เฝ้าดูไฟล์และรีสตาร์ต server ระหว่างพัฒนา',
      'ปิดกลุ่ม scripts และเปิดกลุ่ม runtime dependencies',
      'เปิด object ของ dependency ที่โปรแกรมต้องมีทั้งตอนพัฒนาและ production',
      'ระบุ bcryptjs สำหรับสร้างและเปรียบเทียบ password hash',
      'ระบุ cookie-parser สำหรับอ่าน HttpOnly refresh cookie ในบท Security ระดับปวส.',
      'ระบุ cors สำหรับควบคุม origin ที่อนุญาตให้เรียก API ข้าม port',
      'ระบุ dotenv สำหรับอ่านค่าจากไฟล์ .env ในเครื่องพัฒนา',
      'ระบุ Express เวอร์ชัน 5 สำหรับ routing, middleware และ error handling',
      'ระบุ express-rate-limit สำหรับจำกัดจำนวน request ในช่วงเวลาหนึ่ง',
      'ระบุ express-validator สำหรับตรวจสอบ input บน server',
      'ระบุ helmet เพื่อเพิ่ม HTTP security headers ที่เหมาะสม',
      'ระบุ jsonwebtoken สำหรับ sign และ verify access token',
      'ระบุ mysql2 สำหรับเชื่อมต่อ MySQL ด้วย promise API',
      'ปิด runtime dependencies และเปิด development dependencies',
      'เปิด object ของ dependency ที่ใช้เฉพาะระหว่างพัฒนา',
      'ระบุ nodemon เวอร์ชันที่ใช้เฝ้าดูซ้ำและรีสตาร์ต process',
      'ปิด object ของ development dependencies',
      'ปิด package.json ให้ JSON ถูกต้องและอ่านได้',
    ],
    'ไฟล์นี้สรุป dependency ที่ติดตั้งไว้แล้วและสคริปต์ที่ใช้ตลอดโปรเจกต์',
  ),
  defineSnippet(
    'setup-backend-env',
    'auth-backend/.env',
    'text',
    `PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=authlab
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=
JWT_EXPIRES_IN=15m`,
    [
      'กำหนด port ของ Backend เพื่อให้ Frontend proxy และ curl เรียกตัวเดียวกัน',
      'ชี้ไปยัง MySQL บนเครื่อง localhost สำหรับ development',
      'กำหนด port มาตรฐานของ MySQL client ให้ตรงกับการติดตั้ง',
      'กำหนดชื่อผู้ใช้ MySQL; ใน production ควรใช้ account ที่มีสิทธิ์จำกัดเฉพาะ authlab',
      'เว้นค่าเพื่อเติมรหัสผ่าน MySQL ของเครื่องเอง โดยไฟล์นี้ไม่เก็บ secret จริง',
      'กำหนดชื่อ database เป็น authlab ให้ตรงกับ schema ในบท Database',
      'อนุญาตเฉพาะ origin ของ Vite dev server ให้เรียก API ข้าม port',
      'เว้น JWT secret เพื่อสร้างค่าสุ่ม locally และห้าม commit ค่าจริงลง repository',
      'กำหนดอายุ access token 15 นาทีเพื่อลดความเสียหายหาก token รั่วไหล',
    ],
    'คัดลอกเป็น .env แล้วเติมค่าของเครื่อง; อ่านโค้ดตัวอย่างโดยไม่มี secret จริง',
  ),
  defineSnippet(
    'setup-gitignore',
    '.gitignore',
    'text',
    `node_modules/
.env
dist/
coverage/
*.log`,
    [
      'ไม่ติดตาม node_modules เพราะสามารถติดตั้งใหม่จาก lockfile ได้',
      'ไม่ติดตาม .env ซึ่งอาจมีรหัสผ่าน database และ JWT secret จริง',
      'ไม่ติดตาม dist เพราะเป็นไฟล์ build ที่สร้างจาก source ได้',
      'ไม่ติดตามรายงาน coverage ที่สร้างจากการทดสอบ',
      'ไม่ติดตาม log file ที่อาจมีข้อมูลผู้ใช้หรือ path ของเครื่อง',
    ],
    'สร้างที่ root auth-lab และตรวจสอบด้วย git status ก่อน commit แต่ละครั้ง',
  ),
  defineSnippet(
    'setup-app',
    'auth-backend/src/app.js',
    'javascript',
    `import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '16kb' }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API พร้อมใช้งาน', data: { service: 'authlab' } });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'ไม่พบ endpoint ที่ร้องขอ', data: null });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', data: null });
});

export default app;`,
    [
      'โหลด .env ก่อนอ่าน environment variables ในโมดูลอื่น',
      'นำเข้า Express เพื่อสร้าง application instance',
      'นำเข้า helmet เพื่อตั้ง security headers เช่น X-Content-Type-Options',
      'นำเข้า cors เพื่อจัดการการเรียก API จาก origin อื่นอย่างควบคุม',
      'นำเข้าตัวสร้าง rate limiter จาก express-rate-limit',
      'เว้นบรรทัดแยก dependency ออกจากการสร้าง app',
      'สร้าง Express app โดยยังไม่เปิด network listener ทันที',
      'อ่าน origin ที่อนุญาตจาก env พร้อม fallback ของ dev เท่านั้น',
      'เว้นบรรทัดแยก configuration จาก middleware ที่ใช้งานจริง',
      'เพิ่ม helmet ให้ทุก response ก่อน route อื่น ๆ',
      'เปิด CORS เฉพาะ origin ที่กำหนดเพื่อไม่ยอมรับเว็บไซต์ใดก็ได้',
      'อ่าน JSON body โดยจำกัดขนาด 16kb เพื่อลดภาระและการโจมตี payload ร้อน',
      'ติดตั้ง rate limiter ที่เส้นทาง /api สำหรับ request ทั้งหมด',
      'ตั้งหน้าต่างนับ 15 นาทีเพื่อควบคุมอัตราระยะยาว',
      'จำกัดแต่ละ IP ที่ 100 request ต่อหน้าต่างในตัวอย่าง development',
      'ส่งข้อมูล rate limit ผ่านมาตรฐาน RateLimit headers เพื่อให้ client ตรวจสอบได้',
      'ปิด headers แบบเก่า X-RateLimit เพื่อไม่ส่งข้อมูลซ้ำ',
      'ปิด rateLimit options และลงทะเบียน middleware ใต้ /api',
      'เว้นบรรทัดแยก middleware กุญแจจาก health endpoint',
      'สร้าง GET health endpoint ที่ไม่ต้อง authentication เพื่อตรวจ process',
      'ตอบ JSON ด้วย response shape {status,message,data} เหมือนทุก endpoint',
      'ปิด callback ของ health endpoint',
      'เว้นบรรทัดแยก route ที่รู้จักออกจาก fallback',
      'จับ request ที่ไม่ตรง route ใดและเตรียมตอบ 404 ด้วย shape เดียวกัน',
      'ตอบ 404 พร้อม status error และข้อความที่เปิดเผย endpoint ที่ร้องขอเท่านั้น',
      'ปิด callback ของ fallback route',
      'เว้นบรรทัดแยก routing ออกจากการจัดการ error',
      'ประกาศ Express error handler สี่อาร์กิวเมนต์ตามสัญญาของ middleware',
      'บันทึก error ฝั่ง server เพื่อช่วย debug โดยไม่ส่ง stack ไปหา client',
      'ตอบ 500 ด้วยข้อความทั่วไปเพื่อไม่เปิดเผยรายละเอียดภายใน',
      'ปิด error handler',
      'เว้นบรรทัดก่อน export app',
      'ส่ง app instance ให้ server.js ใช้เปิด listener และจัดการ shutdown',
    ],
    'app นี้ยังไม่ import ไฟล์บทถัดไป จึงเริ่ม npm run dev และ GET /api/health ได้ทันที; บท Backend จะเพิ่ม authRoutes',
  ),
  defineSnippet(
    'setup-server',
    'auth-backend/src/server.js',
    'javascript',
    `import app from './app.js';
import pool from './db/pool.js';

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.log('AuthLab API ทำงานที่ http://localhost:' + port);
});

async function shutdown() {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);`,
    [
      'นำเข้า Express app ที่มีการกำหนด middleware และ routes ครบแล้ว',
      'นำเข้า MySQL pool เพื่อปิด connection อย่างเรียบร้อยเมื่อ process หยุด',
      'เว้นบรรทัดแยก dependency ออกจากการเริ่ม server',
      'อ่าน port จาก env และแปลงเป็น number พร้อมค่า dev 3000',
      'เปิด HTTP listener พร้อม callback ที่ทำงานเมื่อพร้อมรับ request',
      'แสดง log พร้อม port จริงเมื่อ server เริ่มทำงาน',
      'ปิด app.listen callback',
      'เว้นบรรทัดแยกการเริ่ม server ออกจาก lifecycle',
      'ประกาศฟังก์ชัน asynchronous สำหรับหยุด server และค้าง connection',
      'หยุดรับ connection ใหม่ก่อนปิด pool ของ MySQL',
      'รอให้ pool ปิด connection ที่เหลืออย่างเรียบร้อย',
      'ออกด้วยสถานะปกติหลังปิดทรัพยากรเรียบร้อย',
      'ปิดฟังก์ชัน shutdown',
      'เว้นบรรทัดแยกฟังก์ชัน shutdown ออกจาก signal handlers',
      'เชื่อม SIGINT จาก Ctrl+C ให้เรียก shutdown แทนการฆ่า process ทันที',
      'เชื่อม SIGTERM จาก Docker หรือ orchestrator ให้ shutdown เช่นเดียวกัน',
    ],
    'กด Ctrl+C แล้ว process ควรออกโดยไม่มี EADDRINUSE เมื่อเริ่มใหม่',
  ),
  defineSnippet(
    'setup-db-pool',
    'auth-backend/src/db/pool.js',
    'javascript',
    `import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'authlab',
  connectionLimit: 10,
  charset: 'UTF8MB4_GENERAL_CI',
});

export default pool;`,
    [
      'โหลด .env ก่อนสร้าง pool เพื่อให้ค่าการเชื่อมต่อจาก environment พร้อมใช้งาน',
      'นำเข้า mysql2/promise เพื่อใช้ API แบบ async ใน model และ shutdown',
      'เว้นบรรทัดแยก dependency ออกจากการสร้าง pool',
      'สร้าง pool แชร์ connection โดยยังไม่เปิด connection จนมี query แรก',
      'อ่าน host จาก env และใช้ localhost สำหรับ development',
      'แปลง port เป็น number พร้อมค่าเริ่มต้น 3306',
      'อ่านชื่อผู้ใช้ MySQL จาก env โดยไม่ hardcode credential',
      'อ่านรหัสผ่าน MySQL จาก env โดยไม่เปิดเผยใน source',
      'เลือก database authlab ให้ตรงกับ schema ที่จะสร้าง',
      'จำกัด pool ที่ 10 connections เพื่อควบคุมภาระของ MySQL',
      'กำหนด charset utf8mb4 เพื่อรองรับข้อมูลภาษาไทย',
      'ปิด configuration ของ pool',
      'เว้นบรรทัดก่อนส่งออก pool',
      'ส่ง pool instance ให้ server.js และ model ในบทถัดไปใช้งาน',
    ],
    'health endpoint ไม่ query database จึงเริ่ม server ได้ дажеเมื่อ MySQL ยังไม่พร้อม; บท Backend จะอธิบาย pool เพิ่มเติม',
  ),
  defineSnippet(
    'setup-vite-proxy',
    'auth-frontend/vite.config.ts',
    'javascript',
    `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});`,
    [
      'นำเข้าตัวช่วยสร้าง Vite configuration ที่มี type assistance',
      'นำเข้า Vue plugin เพื่อรองรับ .vue single-file components',
      'นำเข้า Tailwind Vite plugin เพื่อประมวลผล utility classes ในโปรเจกต์',
      'เว้นบรรทัดแยก imports ออกจากการส่งออก config',
      'ส่งออก config object เป็น default สำหรับ Vite',
      'เปิด array plugins และลงทะเบียน Vue กับ Tailwind ตามลำดับ',
      'เปิดการตั้งค่า dev server ของ Vite',
      'กำหนด port 5173 ให้ตรงกับ CLIENT_ORIGIN ใน Backend',
      'เปิด proxy rules สำหรับ path ที่ขึ้นต้นด้วย /api',
      'กำหนด rule สำหรับ request ที่ path ขึ้นต้นด้วย /api',
      'ส่ง request /api ไปยัง Express ที่ port 3000 แทนการเรียก origin อื่นใน browser',
      'เปลี่ยน Origin header ของ request ให้ proxy เหมาะกับ backend ที่ได้รับ',
      'ปิด proxy rule object ของ /api',
      'ปิด object ของ proxy configuration',
      'ปิด server configuration',
      'ปิด object ที่ export ออกจากไฟล์ config',
    ],
    'restart Vite หลังแก้ไข; browser เรียก /api ได้โดยไม่ชน CORS เพราะเป็น same-origin proxy',
  ),
  defineSnippet(
    'setup-frontend-style',
    'auth-frontend/src/style.css',
    'text',
    `@import "tailwindcss";

:root {
  font-family: system-ui, sans-serif;
  color: #0f172a;
  background: #f8fafc;
}
body {
  margin: 0;
  min-width: 320px;
}`,
    [
      'นำเข้า Tailwind CSS เพื่อสร้าง utility classes ที่ใช้ใน App และฟอร์ม',
      'เว้นบรรทัดแยก import ออกจากการตั้งค่าพื้นฐาน',
      'เปิด selector root เพื่อกำหนดค่าที่สืบทอดไปทั่วแอป',
      'ใช้ system font เพื่อแสดงภาษาไทยได้โดยไม่ต้องโหลด font ภายนอก',
      'กำหนดสีข้อความหลักให้เข้ากับ utility classes ของฟอร์ม',
      'กำหนดพื้นหลังแอปเป็นสีอ่อนเพื่อแยก card สีขาว',
      'ปิด selector root',
      'เปิด selector body สำหรับ layout พื้นฐาน',
      'ลบ margin เริ่มต้นของ browser เพื่อไม่เกิดช่องว่างรอบหน้า',
      'กำหนดความกว้างขั้นต่ำ 320px รองรับ viewport มือถือที่สอน',
      'ปิด selector body',
    ],
    'บันทึกทับ style.css ของ scaffold; Tailwind plugin ใน vite.config.ts จะสร้าง classes ที่ปรากฏในไฟล์',
  ),
];

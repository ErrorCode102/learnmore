import type { LessonContent, LessonSection, LessonSummary, Level } from '../../types/course';
import { defineSnippet } from '../snippets/defineSnippet';
import { apiSnippets } from '../snippets/api';
import { backendSnippets } from '../snippets/backend';
import { databaseSnippets } from '../snippets/database';
import { frontendSnippets } from '../snippets/frontend';
import { installationSnippets } from '../snippets/installation';
import { setupSnippets } from '../snippets/setup';
import { testingSnippets } from '../snippets/testing';

const overviewSnippets = [
  defineSnippet(
    'overview-http-register-request',
    'examples/register-request.http',
    'text',
    `POST /api/auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"email":"student@example.com","password":"StudyPass1!"}`,
    [
      'ระบุ HTTP method POST เพราะ Register สร้าง resource ผู้ใช้ใหม่',
      'ระบุ path และเวอร์ชันโปรโตคอลที่ Backend รับคำขอ',
      'กำหนด host และ port ของเซิร์ฟเวอร์ที่ต้องการติดต่อ',
      'บอก server ว่า body เป็น JSON เพื่อให้ Express อ่านข้อมูลได้',
      'เว้นบรรทัดเพื่อแยก headers ออกจาก body',
      'ส่ง email และ password ใน JSON body เพื่อให้ server validate และ hash',
    ],
    'ตัวอย่าง request ตัวอย่าง ไม่มี credential จริง',
  ),
  defineSnippet(
    'overview-register-response',
    'examples/register-response.json',
    'json',
    `{
  "status": "success",
  "message": "สมัครสมาชิกสำเร็จ",
  "data": {
    "token": "<access token>",
    "user": {
      "id": 1,
      "email": "student@example.com"
    }
  }
}`,
    [
      'เปิด JSON object ของ response ตัวอย่าง',
      'กำหนด status success เพื่อแยกผลลัพธ์ที่สำเร็จจาก error',
      'ส่ง message ภาษาไทยที่ Frontend แสดงเป็น feedback',
      'เปิด data object สำหรับ token และข้อมูลผู้ใช้',
      'คืน access token แบบ placeholder สำหรับส่งใน Authorization header ต่อไป',
      'เปิด user object ที่ไม่มี password hash',
      'คืน id ที่ Database สร้างจาก primary key',
      'คืน email ที่ normalize แล้ว',
      'ปิด user object',
      'ปิด data object',
      'ปิด response object ทั้งหมด',
    ],
    'คาดว่า HTTP status 201 Created และ response มี status/message/data',
  ),
  defineSnippet(
    'overview-auth-glossary',
    'docs/auth-glossary.txt',
    'text',
    `Client: คือ Vue Frontend ที่ส่ง request และแสดงผล
Server: คือ Express Backend ที่ตรวจสอบสิทธิ์
Database: คือ MySQL ที่เก็บผู้ใช้และ password hash
Hash: คือการแปลงรหัสผ่านแบบหนึ่งทาง ไม่ใช่การเข้ารหัส
JWT: คือ signed token ที่มี claim และวันหมดอายุ
Session: คือสถานะ login ที่ server จำได้
Middleware: คือฟังก์ชันที่ทำงานก่อนหรือหลัง route
CSRF: คือการหลอกให้ browser ส่ง request ที่ผู้ใช้ไม่ตั้งใจ`,
    [
      'นิยาม Client เป็นฝั่ง Vue ที่รับ input และ render feedback',
      'นิยาม Server เป็นฝั่ง Express ที่บังคับ validation และ authentication',
      'นิยาม Database เป็นที่เก็บ users โดยไม่เก็บ plaintext password',
      'อธิบาย Hash ว่าคำนวณย้อนกลับไม่ได้และต่างจาก Encryption',
      'อธิบาย JWT ว่าเป็น token ที่มีลายเซ็นแต่ไม่ได้ encrypt ข้อมูล',
      'อธิบาย Session ว่า server ต้องเก็บสถานะการ login อยู่',
      'นิยาม Middleware ว่าเป็นจุดตรวจหรือประมวลผลก่อน route',
      'นิยาม CSRF ให้เข้าใจภัยคุกคามเมื่อใช้ cookie-based authentication',
    ],
    'คำศัพท์ชุดนี้จะถูกใช้ซ้ำในทุกบทของหลักสูตร',
  ),
];

type CoreLessonId = 'overview' | 'installation' | 'setup' | 'database' | 'backend' | 'api' | 'frontend' | 'testing';
type CoreBlueprint = Omit<LessonContent, keyof LessonSummary>;

const coreBlueprints: Record<CoreLessonId, CoreBlueprint> = {
  overview: {
    intro:
      'บทนี้ไล่ตาม Register, Login และ Session จากหน้า Vue ไปยัง Express แล้วถึง MySQL โดยแยกหน้าที่ของแต่ละชั้นให้ชัดเจน คุณจะเห็น HTTP request/response จริงและคำศัพท์ที่ใช้ตลอดหลักสูตรก่อนเขียนโค้ด',
    sections: [
      {
        id: 'auth-architecture',
        title: 'Frontend, Backend และ Database ทำหน้าที่อะไร',
        body: [
          'Frontend เป็น Vue 3 ที่รับ email/password จากฟอร์ม แสดง loading/error และเก็บ access token ชั่วคราว Frontend ไม่ใช่ผู้ตัดสินว่าข้อมูลปลอดภัย เพราะผู้ใช้สามารถแก้ JavaScript ใน browser ได้ทุกเมื่อ',
          'Backend เป็น Express ที่ตรวจ input บน server, hash password ด้วย bcrypt, query MySQL แบบ parameterized และออก JWT เมื่อยืนยันตัวตนผ่าน Database เป็น MySQL/MariaDB ที่บังคับ primary/unique keys และเก็บ password_hash เท่านั้น',
        ],
        bullets: [
          'Client ไม่ควรส่ง user id หรือ role เพื่อขอสิทธิ์; server ต้องอ่านสิทธิ์จาก verified token',
          'Database ไม่ควรถูก browser เชื่อมต่อโดยตรง เพราะ credential และ SQL จะ uncontrolled',
          'ทุก request ที่เปลี่ยนข้อมูลต้องผ่าน validation และ authentication บน Backend',
        ],
        snippets: [overviewSnippets[2]],
        callouts: [
          {
            tone: 'info',
            title: 'พื้นฐานจากเอกสารประกอบ',
            text: 'หลักสูตรอ้างอิง acfrog3.txt (ACFROG 57) และ competition-list.txt (competition 58) เป็นทิศทางการเรียนรู้ ไม่ได้อ้างว่า AuthLab ครอบคลุมการแข่งขันทั้งหมดหรือสร้าง scoring weights',
          },
        ],
      },
      {
        id: 'register-flow',
        title: 'Register: ตั้งแต่ฟอร์มจนถึงผู้ใช้ใหม่',
        body: [
          'เมื่อผู้ใช้กดสมัครสมาชิก Vue จะส่ง POST /api/auth/register พร้อม JSON body ไปยัง proxy ของ Vite Express อ่าน body แล้วตรวจ email/password ด้วย express-validator ก่อนแตะ database',
          'หากข้อมูลถูกต้อง controller จะ hash password ด้วย bcrypt cost 12 แล้ว INSERT ผ่าน mysql2 placeholders Database คืน id ใหม่และ Backend sign JWT ที่มี sub เป็น id พร้อมอายุ 15 นาที Vue เก็บ token และไป Dashboard',
        ],
        snippets: [overviewSnippets[0], overviewSnippets[1]],
        callouts: [
          {
            tone: 'warning',
            title: 'ไม่ส่งรหัสผ่านกลับมา',
            text: 'Response ของ Register มี public user เท่านั้น ห้ามมี password หรือ password_hash เพราะข้อมูลเหล่านั้นไม่จำเป็นต่อ Frontend',
          },
        ],
      },
      {
        id: 'login-session-flow',
        title: 'Login และ Session ที่ทำงานอย่างไร',
        body: [
          'Login ใช้ POST /api/auth/login โดยค้นผู้ใช้ด้วย email ที่ normalize แล้วและเปรียบเทียบ password กับ bcrypt hash ถ้าผิดทั้งสองกรณี server ตอบ 401 ด้วยข้อความเดียวกันเพื่อไม่บอกว่าอีเมลมีอยู่หรือไม่',
          'เมื่อสำเร็จ server ออก JWT ใหม่ Vue เก็บ token ใน localStorage ของ Demo และส่ง Bearer token กับ GET /api/auth/meMiddleware ตรวจลายเซ็น อายุ issuer/audience แล้ว controller คืน public user จาก database',
        ],
        bullets: [
          'JWT มี signature ไม่ใช่การ encrypt; อย่าใส่ password หรือ secret ใน payload',
          'Session ในตัวอย่างนี้คือ token ที่ client คงไว้ ไม่ใช่ server-side session database',
          'Token ที่หมดอายุทำให้ /me ตอบ 401 และ Frontend ควรล้าง session แล้วกลับ Login',
        ],
        callouts: [
          {
            tone: 'warning',
            title: 'ขอบเขตของ Demo',
            text: 'Browser Demo ใน AuthLab ไม่ใช่ production auth เพราะเก็บ token ใน localStorage และยังไม่มี refresh rotation, revocation family และ security review เต็มรูปแบบ',
          },
        ],
      },
      {
        id: 'http-json-contract',
        title: 'HTTP, JSON และสัญญาร่วมระหว่าง Frontend/Backend',
        body: [
          'HTTP request ประกอบด้วย method, path, headers และ optional body POST ใช้สร้างหรือดำเนินการ login ส่วน GET /me ใช้อ่านข้อมูลโดยไม่ส่ง password ซ้ำ Response แยกสถานะด้วย status code และข้อมูลด้วย JSON',
          'ทุก endpoint ใช้ envelope {status,message,data} เช่น 201 สำหรับ Register สำเร็จ, 422 สำหรับ input ไม่ผ่าน policy, 401 สำหรับ credential/token ผิด และ 409 สำหรับ email ซ้ำ Frontend อ่าน message เพื่อแสดงและอ่าน data เมื่อ status เป็น success',
        ],
        bullets: ['200 OK: อ่านข้อมูลหรือ Login สำเร็จ', '201 Created: สร้างผู้ใช้สำเร็จ', '401 Unauthorized: ต้อง login หรือ credential ไม่ถูกต้อง', '409 Conflict: อีเมลถูกใช้งานแล้ว', '422 Unprocessable Entity: เข้า format แต่ไม่ผ่าน validation', '500 Internal Server Error: เกิดข้อผิดพลาดภายในที่ไม่ควรเปิดเผยรายละเอียด'],
        callouts: [{ tone: 'success', title: 'จุดตรวจตั้งต้น', text: 'หากคุณอธิบาย flow นี้ได้ครบและแยกข้อมูลที่ส่งออกจากข้อมูลที่เก็บได้ คุณพร้อมติดตั้งเครื่องมือและสร้างโปรเจกต์จริง' }],
      },
    ],
    checkpoint: {
      summary: 'ตรวจสอบว่าคุณสามารถอธิบายการเดินทางของ request และข้อมูลที่แต่ละชั้นรับผิดชอบได้โดยไม่เชื่อม database โดยตรงจาก browser',
      checklist: ['วาด Register flow ตั้งแต่ Vue ถึง MySQL และระบุจุด hash password', 'อธิบายความต่างระหว่าง Frontend validation และ Backend validation', 'อ่าน HTTP status และ JSON envelope ตัวอย่างได้', 'ระบุข้อมูลที่ไม่ควรอยู่ใน JWT หรือ response ได้'],
    },
  },
  installation: {
    intro:
      'เตรียม Windows Terminal, Node.js LTS, npm, MySQL/MariaDB, HeidiSQL, VS Code และ Git สำหรับโปรเจกต์ AuthLab เราจะตรวจเวอร์ชันและ connection จริงก่อนสร้างไฟล์ เพื่อไม่ให้เสียเวลาติดตั้งย้อนหลัง',
    sections: [
      {
        id: 'install-runtime-tools',
        title: 'ติดตั้ง Node.js, npm และ Editors',
        body: [
          'ดาวน์โหลด Node.js LTS ปัจจุบันจาก https://nodejs.org/en/download แล้วตรวจให้เวอร์ชันไม่ต่ำกว่า reference floor 18 และแนะนำ current LTS เพราะ security fixes npm มาพร้อม Node.js จึงไม่ต้องติดตั้งแยก',
          'ติดตั้ง VS Code จาก https://code.visualstudio.com/ พร้อม extensions สำหรับ Vue, ESLint และ Git; Git จาก https://git-scm.com/downloads ใช้ตรวจสถานะไฟล์และ push source โดยไม่มี .env หรือ node_modules',
        ],
        bullets: ['เปิด Windows Terminal และใช้ Git Bash เมื่อต้องการรัน shell scripts', 'ตรวจ node --version, npm --version, git --version และ code --version', 'บันทึกเวอร์ชันที่ใช้เพื่อให้ทีมอื่น reproduce environment ได้'],
        callouts: [{ tone: 'info', title: 'ข้อกำหนดเครื่องมือ', text: 'Node.js 18 เป็น reference floor ของ workshop แต่แนะนำ current LTS; ตัวอย่างโค้ดใช้ API ที่มีใน Node.js รุ่นปัจจุบัน' }],
      },
      {
        id: 'verify-node-git',
        title: 'ตรวจสอบ Runtime และ Git ก่อนใช้งาน',
        body: [
          'พิมพ์คำสั่งตรวจสอบทีละบรรทัดใน Windows Terminal ผลลัพธ์ของ node ควรขึ้นเวอร์ชัน LTS และ npm ควรเป็นเลขเวอร์ชัน หาก where node ไม่พบ executable ให้ตรวจ PATH หรือเปิด Terminal ใหม่หลังติดตั้ง',
          'Git ใช้ตรวจว่าไฟล์ secrets ไม่ติดตาม และ VS Code CLI ใช้เปิด root auth-lab ได้สะดวก คำสั่งเหล่านี้ไม่แก้ไขระบบ ยกเว้นการอ่านข้อมูลเวอร์ชันและตำแหน่งโปรแกรม',
        ],
        snippets: [installationSnippets[0]],
        callouts: [{ tone: 'success', title: 'ผลลัพธ์ที่คาดหวัง', text: 'Node.js แสดง v18 ขึ้นไป (แนะนำ LTS ปัจจุบัน), npm แสดงเลขเวอร์ชัน และ Git/VS Code แสดงเวอร์ชันได้' }],
      },
      {
        id: 'install-mysql-heidi',
        title: 'ติดตั้ง MySQL/MariaDB utf8mb4 และ HeidiSQL',
        body: [
          'ติดตั้ง MySQL จาก https://dev.mysql.com/downloads/ หรือ MariaDB จาก https://mariadb.org/download/ โดยตั้ง root password ของเครื่องเอง และจำ charset เริ่มต้นให้รองรับ utf8mb4 สำหรับภาษาไทย',
          'ดาวน์โหลด HeidiSQL จาก https://www.heidisql.com/ แล้วสร้าง Session ชื่อ AuthLab Local ใส่ host 127.0.0.1, port 3306 และ user root เพื่อทดสอบ connection; การใช้ HeidiSQL เป็นเครื่องมือช่วย ไม่เปลี่ยน security model ของโปรเจกต์',
        ],
        snippets: [installationSnippets[1], installationSnippets[2]],
        bullets: ['ตรวจ SHOW VARIABLES เพื่อดู character_set_server และ collation_server', 'ไม่ปิด service MySQL ก่อนเริ่ม Backend', 'สำหรับ production จะสร้าง account authlab_app แทน root ในบท Security'],
        callouts: [{ tone: 'warning', title: 'Password ไม่อยู่ใน repository', text: 'รหัสผ่าน MySQL ที่กรอกในเครื่องหรือ HeidiSQL เป็น secret ส่วนตัว ห้ามใส่ในสคริปต์  screenshots หรือไฟล์ที่ commit' }],
      },
    ],
    checkpoint: {
      summary: 'ยืนยันว่ารันเครื่องมือบน Windows Terminal และเชื่อม MySQL ด้วย HeidiSQL ได้จริงก่อนเริ่มสร้าง AuthLab',
      checklist: ['ระบุเวอร์ชัน Node.js และยืนยันว่าตรงตาม reference floor', 'แสดงผล node --version และ npm --version ได้', 'เชื่อม MySQL/MariaDB ด้วย HeidiSQL และรัน SELECT VERSION()', 'ตรวจ charset/collation และเปิดโปรเจกต์ใน VS Code ด้วย Git ได้'],
    },
  },
  setup: {
    intro:
      'สร้างโครง auth-backend และ auth-frontend แบบ ESM ตั้งค่า environment, security middleware และ Vite proxy ให้ Frontend เรียก API ผ่าน same-origin โดยยังคงโค้ดและ secrets ของโปรเจกต์เป็นระเบียบ',
    sections: [
      {
        id: 'scaffold-project',
        title: 'สร้าง Backend และ Vue Frontend',
        body: [
          'สร้าง root ชื่อ auth-lab แล้วแยก Backend/Frontend ชัดเจน Backend ใช้ npm init และ ESM ขณะที่ Frontend ใช้ npm create vite@latest auth-frontend -- --template vue-ts จากนั้นติดตั้ง Axios และ Pinia',
          ' dependency ของ Backend ครอบคลุม Express, mysql2, bcryptjs, jsonwebtoken, cors, dotenv, express-validator, helmet และ express-rate-limit ส่วน nodemon เป็น development dependency เท่านั้น',
        ],
        snippets: [setupSnippets[0], setupSnippets[1]],
        bullets: ['โครงสร้าง: auth-backend/src/{controllers,db,middleware,models,routes,utils}', 'โครงสร้าง: auth-frontend/src/{api,router,stores,views}', 'package-lock.json ของแต่ละฝั่งช่วยให้ npm ci ใน Docker reproducible'],
        callouts: [{ tone: 'info', title: 'ไม่สร้างแอปที่สองใน repository นี้', text: 'repository นี้เป็น classroom React; snippet ทั้งหมดคือ source ของโปรเจกต์ Node/Vue ที่ผู้เรียนคัดลอกไปรันนอก classroom' }],
      },
      {
        id: 'environment-secrets',
        title: 'แยก Configuration และ Secrets ด้วย .env',
        body: [
          'Backend อ่าน PORT, DB_*, CLIENT_ORIGIN, JWT_SECRET และ JWT_EXPIRES_IN จาก environment ไม่ hardcode credential ใน source ไฟล์ .env ตัวอย่างเว้น password/secret ว่างเพื่อให้เติมค่าของเครื่องเอง',
          'เพิ่ม .env, node_modules, dist และ log files ใน .gitignore และตรวจ git status ก่อน commit สร้าง JWT secret สุ่มยาวจาก crypto local แล้วเก็บใน secret manager เมื่อขึ้น production',
        ],
        snippets: [setupSnippets[2], setupSnippets[3]],
        callouts: [{ tone: 'warning', title: 'ค่า placeholder ไม่ใช่ secret', text: 'ไฟล์ตัวอย่างไม่มีรหัสผ่านจริง ห้ามเผยแพร่ .env ที่เติมค่าแล้วหรือใส่ token ใน screenshots และข้อความแจ้ง error' }],
      },
      {
        id: 'express-app-server',
        title: 'สร้าง app.js, server.js และ health endpoint',
        body: [
          'app.js สร้าง Express instance และติดตั้ง helmet, CORS allowlist, JSON limit 16kb และ rate limit ก่อน routes ส่วน GET /api/health ตอบ JSON เพื่อตรวจว่า process ทำงานโดยไม่ต้อง login',
          'server.js โหลด app และ MySQL pool แล้วเปิด listener พร้อม SIGINT/SIGTERM shutdown ที่ปิด server และ pool อย่างเรียบร้อย รองรับทั้ง Ctrl+C และ Docker stop',
        ],
        snippets: [setupSnippets[4], setupSnippets[5]],
        bullets: ['เริ่ม Backend ด้วย npm run dev จาก auth-backend', 'ตรวจ http://localhost:3000/api/health และคาดว่า status success', 'สร้าง authRoutes.js ในบท Backend ก่อนเมื่อ app import ไฟล์นั้น'],
        callouts: [{ tone: 'success', title: 'Verification', text: 'ผลลัพธ์ที่คาดหวังคือ log AuthLab API ทำงานที่ http://localhost:3000 และ curl health ตอบ 200' }],
      },
      {
        id: 'vite-proxy',
        title: 'เชื่อม Vite dev proxy ไปยัง Express',
        body: [
          'Vite ทำงานที่ port 5173 และ proxy path /api ไปยัง localhost:3000 ทำให้ browser เห็น request เป็น same-origin และลด CORS ขณะ development; CLIENT_ORIGIN ของ Backend จึงเป็น http://localhost:5173',
          'restart Vite หลังแก้ config จากนั้น Frontend เรียก relative /api ได้โดยไม่ hardcode port ของ Backend ใน production nginx จะทำหน้าที่ proxy แทน Vite',
        ],
        snippets: [setupSnippets[6]],
        callouts: [{ tone: 'info', title: 'เส้นทางเดียวกัน', text: 'Vite proxy ไม่เปลี่ยน endpoint; /api/auth/login ต่อไปยัง Express route /login ใต้ prefix /api/auth เหมือนเดิม' }],
      },
    ],
    checkpoint: {
      summary: 'ตรวจโครงสร้าง, configuration และ server สองฝั่งก่อนเพิ่ม business logic ของ authentication',
      checklist: ['สร้าง auth-backend/auth-frontend และติดตั้ง dependency ครบ', 'เติม .env โดยไม่ commit secrets และตรวจ .gitignore', 'เริ่ม Backend แล้ว health endpoint ตอบ 200', 'เริ่ม Vite ที่ 5173 และตรวจ proxy ไปยัง port 3000'],
    },
  },
  database: {
    intro:
      'ออกแบบ database authlab และตาราง users ด้วย MySQL พร้อม primary/unique keys, utf8mb4, timestamps และ password_hash คุณจะได้ query แบบ parameterized ที่ปลอดภัยจากการ SQL injection',
    sections: [
      {
        id: 'users-schema',
        title: 'สร้าง database และตาราง users',
        body: [
          'CREATE DATABASE authlab ใช้ utf8mb4_unicode_ci เพื่อรองรับภาษาไทยและ emoji ตาราง users มี id เป็น AUTO_INCREMENT primary key และ email เป็น unique key เพื่อไม่สร้างบัญชีซ้ำ',
          'password_hash เป็น VARCHAR(255) สำหรับ bcrypt hash เท่านั้น ส่วน created_at/updated_at ใช้ timestamp ในการตรวจ lifecycle ของผู้ใช้ โดยไม่เก็บข้อมูล credential ที่ไม่จำเป็น',
        ],
        snippets: [databaseSnippets[0]],
        bullets: ['InnoDB รองรับ transaction และ foreign key', 'UNIQUE เป็น defense สุดท้ายเมื่อ Register มาพร้อมกัน', 'NULL/NOT NULL กำหนดว่าแต่ละ field ต้องมีค่าหรือไม่'],
        callouts: [{ tone: 'warning', title: 'Hash ไม่ใช่ Encryption', text: 'bcrypt เปรียบเทียบรหัสผ่านโดยไม่ย้อนกลับได้ อย่าใช้ base64, MD5 หรือ SHA-1 เก็บรหัสผ่าน และห้ามเก็บ plaintext' }],
      },
      {
        id: 'parameterized-queries',
        title: 'ทำไม ? placeholder ป้องกัน SQL injection',
        body: [
          'mysql2 execute แยก SQL string ออกจาก parameter values เมื่อ query เป็น WHERE email = ? ค่าของ email ถูก quote/escape เป็นข้อมูล ไม่สามารถปิด string แล้วเพิ่ม SQL คำสั่งได้',
          'ห้าม concatenate input ลงใน query และห้ามใช้ input เป็นชื่อ table/column ถ้าจำเป็นต้องเลือก dynamic identifier ต้องใช้ allowlist ที่คงที่ ไม่ใช่ค่าจากผู้ใช้โดยตรง',
        ],
        snippets: [databaseSnippets[1]],
        bullets: ['SELECT, INSERT, UPDATE และ DELETE ควรส่ง values ผ่าน parameter array', 'Validation ลด input ที่ไม่ดี แต่ไม่แทนที่ parameterized query', 'Error จาก database ต้องถูกแปลงเป็น response ที่เหมาะสมโดย controller'],
        callouts: [{ tone: 'info', title: 'ตัวอย่าง input อันตราย', text: 'email ที่มี \' OR 1=1 -- ยังเป็น string หนึ่งเมื่อส่งเป็น parameter จึงไม่เปลี่ยนความหมายของ SQL' }],
      },
      {
        id: 'verify-database',
        title: 'ตรวจ Schema และความพร้อมของข้อมูล',
        body: [
          'ใช้ SHOW CREATE TABLE users เพื่อดู primary key, unique key, charset และ collation จริงจาก MySQL แทนการเชื่อใจเพียง source ที่เขียนไว้ และใช้ SELECT COUNT(*) เพื่อดูว่าตารางพร้อมสำหรับ Register',
          'ก่อนทดสอบ Register ควรลบหรือเปลี่ยน email ตัวอย่างที่เคยใช้เพื่อไม่ชน unique constraint อย่าลบ table/users ทั้งหมดใน environment ที่มีข้อมูลจริง',
        ],
        snippets: [databaseSnippets[2]],
        callouts: [{ tone: 'success', title: 'ผลลัพธ์ที่คาดหวัง', text: 'SHOW CREATE TABLE แสดง PRIMARY KEY และ uq_users_email พร้อม utf8mb4; ตารางใหม่ควรมี user_count = 0' }],
      },
    ],
    checkpoint: {
      summary: 'ตรวจสอบว่า schema เก็บเฉพาะข้อมูลที่จำเป็นและ query ทุกตัวแยกค่า parameter ออกจาก SQL',
      checklist: ['สร้าง authlab และ users พร้อม PK/UNIQUE/utf8mb4', 'อธิบายหน้าที่ของ password_hash และ timestamps', 'เขียน SELECT/INSERT ด้วย ? placeholders', 'ตรวจ SHOW CREATE TABLE และกรณี email ซ้ำ'],
    },
  },
  backend: {
    intro:
      'สร้าง Register, Login และ protected /me ด้วย Express แยก pool, model, validation, JWT middleware และ controller พร้อม response {status,message,data} และ error codes ที่มีนัยหมายชัดเจน',
    sections: [
      {
        id: 'pool-model',
        title: 'MySQL pool และ User model',
        body: [
          'Pool แชร์ connection และจำกัดจำนวนไว้ที่ 10 สำหรับตัวอย่าง เพื่อไม่เปิด connection ใหม่ทุก request Model เป็นผู้มีหน้าที่รู้ SQL ของ users และส่งค่าทุก field ผ่าน parameterized query',
          'findByEmail คืน password_hash ให้ controller เปรียบเทียบได้ แต่ findById สำหรับ /me เลือก public columns เท่านั้น Frontend จึงไม่เคยได้รับ hash จาก response',
        ],
        snippets: [backendSnippets[0], backendSnippets[2]],
        bullets: ['mysql2/promise ใช้ await ได้กับ execute', 'charset UTF8MB4_GENERAL_CI ทำให้ connection ส่งข้อมูลไทยได้', ' pool ต้องปิดเมื่อ SIGTERM จาก server.js'],
        callouts: [{ tone: 'info', title: 'Model boundary', text: 'Controller ไม่ควรเขียน SQL เอง เพราะทำให้ตรวจ parameterized queries และทดสอบ logic ยากขึ้น' }],
      },
      {
        id: 'server-validation',
        title: 'ตรวจสอบ input ด้วย express-validator',
        body: [
          'Register ตรวจ email format/ความยาวและ password policy บน server ขณะที่ Login ตรวจเพียง field ที่จำเป็นเพื่อรับรหัสผ่านเก่าที่อาจไม่ตรง policy ใหม่ได้',
          'pure password helper ตรวจ string, 8–72 ตัว, byte length และสี่กลุ่มอักขระ ทำให้ทั้ง validation และ Vitest ใช้กฎเดียวกัน',
        ],
        snippets: [backendSnippets[1], backendSnippets[3]],
        callouts: [{ tone: 'warning', title: 'Browser ไม่ใช่ security boundary', text: 'required/minlength ใน Vue ช่วยประสบการณ์ แต่ attacker เรียก API ตรงได้ จึงต้องมี validation บน Express เสมอ' }],
      },
      {
        id: 'register-login-controllers',
        title: 'Hash, duplicate handling และ generic login error',
        body: [
          'Register normalize email, bcrypt.hash ด้วย cost 12, ตรวจ existing user และ INSERT หากไม่ซ้ำ ถ้า unique constraint ชนเพราะ race คืน 409 เช่นกัน Login ใช้ bcrypt.compare และรวม user ไม่พบ/password ผิดเป็น 401 ข้อความเดียวกัน',
          'Controller อ่าน validationResult และตอบ 422 พร้อม field errors เมื่อข้อมูลไม่ถูกต้อง ส่วน error ที่ไม่คาดหมายส่งต่อไป global handler ซึ่งตอบ 500 โดยไม่ส่ง stack trace ให้ client',
        ],
        snippets: [backendSnippets[5]],
        bullets: ['201 ใช้เมื่อสร้างผู้ใช้ใหม่', '409 ใช้เมื่อ email มีอยู่แล้ว', '401 ใช้เมื่อ credential หรือ token ไม่ถูกต้อง', '422 ใช้เมื่อ input ไม่ผ่าน validation'],
        callouts: [{ tone: 'success', title: 'Password handling', text: 'plaintext password ถูกใช้เพียงช่วงสั้นใน memory ของ request และไม่ถูกบันทึกใน database หรือ log' }],
      },
      {
        id: 'protected-me-route',
        title: 'JWT middleware และ protected /me route',
        body: [
          'jwt.sign สร้าง access token ด้วย sub, expiresIn, HS256, issuer และ audience ส่วน jwt.verify ปฏิเสธ token ที่ลายเซ็นผิด หมดอายุหรือมี claims ไม่ตรง พร้อม algorithm whitelist',
          'requireAuth อ่าน Authorization: Bearer <token> และแนบ id จาก verified payload เข้า req.user /me ใช้ id นี้ query ผู้ใช้จาก database แทนการเชื่อม user id ที่ client ส่งมา',
        ],
        snippets: [backendSnippets[4], backendSnippets[6], backendSnippets[5]],
        callouts: [{ tone: 'warning', title: 'JWT ไม่ได้ encrypt', text: 'payload อ่านได้ด้วยทุกคนที่ถือ token ดังนั้นใส่เฉพาะ identifier และ claims ที่จำเป็น ห้ามใส่ password, secret หรือข้อมูลส่วนบุคคลมากเกินจำเป็น' }],
      },
    ],
    checkpoint: {
      summary: 'ตรวจ flow ของ controller และ middleware ทั้ง happy path และ error path ก่อนเชื่อม Frontend',
      checklist: ['อธิบายการ hash/compare และเหตุที่ไม่เก็บ plaintext', 'Register ซ้ำได้ 409 และ input อ่อนได้ 422', 'Login ผิดตอบ 401 ด้วยข้อความเดียวกัน', '/me ใช้ verified token และไม่ส่ง password_hash'],
    },
  },
  api: {
    intro:
      'ทดสอบ REST API ของ AuthLab ด้วย .http, curl และ DevTools Network จาก Register ถึง protected /me พร้อมอ่าน status codes, CORS, rate limits และ JSON responses ให้ตรงกับ Frontend contract',
    sections: [
      {
        id: 'endpoints-token-flow',
        title: 'Endpoint และ Bearer token flow',
        body: [
          'POST /api/auth/register และ /login รับ JSON แล้วตอบ 201/200 พร้อม data.token; GET /api/auth/me ต้องมี Authorization: Bearer <token> และ respond public user จาก database',
          'jwt.sign เกิดตอน Login สำเร็จและ jwt.verify เกิดใน requireAuth ทุก request ที่เข้า /me Token ที่ถูกแก้ไข หมดอายุ หรือไม่มี header จะได้ 401 จาก middleware',
        ],
        snippets: [apiSnippets[0]],
        callouts: [{ tone: 'info', title: 'Authorization header', text: 'Schema ที่ถูกต้องคือ Bearer ตามด้วยช่องว่างและ token; ห้ามส่ง token ใน query string เพราะ query มากถูกบันทึกใน log' }],
      },
      {
        id: 'curl-negative-tests',
        title: 'ใช้ curl ทดสอบ success และ negative cases',
        body: [
          'curl -i แสดง status line, headers และ body ทำให้ตรวจ 201, 401 และ CORS/rate headers ได้ในคำสั่งเดียว บน PowerShell ใช้ curl.exe เพื่อไม่ให้ alias ของ Invoke-WebRequest ขัดใจ',
          ' negative tests ควรมี wrong password, missing token, duplicate user และ weak password ไม่ได้ทดสอบแค่ happy path เพราะ validation และ error envelope คือส่วนที่ Frontend พึ่งมากที่สุด',
        ],
        snippets: [apiSnippets[1]],
        callouts: [{ tone: 'success', title: 'ผลลัพธ์ที่คาดหวัง', text: 'Register = 201, wrong password = 401, /me พร้อม Bearer = 200 และ /me ไม่มี token = 401' }],
      },
      {
        id: 'response-error-contract',
        title: 'อ่าน JSON response และ error envelope',
        body: [
          'ทุก response มี status, message และ data; success เก็บ token/user ใน data ส่วน error อาจมี validation errors หรือ data = null Frontend ควรตัดสินใจจาก status และ HTTP code ไม่ได้ parse message เพื่อหาคำว่า success',
          'generic 401 ของ Login และ /me มีวัตถุประสงค์ต่างกัน แต่ไม่เปิดเผยรายละเอียด token; 422 ส่ง field/message ให้ฟอร์มแก้ไขได้ ส่วน 500 ควร log ที่ server เท่านั้น',
        ],
        snippets: [apiSnippets[2]],
        bullets: ['ตรวจ content-type application/json', 'ตรวจว่า token อยู่ใน data.token', 'ตรวจว่า user ไม่มี password_hash', 'ตรวจ 429 เมื่อ rate limit ทำงาน'],
        callouts: [{ tone: 'warning', title: 'อย่า log token', text: 'DevTools, screen recording และ ticket อาจถูกแชร์ จึงควร mask Authorization header และ response token ก่อนแนบหลักฐาน' }],
      },
      {
        id: 'cors-rate-devtools',
        title: 'CORS, rate limit และ DevTools Network',
        body: [
          'CORS กำหนดว่าอนุญาต origin ไหนให้อ่าน response ข้าม origin; มันไม่ใช่ authentication Vite proxy ทำให้ development เป็น same-origin แต่การเรียก Backend ตรง仍需 CLIENT_ORIGIN ให้ตรง',
          'app มี global /api rate limit และ authLimiter บน /api/auth เพื่อลด brute force DevTools ช่วยยืนยัน URL, method, payload, status และ response จริงที่ browser ส่ง',
        ],
        snippets: [apiSnippets[3]],
        bullets: ['Network > Fetch/XHR ใช้ตรวจ request ของ Vue', 'RateLimit headers บอกเพดานและเวลาที่จะรีเซ็ต', '429 แปลว่าลองใหม่ภายหลัง ไม่ใช่ credential ผิด', ' production ต้องตั้ง trust proxy ถูกต้องถึงจะนับ IP ของ client ได้ถูกต้อง'],
        callouts: [{ tone: 'info', title: 'CORS กับ proxy', text: 'ผ่าน Vite proxy browser จะเห็น localhost:5173; Backend เห็น request จาก Vite จึงไม่เกิด preflight แบบเรียกข้าม origin ตรง' }],
      },
    ],
    checkpoint: {
      summary: 'พิสูจน์ contract ด้วย request จริงและตรวจ Network ก่อนเขียน Vue forms เพื่อไม่แก้ Frontend กับ API วนกัน',
      checklist: ['เรียก Register/Login/me ด้วย Thunder Client หรือ curl', 'ตรวจ status, message, data และ public user fields', 'ทดสอบ wrong password และ missing token', 'อ่าน CORS/rate headers และตรวจ Network payload'],
    },
  },
  frontend: {
    intro:
      'สร้าง Vue 3 Composition API ด้วย Axios, Pinia และ Router guard รวมถึง LoginView, RegisterView, DashboardView, loading/error states, labels/autocomplete และ logout โดยเชื่อม contract ของ Backend เดิม',
    sections: [
      {
        id: 'http-store',
        title: 'Axios instance และ Pinia auth store',
        body: [
          'Axios instance กำหนด baseURL /api และ request interceptor ที่อ่าน authlab.token แล้วแนบ Bearer header อัตโนมัติ Response interceptor แปลง API message เป็น Error และเก็บ status เพื่อแยก 401',
          'Pinia setup store เป็น single source of truth ของ token, user, loading, error และ isAuthenticated; authenticate ใช้ร่วมกันระหว่าง Register/Login ส่วน loadMe sync public user จาก /me',
        ],
        snippets: [frontendSnippets[0], frontendSnippets[1]],
        callouts: [{ tone: 'warning', title: 'localStorage token caveat', text: 'localStorage ไม่ได้ encrypt และ JavaScript ที่โจมตีผ่าน XSS อ่านได้ Demo ใช้เพื่อเรียนรู้เท่านั้น; production ควรพิจารณา HttpOnly refresh cookie พร้อม CSRF protection' }],
      },
      {
        id: 'router-main',
        title: 'ตั้งค่า Router guard และ Vue entry point',
        body: [
          'Router กำหนด /login, /register และ /dashboard พร้อม meta guestOnly/requiresAuth beforeEach redirect ผู้ที่ไม่มี token ไป Login และผู้ที่ login แล้วออกจาก auth forms',
          'main.js ลงทะเบียน Pinia ก่อน Router guard เรียก store และ mount App.vue ซึ่งแสดง RouterView; App shell เป็นจุดรวม styling และ navigation ในโปรเจกต์ที่สอน',
        ],
        snippets: [frontendSnippets[2], frontendSnippets[3], frontendSnippets[4]],
        bullets: ['Router guard เป็น UX ไม่ใช่การตรวจสอบสิทธิ์จริง', 'Dashboard ต้องเรียก /me เมื่อ mount เพื่อยืนยัน token กับ server', 'Backend ต้องป้องกัน /me ไม่ว่าจะเข้าผ่าน router ใด'],
        callouts: [{ tone: 'info', title: 'โครงสร้าง Frontend', text: 'แยก api, stores, router และ views ทำให้เปลี่ยน storage strategy ใน production โดยไม่เขียน logic ซ้ำในทุกฟอร์ม' }],
      },
      {
        id: 'login-register-forms',
        title: 'LoginView และ RegisterView ที่ใช้งานได้จริง',
        body: [
          'LoginView ใช้ reactive form, v-model, @submit.prevent และ store.authenticate ปุ่มถูกปิดระหว่าง loading และ error แสดงใน role alert; email ใช้ autocomplete=email ส่วน password ใช้ current-password',
          'RegisterView เพิ่ม confirmPassword และ autocomplete=new-password พร้อมตรวจว่ารหัสสองช่องตรงกันก่อนยิง API Server ยังตรวจ policy ซ้ำและ duplicate email อาจตอบ 409',
        ],
        snippets: [frontendSnippets[5], frontendSnippets[6]],
        bullets: ['label for ต้องตรงกับ input id', 'error ต้องประกาศ role alert', 'loading ต้องประกาศ role status หรือข้อความบนปุ่ม', 'password ไม่ถูก trim เพราะ whitespace เป็นส่วนของรหัสผ่าน'],
        callouts: [{ tone: 'success', title: 'Form accessibility', text: 'keyboard ผู้ใช้กด Tab ไป input แล้ว Enter เพื่อ submit ได้; password manager รับ autocomplete และ error ถูก screen reader อ่านเมื่อเปลี่ยน' }],
      },
      {
        id: 'dashboard-logout',
        title: 'DashboardView, /me verification และ logout',
        body: [
          'DashboardView เรียก auth.loadMe เมื่อ mounted เพื่ออ่าน user จาก protected endpoint แทนการ decode JWT ใน browser จึงยืนยันว่ายังมีสิทธิ์กับ database จริง',
          'logout ล้าง token, user และ localStorage แล้วนำทางกลับ Login; เมื่อ /me ตอบ 401 store ก็ล้าง session อัตโนมัติเพื่อไม่ให้หน้าดูเหมือน login ต่อไป',
        ],
        snippets: [frontendSnippets[7]],
        bullets: ['แสดง loading ก่อนข้อมูล user', 'แยก error ออกจาก user ที่ยังไม่มี', 'ไม่ decode token เพื่อเอา email มาแสดงโดยไม่ตรวจ server', 'logout ฝั่ง client ไม่ได้ revoke JWT แบบ stateless',
        ],
        callouts: [{ tone: 'warning', title: 'Demo ไม่ใช่ production auth', text: 'Browser Demo ใน AuthLab ไม่ใช่ production auth; การ logout ของ JWT demo ไม่ได้ทำให้ token ที่คัดลอกไปใช้ไม่ได้ทันที จนกว่าจะหมดอายุ' }],
      },
    ],
    checkpoint: {
      summary: 'ทดสอบฟอร์มและ navigation ทั้งกรณีสำเร็จและผิดพลาดโดยดู API response จริงจาก DevTools',
      checklist: ['Login สำเร็จแล้ว Dashboard แสดง public user', 'Register ซ้ำ/weak password แสดง error ที่แก้ไขได้', 'Refresh Dashboard แล้ว /me ทำงาน', 'Logout ล้าง token และ guard กัน Dashboard', 'Keyboard, label, autocomplete และ loading/error states ใช้งานได้'],
    },
  },
  testing: {
    intro:
      'ทดสอบ AuthLab ทั้ง happy path, negative matrix, pure password policy และ manual browser checklist เพื่อค้นหา validation, response contract และ security leaks ก่อนนำโปรเจกต์ไปต่อ',
    sections: [
      {
        id: 'test-matrix',
        title: 'Happy path และ negative test matrix',
        body: [
          'matrix ครอบคลุม Register สำเร็จ 201, duplicate user 409, weak password 422, wrong password 401, missing token 401 และ expired token 401 แต่ละกรณีต้องคาดหวัง status และ body ไม่ใช่แค่มองว่าหน้าจอไม่พัง',
          'ใช้ email ใหม่หรือล้าง test user ก่อนรันซ้ำเพื่อไม่ให้ unique constraint ทำให้ false positive; expired token สร้างจาก .env ของ test environment ด้วย expiresIn -1 เท่านั้น',
        ],
        snippets: [testingSnippets[2], testingSnippets[3]],
        bullets: ['Duplicate: อีเมลเดิมRegister  twice', 'Weak password: ใส่ 123 เพื่อทดสอบ server policy', 'Wrong password: ใช้ email จริงกับรหัสผิด', 'Missing/expired token: ยิง /me โดยไม่มี header หรือใช้ token หมดอายุ'],
        callouts: [{ tone: 'info', title: 'ตรวจข้อความ', text: 'wrong password และ email ที่ไม่มีควรได้ generic 401 เดียวกัน; token missing/expired ของ /me อาจมี message คนละแบบจาก Login ได้แต่ไม่ควร reveal รายละเอียด cryptographic' }],
      },
      {
        id: 'vitest-password-policy',
        title: 'Vitest unit test สำหรับ pure helper',
        body: [
          'isPasswordStrongEnough เป็น pure function ไม่ต่อ database จึงทดสอบเร็วได้โดยตรง ตรวจทั้ง strong password, weak password หลาย pattern และ non-string input เพื่อไม่ให้ exception รั่วจาก validator',
          'ติดตั้ง Vitest ใน Backend และรัน npx vitest run src/utils/passwordPolicy.test.js ผลลัพธ์ที่คาดหวังคือทุก test ผ่านโดยไม่ต้องเปิด MySQL',
        ],
        snippets: [testingSnippets[0], testingSnippets[1]],
        callouts: [{ tone: 'success', title: 'Test pyramid เบื้องต้น', text: 'unit tests ตรวจ logic ที่แยกได้ง่าย; API tests ตรวจ contract และ manual browser tests ตรวจ interaction ที่ไม่สามารถจำลองผู้ใช้ได้ทั้งหมด' }],
      },
      {
        id: 'curl-thunder-client',
        title: 'เลือก curl หรือ Thunder Client ให้เหมาะกับงาน',
        body: [
          'Thunder Client เหมาะกับอ่าน/แก้ .http files และ rerun กรณีต่าง ๆ ส่วน curl เหมาะกับ automation ใน terminal หรือ CI; ทั้งสองวิธีต้องส่ง JSON content type และอ่าน status/header/response ให้ครบ',
          'อย่าเก็บ access token จริงใน .http หรือ script ที่ commit; ใช้ placeholder แล้วคัดลอกจาก response ชั่วคราว และ mask token ก่อนแชร์หลักฐาน',
        ],
        snippets: [apiSnippets[0], apiSnippets[1]],
        bullets: ['บันทึก test case ID, input, expected และ actual', 'แยก test database ออกจาก production', 'จำกัด rate limit หรือรอ window  reset เมื่อทดสอบ 429', 'ตรวจ duplicate email ก่อนเชื่อว่ารัน test ได้ผลผิดปกติ'],
      },
      {
        id: 'manual-browser-checklist',
        title: 'Manual browser checklist สำหรับผู้ใช้จริง',
        body: [
          'ทดสอบด้วย keyboard และ viewport มือถือ: Tab ผ่านฟอร์ม, Enter ส่งข้อมูล, อ่าน error ด้วย screen reader, ป้องกัน double submit และย้อนกลับด้วย browser history โดย guard ยังทำงาน',
          'ตรวจ Network ว่าไม่มี password_hash ใน response, ไม่มี token ใน URL และ CORS/rate headers ตรงคาด; ทดสอบ token หมดอายุแล้ว refresh dashboard เพื่อดูการล้าง session',
        ],
        bullets: ['Register > Dashboard > Logout > Login', 'Register ซ้ำแล้วแก้ email', 'Password อ่อนแล้วแก้ให้ผ่าน policy', 'ปิด Backend ขณะ submit เพื่อดู network error', 'ลบ/expire token แล้วเปิด /me'],
        callouts: [{ tone: 'warning', title: 'Manual test ยังจำเป็น', text: ' automated tests ไม่จับ visual focus, Thai text truncation และ autocomplete ของ password manager ได้ทั้งหมด จึงต้องมี browser checklist ร่วมด้วย' }],
      },
    ],
    checkpoint: {
      summary: 'สรุปหลักฐาน test ที่รันจริงและยืนยันว่า negative paths ไม่รั่วข้อมูลหรือทำให้ UI ค้าง',
      checklist: ['รัน Vitest และบันทึกผลลัพธ์', 'รัน API matrix ทั้งหกรายการ', 'ตรวจ wrong password/missing token/expired token', 'ทำ manual browser checklist ด้วย keyboard', 'ตรวจ Network และ log ไม่มี secrets'],
    },
  },
};

const diplomaNotes: Partial<Record<CoreLessonId, Partial<Record<string, string>>>> = {
  overview: {
    'login-session-flow': 'ระดับปวส. ต้องเปรียบเทียบ stateless JWT กับ server-side session ในแง่ horizontal scaling, immediate revocation, token size และการเก็บ secret; Demo นี้เลือก JWT เพื่อเรียนรู้ flow ไม่ใช่การยืนยันว่าเหมาะกับ production ทุกกรณี',
    'http-json-contract': 'ออกแบบ contract ให้เพิ่ม request id และ standardized error codes สำหรับ tracing โดยไม่ใส่ stack traceหรือ internal SQL ใน response และตกลง versioning ก่อนเปลี่ยน schema',
  },
  installation: {
    'install-mysql-heidi': 'เลือก MySQL/MariaDB เวอร์ชันที่ได้รับการสนับสนุนและทดสอบกับ mysql2 driver รวมถึง backup/restore, TLS และ least-privilege account; การติดตั้งผ่าน GUI ไม่ได้ยืนยันว่า environment พร้อม production',
  },
  setup: {
    'environment-secrets': 'แยก secret/config ตาม environment และ inject ผ่าน secret manager/CI protected variables; ใช้ key rotation และ audit access แทนการคัดลอก .env ไปยัง production ทุกเครื่อง',
    'vite-proxy': 'ใน production ใช้ reverse proxy/TLS termination, health checks, graceful timeout และ security headers ที่ตรงกับ deployment; Vite proxy เป็นเครื่องมือ development เท่านั้นและไม่ควรเปิดสู่ internet',
  },
  database: {
    'parameterized-queries': 'Parameterized query ป้องกัน SQL injection แต่ไม่แก้ authorization; ต้องตรวจ ownership ทุก query, ใช้ transaction สำหรับ multi-step writes และป้องกัน race ด้วย unique/foreign key constraints',
    'users-schema': 'พิจารณา email canonicalization, verification status, account lockout และ audit fields โดยไม่เพิ่มข้อมูลเกินความจำเป็น; schema เปลี่ยนผ่าน migration ที่ทดสอบ rollback ได้',
  },
  backend: {
    'register-login-controllers': 'generic login error ลด enumeration แต่ยังอาจรั่วผ่าน timing, rate-limit response หรือ duplicate registration; ต้องทำ uniform timing, ข้อความ/สถานะสม่ำเสมอและประเมิน flow email verification',
    'protected-me-route': 'JWT ที่ stateless ยกเลิกยาก ต้องวาง short expiry, refresh rotation, token version/family revocation และ incident response; key rotation ต้องรองรับ old/new signing keys ชั่วคราว',
  },
  api: {
    'endpoints-token-flow': 'เพิ่ม idempotency/request correlation สำหรับ operation สำคัญและเอกสาร OpenAPI; ห้าม log Authorization header หรือ response token และกำหนด retry behavior สำหรับ 429/5xx ให้ชัดเจน',
    'cors-rate-devtools': 'Rate limit ตาม IP ต้องรวม trust proxy, distributed store และ key ที่เหมาะกับ NAT; CORS เป็น browser policy ไม่ป้องกัน non-browser clients จึงต้องมี authentication และ authorization จริง',
  },
  frontend: {
    'http-store': 'localStorage token เสี่ยง XSS; ระดับปวส. ต้องเปรียบเทียบ HttpOnly refresh cookie, in-memory access token, CSRF token และ Secure/SameSite cookie พร้อมแผนการ revoke เมื่อหมดอายุ',
    'dashboard-logout': 'Client logout เป็นเพียงการล้าง state; production ต้อง revoke refresh token ฝั่ง server และจัดการ multi-tab synchronization, silent refresh และ race ระหว่าง refresh หลาย request',
  },
  testing: {
    'test-matrix': 'ขยาย matrix เป็น integration tests ด้วย test database, concurrency duplicate registration, expired/revoked token, CORS origin และ rate limit; deterministic fixtures ต้องไม่พึ่ง production data',
    'vitest-password-policy': 'ใช้ property-based/fuzz testing และ threat modeling เพื่อหา input ขอบเขต เช่น Unicode, byte length และ timing; unit tests ต้องครอบคลุม policy changes แต่ไม่ทดสอบ secret จริง',
  },
};

export function createCoreLessonContent(summary: LessonSummary, level: Level): LessonContent {
  const blueprint = coreBlueprints[summary.id as CoreLessonId];
  const notes = level === 'diploma' ? diplomaNotes[summary.id as CoreLessonId] : undefined;
  const sections: LessonSection[] = blueprint.sections.map((section) => ({
    ...section,
    diplomaNote: notes?.[section.id],
  }));

  return { ...summary, ...blueprint, sections };
}

export function createCertificateLessonContent(summaries: LessonSummary[]): LessonContent[] {
  return summaries.map((summary) => createCoreLessonContent(summary, 'certificate'));
}

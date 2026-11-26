import { defineSnippet } from './defineSnippet';

export const securitySnippets = [
  defineSnippet(
    'security-production-env',
    'auth-backend/.env.production.example',
    'text',
    `NODE_ENV=production
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USER=authlab_app
DB_PASSWORD=
DB_NAME=authlab
CLIENT_ORIGINS=https://authlab.example.com
JWT_SECRET=
JWT_EXPIRES_IN=15m`,
    [
      'ระบุ production mode เพื่อเปิดพฤติกรรม secure cookie และการจัดการ error ที่เหมาะสม',
      'กำหนด port ที่ container หรือ reverse proxy ส่ง request เข้ามา',
      'ชี้ host ไปยัง service mysql ใน Docker network แทน localhost',
      'กำหนด port มาตรฐานของ MySQL service',
      'ใช้ account แยกเฉพาะ authlab ที่มีสิทธิ์จำกัดแทน root',
      'เว้นรหัสผ่าน database เพื่อ inject จาก secret manager หรือ CI protected variables',
      'คงชื่อ database เป็น authlab ให้ตรงกับ schema และ pool',
      'กำหนด allowlist origin จริงโดยคั่นหลาย origin ด้วยเครื่องหมายจุลภาค',
      'เว้น JWT secret สำหรับสร้างค่าสุ่มยาวและ inject ระหว่าง deploy เท่านั้น',
      'คงอายุ access token 15 นาทีเพื่อให้ rotation ของ refresh token มีความหมาย',
    ],
    'ไฟล์ตัวอย่างไม่มี secrets; production ควร inject env จากระบบจัดการ secret',
  ),
  defineSnippet(
    'security-cors-rate-config',
    'auth-backend/src/app.security.js',
    'javascript',
    `import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

export function configureSecurity(app) {
  const allowedOrigins = (process.env.CLIENT_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }));
}`,
    [
      "นำเข้า helmet เพื่อเพิ่ม security headers แก่ response",
      "นำเข้า cors เพื่อจำกัด origin ที่เรียก API ข้าม domain ได้",
      "นำเข้า rateLimit เพื่อลด brute force บน authentication routes",
      "เว้นบรรทัดก่อนฟังก์ชัน config",
      "ส่งออกฟังก์ชันที่รับ Express app แล้วติดตั้ง security middleware",
      "อ่าน origin allowlist จาก env โดยไม่ hardcode โปรเจกต์ production",
      "แยก string ด้วย comma เพื่อรองรับเว็บไซต์หลาย origin",
      "ตัด whitespace รอบ origin เพื่อหลีกเลี่ยงค่าที่ไม่ตรง",
      "กรองค่าว่างออกเพื่อไม่เพิ่ม origin ที่อันตรายโดยไม่ตั้งใจ",
      "เว้นบรรทัดก่อนการติดตั้ง middleware",
      "ปิด header X-Powered-By เพื่อลดข้อมูล technology ที่ server เปิดเผย",
      "เพิ่ม helmet security headers ให้ response ทั้งหมด",
      "เปิด CORS เฉพาะ allowlist และอนุญาต credentials สำหรับ refresh cookie",
      "ติดตั้ง auth rate limiter แยกจาก global API limiter",
      "ตั้งหน้าต่าง 15 นาทีสำหรับการโจมตีแบบ brute force",
      "จำกัด 10 requests ต่อ IP เป็น baseline ที่ต้องปรับตามผู้ใช้จริง",
      "ส่ง standard rate limit headers เพื่อ client ปรับพฤติกรรมได้",
      "ปิด legacy headers เพื่อไม่ซ้ำข้อมูล",
      "ปิด rate limit config",
      "ปิดฟังก์ชัน configureSecurity",
    ],
    'CORS ไม่ใช่ authentication; ยังต้องตรวจ token และ origin ของ state-changing cookie requests',
  ),
  defineSnippet(
    'security-refresh-token-schema',
    'database/refresh_tokens.sql',
    'sql',
    `USE authlab;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT,
  token_hash CHAR(64) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  KEY idx_refresh_user (user_id),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    [
      'เลือก database authlab เพื่อเพิ่ม table สำหรับ refresh token lifecycle',
      'เว้นบรรทัดก่อนสร้าง table',
      'สร้าง refresh_tokens หากยังไม่มี เพื่อรัน migration ซ้ำได้',
      'สร้าง id ใหญ่แบบ unsigned สำหรับ session จำนวนมาก',
      'เก็บ SHA-256 hash ของ refresh token ไม่เก็บ raw token ใน database',
      'เชื่อม refresh token กับ user id ที่มีจริง',
      'กำหนดเวลาหมดอายุแบบ absolute สำหรับตัดสิทธิ์เมื่อถึงกำหนด',
      'เก็บเวลาที่ revoke token รายการนี้เพื่อตรวจ rotation และ reuse',
      'บันทึกเวลาสร้างรายการโดยอัตโนมัติ',
      'กำหนด id เป็น primary key ของ refresh record',
      'เพิ่ม unique constraint ให้ hash หนึ่งไม่ถูกเก็บซ้ำ',
      'สร้าง index ที่ user_id เพื่อค้นหา token ของผู้ใช้เมื่อต้อง revoke ทั้งหมด',
      'เพิ่ม foreign key และลบ refresh tokens เมื่อผู้ใช้ถูกลบ',
      'เลือก InnoDB และ utf8mb4 ให้สอดคล้องกับตาราง users',
    ],
    'Migration ขยายตัวสำหรับ diploma; ไม่ต้องรันหากยังไม่ใช้ refresh-token flow',
  ),
  defineSnippet(
    'security-refresh-token-service',
    'auth-backend/src/services/refreshTokenService.js',
    'javascript',
    `import crypto from 'node:crypto';
import pool from '../db/pool.js';

const REFRESH_DAYS = 7;
const REFRESH_MAX_AGE = REFRESH_DAYS * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function issueRefreshToken(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE);
  await pool.execute(
    'INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [hashToken(token), userId, expiresAt],
  );
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function rotateRefreshToken(rawToken) {
  if (!rawToken) return null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1 FOR UPDATE',
      [hashToken(rawToken)],
    );
    const record = rows[0];
    if (!record || record.revoked_at || record.expires_at <= new Date()) {
      await connection.rollback();
      return null;
    }
    const [result] = await connection.execute(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL AND expires_at > NOW()',
      [record.id],
    );
    if (result.affectedRows !== 1) {
      await connection.rollback();
      return null;
    }
    await connection.commit();
    return record.user_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL', [hashToken(rawToken)]);
}`,
    [
      "นำเข้า crypto สำหรับสร้าง random token และคำนวณ hash แบบ one-way",
      "นำเข้า MySQL pool เพื่อบันทึกและ revoke refresh records",
      "เว้นบรรทัดแยก dependency ออกจาก configuration",
      "กำหนดอายุ refresh token 7 วันสำหรับตัวอย่างการฝึก",
      "แปลงอายุวันเป็น milliseconds เพื่อใช้ทั้ง cookie และ database",
      "เว้นบรรทัดก่อน helper",
      "ประกาศฟังก์ชัน hash token เพื่อไม่เก็บ raw token ในฐานข้อมูล",
      "คืน SHA-256 digest แบบ hex ความยาว 64 ตัวให้ตรงกับ CHAR(64)",
      "ปิด helper hashToken",
      "เว้นบรรทัดก่อน issue flow",
      "ส่งออกฟังก์ชันออก refresh token ใหม่โดยรับ response object และ user id",
      "สร้าง token สุ่ม 32 bytes แล้วแปลงเป็น hex string สำหรับ cookie",
      "คำนวณเวลาหมดอายุแบบ absolute จากเวลาปัจจุบัน",
      "เปิด pool.execute เพื่อ INSERT refresh record",
      "กำหนดคอลัมน์ token_hash, user_id และ expires_at พร้อม placeholder สามตัว",
      "ส่ง token hash แทน raw token และ user id เป็น parameters",
      "ปิด pool.execute พร้อมรอการบันทึก record",
      "เปิด res.cookie เพื่อส่ง refresh token กลับไปยัง browser",
      "ตั้ง HttpOnly cookie เพื่อ JavaScript ใน browser อ่าน token ไม่ได้",
      "เปิด Secure เฉพาะ production เพื่อ cookie เดินทางผ่าน HTTPS",
      "ใช้ SameSite=Lax เพื่อลดการส่ง cookie ข้าม site แต่ต้องตรวจ Origin เพิ่ม เพราะ cookie ไม่ถูกส่งบน cross-site POST โดยทั่วไป",
      "จำกัด cookie path ที่ /api/auth เท่านั้นเพื่อไม่ส่งไปยัง static files",
      "กำหนด maxAge ให้ cookie หมดอายุตามเดียวกับ database record",
      "ปิด cookie options",
      "ปิด issueRefreshToken function",
      "เว้นบรรทัดก่อน rotation",
      "ส่งออกฟังก์ชันตรวจและหมุน refresh token แบบ atomic",
      "คืน null ทันทีเมื่อ cookie ไม่มีเพื่อให้ route ตอบ 401",
      "ยืม connection จาก pool เพื่อให้ transaction ใช้ connection เดียวกัน",
      "เปิด try block สำหรับ transaction และ database errors",
      "เริ่ม transaction ก่อนอ่านและแก้ไข refresh record",
      "เปิด connection.execute เพื่อค้นหา record พร้อมรอผลลัพธ์",
      "SELECT ข้อมูลที่ต้องตรวจด้วย parameterized query และ FOR UPDATE เพื่อล็อกแถว",
      "ส่ง hash เป็น parameter ในการ query",
      "ปิด connection.execute และ destructure แถวผลลัพธ์",
      "อ่าน record แรวที่ query พบหรือ undefined",
      "ตรวจว่า record มีจริง ไม่ถูก revoke และยังไม่หมดอายุ",
      "rollback transaction ก่อนคืน null เพื่อไม่คง lock ไว้",
      "คืน null เมื่อ refresh token ใช้ไม่ได้",
      "ปิด if ของ token ที่ไม่ผ่านการตรวจ",
      "เปิด connection.execute สำหรับ UPDATE แบบมีเงื่อนไข",
      "ตั้ง revoked_at พร้อมตรวจ revoked_at IS NULL และ expires_at > NOW() อีกครั้ง",
      "ส่ง id เป็น parameter โดยไม่ concat ค่าเข้า SQL",
      "ปิด UPDATE พร้อมเก็บผลจำนวนแถวที่เปลี่ยนจริง",
      "ตรวจว่าการ revoke สำเร็จเพียงหนึ่ง record",
      "rollback เมื่อเงื่อนไข race ทำให้ไม่มีแถวผ่านการอัปเดต",
      "คืน null เมื่อไม่สามารถยืนยันการหมุน token ได้",
      "ปิด if ของผล UPDATE",
      "commit transaction เมื่อการ revoke สำเร็จเพื่อปล่อย lock ถาวร",
      "คืน user id เพื่อ controller สร้าง access token ใหม่",
      "เริ่ม catch เมื่อ database หรือ transaction ล้มเหลว",
      "rollback transaction ที่ยังไม่ commit ก่อนส่ง error ต่อ",
      "โยน error ต่อให้ route และ global handler จัดการ",
      "เริ่ม finally เพื่อคืน resource ในทุกเส้นทาง",
      "คืน connection ลง pool ทั้งสำเร็จและล้มเหลว",
      "ปิด finally block",
      "ปิด rotateRefreshToken function",
      "เว้นบรรทัดก่อน logout/revocation",
      "ส่งออกฟังก์ชัน revoke สำหรับ Log out หรือตรวจพบ token reuse",
      "ไม่ทำอะไรเมื่อไม่มี raw token เพราะไม่มีรายการให้ revoke",
      "UPDATE เฉพาะรายการที่ยังไม่ revoke ด้วย parameterized query",
      "ปิด revokeRefreshToken function",
    ],
    'Production ควร revoke token family ทั้งหมดเมื่อตรวจพบ reuse ของ token ที่หมุนแล้ว',
  ),
  defineSnippet(
    'security-refresh-routes',
    'auth-backend/src/routes/refreshRoutes.js',
    'javascript',
    `import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { signAccessToken } from '../utils/token.js';
import { issueRefreshToken, revokeRefreshToken, rotateRefreshToken } from '../services/refreshTokenService.js';

const router = Router();
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth' };

function requireTrustedOrigin(req, res, next) {
  const origin = req.get('origin');
  const allowedOrigins = (process.env.CLIENT_ORIGINS ?? '').split(',').map((item) => item.trim());
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ status: 'error', message: 'Origin ไม่อนุญาต', data: null });
  }
  return next();
}

router.post('/refresh', requireTrustedOrigin, cookieParser(), async (req, res, next) => {
  try {
    const userId = await rotateRefreshToken(req.cookies.refresh_token);
    if (!userId) {
      res.clearCookie('refresh_token', cookieOptions);
      return res.status(401).json({ status: 'error', message: 'ต้องเข้าสู่ระบบใหม่', data: null });
    }
    await issueRefreshToken(res, userId);
    const token = signAccessToken({ id: userId });
    return res.status(200).json({ status: 'success', message: 'ต่ออายุ access token สำเร็จ', data: { token } });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', requireTrustedOrigin, cookieParser(), async (req, res, next) => {
  try {
    await revokeRefreshToken(req.cookies.refresh_token);
    res.clearCookie('refresh_token', cookieOptions);
    return res.status(200).json({ status: 'success', message: 'ออกจากระบบสำเร็จ', data: null });
  } catch (error) {
    return next(error);
  }
});

export default router;`,
    [
      "นำเข้า Router สำหรับแยก refresh และ logout routes",
      "นำเข้า cookie-parser ที่ติดตั้งในบท Setup เพื่ออ่าน refresh_token จาก Cookie header",
      "นำเข้า signAccessToken เพื่อออก access token สั้นหลัง rotate สำเร็จ",
      "นำเข้า service ที่ดูแลการออก หมุน และ revoke refresh token",
      "เว้นบรรทัดก่อนสร้าง router",
      "สร้าง router instance สำหรับเมานต์ใต้ /api/auth",
      "กำหนด cookie options เหมือนตอนออก token รวม HttpOnly, Secure, SameSite และ path เพื่อ clearCookie ตรงกัน",
      "เว้นบรรทัดก่อน middleware ตรวจ Origin",
      "ประกาศ middleware สำหรับคำขอที่เปลี่ยนสถานะโดยใช้ cookie",
      "อ่าน Origin header ที่ browser แนบมา",
      "แยก CLIENT_ORIGINS เป็น allowlist และ trim ค่าแต่ละ origin",
      "ปฏิเสธ Origin ที่ส่งมาและไม่อยู่ใน allowlist",
      "ตอบ 403 ก่อนอ่านหรือเปลี่ยน refresh token เมื่อ Origin ไม่เชื่อถือ",
      "ปิด if ของ Origin ที่ไม่อนุญาต",
      "อนุญาตให้ไปต่อเมื่อไม่มี Origin หรือ Origin ตรง allowlist",
      "ปิด requireTrustedOrigin middleware",
      "เว้นบรรทัดก่อน refresh route",
      "เปิด POST /refresh โดยตรวจ Origin และอ่าน cookie ก่อน handler",
      "เริ่ม try block สำหรับ database errors ของ rotation",
      "อ่าน cookie แล้วตรวจ expiry/revocation และ revoke token เก่าแบบ atomic",
      "ตรวจ userId ที่ service คืนมาเมื่อ refresh token ใช้ไม่ได้",
      "ล้าง cookie ที่ไม่สามารถใช้งานต่อได้",
      "ส่ง generic message ให้ client กลับไป Login",
      "ปิด if ของ refresh token ที่ไม่ถูกต้อง",
      "ออก refresh token ใหม่และตั้ง cookie หลัง rotate สำเร็จ",
      "สร้าง access token 15 นาทีจาก user id ที่ยืนยันแล้ว",
      "ตอบ 200 พร้อม access token ใน JSON แต่ไม่ส่ง refresh token ให้ JavaScript",
      "เริ่ม catch เมื่อ service หรือการออก token ล้มเหลว",
      "ส่ง error ต่อไป global handler",
      "ปิด catch ของ refresh route",
      "ปิด refresh handler",
      "เว้นบรรทัดก่อน logout route",
      "เปิด POST /logout พร้อมตรวจ Origin และ cookieParser",
      "เริ่ม try block สำหรับการ revoke",
      "revoke refresh record ก่อนตอบว่าออกจากระบบสำเร็จ",
      "ล้าง cookie ด้วย options เดียวกันกับตอนออก token",
      "ตอบ 200 ด้วย response shape มาตรฐานและ data null",
      "เริ่ม catch เมื่อการ revoke ล้มเหลว",
      "ส่ง error ต่อ global handler หาก database ล้มเหลว",
      "ปิด catch",
      "ปิด logout handler",
      "เว้นบรรทัดก่อน export",
      "ส่ง router ไปให้ app.js เมานต์ที่ /api/auth ตาม snippet ถัดไป",
    ],
    'SameSite=Lax ไม่ส่ง cookie บน cross-site POST โดยทั่วไป แต่ไม่ใช่การ์ดรวม; ตัวอย่างนี้เพิ่ม Origin allowlist และยังควรพิจารณา CSRF token สำหรับระบบที่ต้องการ defense เพิ่ม',
  ),
  defineSnippet(
    'security-review-checklist',
    'security/production-review.txt',
    'text',
    `ตรวจ password ด้วย bcrypt เท่านั้น
ตรวจ SQL ทุก query ว่าใช้ parameterized query
ตรวจ Login error เป็นข้อความเดียวกัน
ตรวจ JWT_SECRET มาจาก secret manager
ตรวจ access token หมดอายุและ rotate refresh token
ตรวจ refresh cookie เป็น HttpOnly, Secure, SameSite
ตรวจ CORS allowlist และ CSRF protection
ตรวจ rate limit ทั้ง login และ refresh
ตรวจ input validation บน server
ตรวจ log ไม่มี password, token หรือ cookie
ตรวจ dependency และ image vulnerabilities
ตรวจ Demo ใน browser ว่าไม่ใช่ production auth`,
    [
      'ยืนยันว่าไม่มี plaintext password หรืออัลกอริทึม hash เก่าในฐานข้อมูล',
      'ตรวจ model ว่าทุกค่าจาก request ถูกส่งเป็น parameter ไม่เคย concat กับ SQL',
      'เปิด Login ด้วยอีเมลผิดและรหัสผิด แล้วเทียบ message/status ให้เหมือนกัน',
      'ยืนยันว่า production ไม่มี fallback secret และค่าจริงไม่อยู่ใน repo',
      'ตรวจ expiry, rotation และแนวทาง revoke token เมื่อ reuse ถูกพบ',
      'ตรวจคุณสมบัติ cookie trio เพื่อลด XSS/CSRF และการส่งข้าม HTTP',
      'ตรวจ CORS allowlist รวมถึง Origin/CSRF token สำหรับ state-changing requests',
      'จำกัด request ทั้ง login, register และ refresh เพื่อลด brute force',
      'ตรวจ express-validator และ business rules บน server ไม่พึ่ง browser',
      'ตรวจ logging และ error tracking เพื่อไม่สะสม credential หรือ session token',
      'สแกน dependency, Docker image และฐานข้อมูลก่อน deploy',
      'ยืนยันว่าสิ่งที่สอนใน browser Demo ใช้สำหรับการเรียนรู้ ไม่ใช่ production auth',
    ],
    'ทำ checklist นี้ก่อน production review และเก็บหลักฐานการตรวจแต่ละข้อ',
  ),
  defineSnippet(
    'security-refresh-app',
    'auth-backend/src/app.js',
    'javascript',
    `import 'dotenv/config';
import express from 'express';
import { configureSecurity } from './app.security.js';
import authRoutes from './routes/authRoutes.js';
import refreshRoutes from './routes/refreshRoutes.js';

const app = express();
configureSecurity(app);
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API พร้อมใช้งาน', data: { service: 'authlab' } });
});
app.use('/api/auth', authRoutes);
app.use('/api/auth', refreshRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'ไม่พบ endpoint ที่ร้องขอ', data: null });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', data: null });
});

export default app;`,
    [
      'โหลด environment ก่อนอ่านค่าความปลอดภัยและการเชื่อมต่อ',
      'นำเข้า Express สำหรับสร้าง application instance',
      'นำเข้า configureSecurity เพื่อติดตั้ง Helmet, CORS credentials และ rate limit',
      'นำเข้า authRoutes สำหรับ Register, Login และ /me ที่สร้างไว้แล้ว',
      'นำเข้า refreshRoutes สำหรับ rotation และ logout ในบทนี้',
      'เว้นบรรทัดแยก dependency ออกจากการสร้าง app',
      'สร้าง Express app ใหม่โดยไม่เปิด listener ในไฟล์นี้',
      'เรียก configureSecurity ก่อน routes เพื่อให้ security middleware ครอบคลุมทุก request',
      'อ่าน JSON body พร้อมจำกัดขนาด 16kb',
      'เว้นบรรทัดก่อน health endpoint',
      'สร้าง GET /api/health สำหรับตรวจ process',
      'ตอบ JSON พื้นฐานโดยไม่เปิดเผย configuration',
      'ปิด health callback',
      'เมานต์ auth routes ใต้ /api/auth เช่นเวอร์ชันบท Backend',
      'เมานต์ refresh routes ใต้ prefix เดียวกันเพื่อได้ /api/auth/refresh และ /logout',
      'เว้นบรรทัดแยก routes ที่รู้จักออกจาก fallback',
      'เพิ่ม fallback สำหรับ endpoint ที่ไม่พบ',
      'ตอบ 404 ด้วย envelope เดียวกัน',
      'ปิด fallback callback',
      'เว้นบรรทัดก่อน error handler',
      'ประกาศ Express error handler สี่อาร์กิวเมนต์',
      'บันทึก error ฝั่ง server โดยไม่ log request body หรือ cookie',
      'ตอบ 500 ทั่วไปและไม่ส่ง stack trace ให้ client',
      'ปิด error handler',
      'เว้นบรรทัดก่อนส่งออก app',
      'ส่ง app instance ให้ server.js เปิด listener และจัดการ shutdown',
    ],
    'แทนที่ app.js เมื่อเปิดใช้ Security level; ตั้ง CLIENT_ORIGINS ให้มี origin จริงของ Frontend และ cookie-parser ติดตั้งแล้วจากบท Setup',
  ),
];

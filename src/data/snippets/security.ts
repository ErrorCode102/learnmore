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
      'นำเข้า helmet, cors และ rateLimit สำหรับเสริม configuration ใน app.js',
      'เว้นบรรทัดก่อนฟังก์ชัน config',
      'ส่งออกฟังก์ชันที่รับ Express app แล้วติดตั้ง security middleware',
      'อ่าน origin allowlist จาก env โดยไม่ hardcode โปรเจกต์ production',
      'แยก string ด้วย comma เพื่อรองรับเว็บไซต์หลาย origin',
      'ตัด whitespace รอบ origin เพื่อหลีกเลี่ยงค่าที่ไม่ตรง',
      'กรองค่าว่างออกเพื่อไม่เพิ่ม origin ที่อันตรายโดยไม่ตั้งใจ',
      'เว้นบรรทัดก่อนการติดตั้ง middleware',
      'ปิด header X-Powered-By เพื่อลดข้อมูล technology ที่ server เปิดเผย',
      'เพิ่ม helmet security headers ให้ response ทั้งหมด',
      'เปิด CORS เฉพาะ allowlist และอนุญาต credentials สำหรับ refresh cookie',
      'ติดตั้ง auth rate limiter แยกจาก global API limiter',
      'ตั้งหน้าต่าง 15 นาทีสำหรับการโจมตีแบบ brute force',
      'จำกัด 10 requests ต่อ IP เป็น baseline ที่ต้องปรับตามผู้ใช้จริง',
      'ส่ง standard rate limit headers เพื่อ client ปรับพฤติกรรมได้',
      'ปิด legacy headers เพื่อไม่ซ้ำข้อมูล',
      'ปิด rate limit config',
      'ปิดฟังก์ชัน configureSecurity',
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
  const [rows] = await pool.execute(
    'SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
    [hashToken(rawToken)],
  );
  const record = rows[0];
  if (!record || record.revoked_at || record.expires_at <= new Date()) return null;
  await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [record.id]);
  return record.user_id;
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  await pool.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL', [hashToken(rawToken)]);
}`,
    [
      'นำเข้า crypto สำหรับสร้าง random token และคำนวณ hash แบบ one-way',
      'นำเข้า MySQL pool เพื่อบันทึกและ revoke refresh records',
      'กำหนดอายุ refresh token 7 วันสำหรับตัวอย่างการฝึก',
      'แปลงอายุวันเป็น milliseconds เพื่อใช้ทั้ง cookie และ database',
      'เว้นบรรทัดก่อน helper',
      'ประกาศฟังก์ชัน hash token เพื่อไม่เก็บ raw token ในฐานข้อมูล',
      'สร้าง SHA-256 digest แบบ hex จาก token ที่ได้จาก cookie',
      'คืน hash คงที่ความยาว 64 ตัวให้ตรงกับ CHAR(64)',
      'เว้นบรรทัดก่อน issue flow',
      'ส่งออกฟังก์ชันออก refresh token ใหม่โดยรับ response object และ user id',
      'สร้าง token สุ่ม 32 bytes ด้วย cryptographic RNG',
      'แปลง bytes เป็น hex string ที่ปลอดภัยในการส่งผ่าน cookie',
      'คำนวณเวลาหมดอายุแบบ absolute จากเวลาปัจจุบัน',
      'INSERT hash, user id และ expiry ด้วย parameterized query',
      'ส่ง token hash แทน raw token และ user id เป็น parameters',
      'ตั้ง HttpOnly cookie เพื่อ JavaScript ใน browser อ่าน token ไม่ได้',
      'เปิด Secure เฉพาะ production เพื่อ cookie เดินทางผ่าน HTTPS',
      'ใช้ SameSite=Lax เพื่อลด CSRF ข้าม site สำหรับคำขอ POST',
      'จำกัด cookie path ที่ /api/auth เท่านั้นเพื่อไม่ส่งไปยัง static files',
      'กำหนด maxAge ให้ cookie หมดอายุตามเดียวกับ database record',
      'ปิด cookie options',
      'ปิด issueRefreshToken function',
      'เว้นบรรทัดก่อน rotation',
      'ส่งออกฟังก์ชันตรวจและหมุน refresh token',
      'คืน null ทันทีเมื่อ cookie ไม่มีเพื่อให้ route ตอบ 401',
      'ค้นหา refresh record ด้วย hash แทน raw token',
      'SELECT expiry และ revoked_at เพื่อตรวจสิทธิ์ก่อนออก token ใหม่',
      'ส่ง hash เป็น parameter ในการ query',
      'อ่าน record แรวที่ query พบหรือ undefined',
      'ปฏิเสธ token ที่ไม่มี ถูก revoke หรือหมดอายุ',
      'บันทึก revoked_at ของ token เก่าก่อนออก token ใหม่',
      'ส่ง record id เป็น parameter ของ UPDATE',
      'คืน user id เพื่อ controller สร้าง access token ใหม่',
      'ปิด rotateRefreshToken function',
      'เว้นบรรทัดก่อน logout/revocation',
      'ส่งออกฟังก์ชัน revoke สำหรับ Log out หรือตรวจพบ token reuse',
      'ไม่ทำอะไรเมื่อไม่มี raw token เพราะไม่มีรายการให้ revoke',
      'UPDATE เฉพาะรายการที่ยังไม่ revoke ด้วย parameterized query',
      'ปิด revokeRefreshToken function',
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

router.post('/refresh', cookieParser(), async (req, res, next) => {
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

router.post('/logout', cookieParser(), async (req, res, next) => {
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
      'นำเข้า Router สำหรับแยก refresh และ logout routes',
      'นำเข้า cookie-parser เพื่ออ่าน refresh_token จาก Cookie header อย่างปลอดภัย',
      'นำเข้า signAccessToken เพื่อออก access token สั้นหลัง rotate สำเร็จ',
      'นำเข้า service ที่ดูแลการออก หมุน และ revoke refresh token',
      'เว้นบรรทัดก่อนสร้าง router',
      'สร้าง router instance สำหรับเมานต์ใต้ /api/auth',
      'กำหนด cookie options เดียวกันสำหรับ clearCookie เพื่อให้ path/domain ตรงกัน',
      'เปิด HttpOnly option ใน clearCookie config',
      'กำหนด Secure ตาม production mode',
      'กำหนด SameSite=Lax ให้ตรงกับ cookie ที่ออกไว้',
      'จำกัด path ของ cookie ที่ /api/auth',
      'เว้นบรรทัดก่อน refresh route',
      'เปิด POST /refresh และใช้ cookieParser เฉพาะ route นี้',
      'เริ่ม try block สำหรับ database errors ของ rotation',
      'อ่าน cookie แล้วตรวจ expiry/revocation และ revoke token เก่า',
      'ตอบ 401 เมื่อ refresh token ไม่ถูกต้องหรือถูกใช้แล้ว',
      'ล้าง cookie ที่ไม่สามารถใช้งานต่อได้',
      'ส่ง generic message ให้ client กลับไป Login',
      'ออก refresh token ใหม่และตั้ง cookie หลัง rotate สำเร็จ',
      'สร้าง access token 15 นาทีจาก user id ที่ยืนยันแล้ว',
      'ตอบ 200 พร้อม access token ใน JSON แต่ไม่ส่ง refresh token ให้ JavaScript',
      'จับ error ของ service แล้วส่งต่อไป global handler',
      'ปิด refresh handler',
      'เว้นบรรทัดก่อน logout route',
      'เปิด POST /logout พร้อม cookieParser',
      'เริ่ม try block สำหรับการ revoke',
      'revoke refresh record ก่อนตอบว่าออกจากระบบสำเร็จ',
      'ล้าง cookie ด้วย options เดียวกันกับตอนออก token',
      'ตอบ 200 ด้วย response shape มาตรฐานและ data null',
      'ส่ง error ต่อ global handler หาก database ล้มเหลว',
      'ปิด logout handler',
      'เว้นบรรทัดก่อน export',
      'ส่ง router ไปเมานต์ใน app หลัง npm install cookie-parser',
    ],
    'Concept นี้ยังต้องเพิ่ม CSRF token/Origin check และ revoke family เมื่อ reuse ถูกตรวจพบ',
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
];

import { defineSnippet } from './defineSnippet';

export const backendSnippets = [
  defineSnippet(
    'backend-mysql-pool',
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
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'UTF8MB4_GENERAL_CI',
});

export default pool;`,
    [
      'โหลด environment variables ก่อนสร้างการเชื่อมต่อฐานข้อมูล',
      'นำเข้า mysql2/promise เพื่อใช้ async/await กับ query ทั้งหมด',
      'เว้นบรรทัดเพื่อแยกส่วนนำเข้า module ออกจากการสร้าง pool ให้อ่านง่าย',
      'สร้าง pool ที่แชร์ connection ระหว่าง request แทนการเปิดใหม่ทุกครั้ง',
      'อ่าน host ของ MySQL จาก env พร้อม localhost สำหรับเครื่องพัฒนา',
      'แปลง port เป็น number และใช้ 3306 หากไม่กำหนดค่า',
      'อ่านชื่อผู้ใช้จาก env โดยไม่ยัด credential ลงใน source code',
      'อ่านรหัสผ่านจาก env เพื่อไม่เปิดเผยข้อมูลในการ commit',
      'เลือก database authlab ให้ตรงกับ schema ที่สร้างไว้',
      'เมื่อ connection เต็มให้ request รอคิวแทนจะล้มเหลวทันที',
      'จำกัด pool ที่ 10 connections เพื่อไม่ทำให้ MySQL รับภาระเกินควบคุม',
      'ใช้ queueLimit 0 เพื่อไม่จำกัดจำนวนคิว ใน production ควรปรับตาม resource ที่มีจริง',
      'กำหนด charset utf8mb4 ให้ข้อมูลไทยและ emoji ถูกส่งผ่าน connection อย่างถูกต้อง',
      'ปิด createPool พร้อมส่ง object การตั้งค่าให้ pool ถูกสร้าง',
      'เว้นบรรทัดก่อน export เพื่อแยก configuration ออกจากส่วนส่งออก',
      'ส่ง pool instance ให้ model และ shutdown process ใช้งานร่วมกัน',
    ],
    'Pool จะถูกใช้จริงเมื่อเริ่ม register; ตรวจ connection ด้วยการเรียก /api/health และ query schema',
  ),
  defineSnippet(
    'backend-password-policy',
    'auth-backend/src/utils/passwordPolicy.js',
    'javascript',
    `export function isPasswordStrongEnough(value) {
  if (typeof value !== 'string') return false;
  if (value.length < 8 || value.length > 72) return false;
  if (Buffer.byteLength(value, 'utf8') > 72) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  if (!/[^A-Za-z0-9]/.test(value)) return false;
  return true;
}

export const passwordPolicyMessage =
  'รหัสผ่านต้องมี 8–72 ตัว อักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ';`,
    [
      'ส่งออก pure function เพื่อนำไปใช้ทั้ง validation และ Vitest โดยไม่ผูก database',
      'ปฏิเสธค่าที่ไม่ใช่ string ก่อนเข้าถึง property ของ input',
      'บังคับความยาวขั้นต่ำ 8 และไม่เกิน 72 ตัวอักษร',
      'นับ byte ของ UTF-8 เพื่อไม่ให้ bcrypt รับข้อมูลเกินขีดจำกัด 72 bytes',
      'ต้องการตัวอักษรพิมพ์เล็กอย่างน้อยหนึ่งตัวเพื่อเพิ่มความหลากหลาย',
      'ต้องการตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัวเช่นเดียวกับกรณีก่อนหน้า',
      'ต้องการตัวเลขอย่างน้อยหนึ่งตัวเพื่อให้รหัสผ่านไม่เป็นคำง่าย',
      'ต้องการอักขระพิเศษอย่างน้อยหนึ่งตัวนอกชุดอักษรและตัวเลข',
      'คืน true ก็ต่อเมื่อผ่านทุกกฎและไม่มี early return',
      'ปิดฟังก์ชันหลังสรุปผลการตรวจทั้งหมด',
      'เว้นบรรทัดเพื่อแยก logic การตรวจจากข้อความที่ส่งให้ผู้ใช้',
      'ส่งออกข้อความภาษาไทยแบบเดียวกันสำหรับ validation error',
      'อธิบายเงื่อนไข 8–72 ตัวและการมีสี่กลุ่มอักขระให้ผู้ใช้แก้ไขได้',
    ],
    'นี่เป็นนโยบายตัวอย่าง; production อาจเพิ่ม blocklist โดยไม่ลดข้อความ error ให้คล้ายทั่วไป',
  ),
  defineSnippet(
    'backend-user-model',
    'auth-backend/src/models/userModel.js',
    'javascript',
    `import pool from '../db/pool.js';

export async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, email, created_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser(email, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash],
  );
  return result.insertId;
}

export async function deleteUserById(id) {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}`,
    [
      'นำเข้า pool จากโมดูล database เพื่อให้ model เป็นผู้มีหน้าที่เรียก SQL ของผู้ใช้',
      'เว้นบรรทัดก่อนฟังก์ชันเพื่อแยก dependency ออกจากนิยามฟังก์ชัน',
      'ประกาศฟังก์ชันค้นหาผู้ใช้จาก email สำหรับขั้นตอน Register และ Login',
      'เปิด pool.execute ที่คืน promise และ destructure ชุดแถวจากผลลัพธ์',
      'ส่ง SELECT แบบ parameterized โดยเลือก identity fields, password_hash สำหรับ Login และ created_at สำหรับ response',
      'ส่ง email เป็นค่า parameter ที่ mysql2 escape และ quote ให้อย่างปลอดภัย',
      'ปิด pool.execute พร้อมส่ง argument ทั้ง query และค่า parameter',
      'คืนผู้ใช้แรกหรือ null เมื่อไม่พบแถวที่ตรงกัน',
      'ปิดฟังก์ชันค้นหาด้วย email ให้ caller ใช้ต่อได้',
      'เว้นบรรทัดเพื่อแยกการค้นหาด้วย email ออกจากการค้นหาด้วย id',
      'ประกาศฟังก์ชันอ่านข้อมูลผู้ใช้สำหรับ protected /me endpoint',
      'เปิด query อ่านผู้ใช้ด้วย id พร้อมรอผลลัพธ์แบบ asynchronous',
      'เลือกเฉพาะคอลัมน์ที่ปลอดภัย ไม่รวม password_hash ออกจาก response',
      'ส่ง id ที่ได้จาก verified JWT เป็น parameter ของ query',
      'ปิด pool.execute สำหรับ query อ่านผู้ใช้ด้วย id',
      'คืนข้อมูลผู้ใช้หรือ null หาก token ยังอยู่แต่ผู้ใช้ถูกลบ',
      'ปิดฟังก์ชัน findById เพื่อแยกการทำงานจากฟังก์ชันถัดไป',
      'เว้นบรรทัดเพื่อแยก query อ่านออกจากการสร้างผู้ใช้',
      'ประกาศฟังก์ชัน insert ผู้ใช้โดยรับ hash ที่ controller สร้างแล้ว',
      'เปิด INSERT แบบ parameterized พร้อมรอผลลัพธ์จาก MySQL',
      'กำหนดสองคอลัมน์ email และ password_hash พร้อม placeholder สองตัว',
      'ส่งค่า email กับ hash แยกจาก SQL เพื่อป้องกัน SQL injection',
      'ปิด pool.execute สำหรับ INSERT แล้วเก็บ result ไว้อ่าน insertId',
      'อ่าน insertId ที่ MySQL สร้างจาก AUTO_INCREMENT',
      'คืน id ของผู้ใช้ใหม่เพื่อ controller ใส่ไว้ใน JWT และ response และปิดฟังก์ชัน',
      'เว้นบรรทัดแยกการสร้างผู้ใช้ออกจากฟังก์ชัน cleanup',
      'ประกาศฟังก์ชันลบผู้ใช้ตาม id สำหรับชดเชยเมื่อ Register สร้างข้อมูลแล้วแต่ออก refresh token ไม่สำเร็จ',
      'ส่ง DELETE แบบ parameterized เพื่อลบเฉพาะผู้ใช้ที่ request นี้สร้าง',
      'foreign key จะลบ refresh records ที่ผูกกับผู้ใช้ที่ถูกลบโดยอัตโนมัติ',
    ],
    'Model ไม่รับ plaintext password และไม่ส่ง hash กลับไปที่ Frontend; deleteUserById ใช้ cleanup เมื่อ initial refresh issuance ล้มเหลว',
  ),
  defineSnippet(
    'backend-auth-validation',
    'auth-backend/src/middleware/validateAuth.js',
    'javascript',
    `import { body } from 'express-validator';
import { isPasswordStrongEnough, passwordPolicyMessage } from '../utils/passwordPolicy.js';

export const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('กรุณาใส่อีเมลที่ถูกต้อง')
    .isLength({ max: 255 })
    .withMessage('อีเมลต้องไม่เกิน 255 ตัวอักษร'),
  body('password')
    .custom(isPasswordStrongEnough)
    .withMessage(passwordPolicyMessage),
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),
  body('password')
    .notEmpty()
    .withMessage('กรุณาใส่รหัสผ่าน'),
];`,
    [
      'นำเข้า body validator เพื่อตรวจเฉพาะ fields ที่ route รับจาก JSON body',
      'นำเข้า pure password policy และข้อความภาษาไทยจาก utils',
      'เว้นบรรทัดเพื่อแยก imports ออกจาก validation chains',
      'ส่งออก middleware array สำหรับ endpoint Register',
      'เริ่มตรวจ field email ของ request body',
      'ตัด whitespace หน้าและท้ายอีเมลก่อนตรวจสอบ',
      'ตรวจรูปแบบอีเมลเพื่อลดค่าที่ไม่สามารถใช้ติดต่อได้',
      'กำหนดข้อความ error ภาษาไทยเมื่อรูปแบบอีเมลไม่ถูกต้อง',
      'จำกัด email ไม่เกิน 255 ตัวให้ตรงกับ VARCHAR ในตาราง users',
      'กำหนดข้อความ error เมื่ออีเมลยาวเกิน schema',
      'เริ่มตรวจ password โดยเชื่อมต่อ custom policy ที่มีชื่อชัดเจน',
      'ตรวจ password ด้วย pure function เพื่อให้กฎตรงกับ unit test',
      'ส่งข้อความ policy ที่อธิบายวิธีแก้รหัสผ่านได้ชัดเจน',
      'ปิด array ของ validation Register เพื่อ Express เรียกตามลำดับ',
      'เว้นบรรทัดเพื่อแยก validation ของ Register ออกจาก Login',
      'ส่งออก middleware array สำหรับ endpoint Login',
      'ตรวจ email ของ Login แบบ trimmed เช่นเดียวกับ Register',
      'เริ่ม chain ตรวจรูปแบบ email สำหรับ Login',
      'ใช้ข้อความ error เมื่อ Login ไม่มีอีเมลรูปแบบถูกต้อง',
      'เริ่ม chain ตรวจ password สำหรับ Login',
      'ตรวจเพียงว่ารหัสผ่านไม่ว่าง ไม่ใช้ policy ใหม่เพราะต้องรับรหัสเก่าที่เคยสมัคร',
      'บอกผู้ใช้ให้กรอกรหัสผ่านโดยไม่เปิดเผยว่าบัญชีหรือรหัสผิด',
      'ปิด chain ของ password เพื่อจบ validator ตัวนี้ก่อนปิด array',
      'ปิด array ของ validation Login เพื่อส่งให้ route ใช้งาน',
    ],
    'Validation อยู่บน server เสมอ; การตรวจใน browser เป็นเพียงความสะดวก',
  ),
  defineSnippet(
    'backend-access-token',
    'auth-backend/src/utils/token.js',
    'javascript',
    `import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET ต้องมีความยาวอย่างน้อย 32 ตัวอักษร');
  }
  return secret;
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id) },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m', algorithm: 'HS256', issuer: 'authlab', audience: 'authlab-client' },
  );
}`,
    [
      'นำเข้า jsonwebtoken สำหรับสร้าง signed JWT ด้วย secret จาก environment',
      'เว้นบรรทัดเพื่อแยก dependency ออกจาก helper อ่าน configuration',
      'ประกาศและส่งออกฟังก์ชันอ่าน secret เพื่อให้ middleware ใช้ตรวจ configuration ก่อน verify token',
      'อ่าน JWT_SECRET จาก process.env ไม่ใช้ fallback ที่คาดเดาได้',
      'ปฏิเสธ secret ที่ว่างหรือสั้นกว่า 32 ตัวเพื่อลดการ guess',
      'โยน error ให้ server ไม่เริ่มออก token ด้วย configuration ที่อ่อนเกินไป',
      'ปิด if หลังจัดการ configuration ที่ไม่ปลอดภัยแล้วเตรียมคืนค่า',
      'คืน secret ที่ผ่านการตรวจเพื่อส่งให้ jwt.sign',
      'ปิดฟังก์ชันอ่าน secret เพื่อไม่ให้ caller กำหนดขั้นตอนสร้าง token ซ้ำ',
      'เว้นบรรทัดเพื่อแยก configuration ออกจากการสร้าง token',
      'ส่งออกฟังก์ชัน sign ที่รับข้อมูลผู้ใช้ minimal',
      'เปิด jwt.sign พร้อม payload, secret และ options ที่ควบคุมความปลอดภัย',
      'ใส่ user id ใน claim sub และแปลงเป็น string ตาม JWT subject standard',
      'อ่าน secret ที่ตรวจแล้วผ่าน getJwtSecret แทนการอ่าน env ตรง ๆ',
      'กำหนดอายุ 15m, algorithm HS256, issuer และ audience เพื่อให้ verify ตรวจกลับได้',
      'ปิด jwt.sign เพื่อสร้าง token string จากพารามิเตอร์ด้านบน',
      'คืน access token ที่ลงนามแล้วให้ controller ตอบกลับและปิดฟังก์ชัน',
    ],
    'ค่าวันหมดอายุต้องตั้งผ่าน .env; ห้าม commit secret จริงหรือ log token',
  ),
  defineSnippet(
    'backend-auth-middleware',
    'auth-backend/src/middleware/auth.js',
    'javascript',
    `import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/token.js';

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ status: 'error', message: 'ต้องเข้าสู่ระบบก่อน', data: null });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'authlab',
      audience: 'authlab-client',
    });
    req.user = { id: Number(payload.sub) };
    return next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'ต้องเข้าสู่ระบบก่อน', data: null });
  }
}`,
    [
      'นำเข้า jwt.verify สำหรับตรวจลายเซ็นและอายุของ access token',
      'นำเข้า getJwtSecret ที่ปิดกัดการใช้งาน secret ที่ว่างหรืออ่อน',
      'เว้นบรรทัดเพื่อแยก dependency ออกจาก middleware',
      'ส่งออก middleware ที่บังคับ auth ก่อนให้ route ทำงาน',
      'อ่าน Authorization header และใช้ string ว่างเมื่อ client ไม่ส่งมา',
      'แยก scheme กับ token ด้วยช่องว่างตามรูปแบบ Bearer <token>',
      'เว้นบรรทัดเพื่อแยกการอ่าน header ออกจากการตรวจรูปแบบ',
      'เริ่มเงื่อนไขตรวจ scheme และการมีอยู่ของ token',
      'ปฏิเสธ header ที่ไม่ใช่ Bearer หรือไม่มี token ด้วยสถานะ 401',
      'ตอบ JSON shape เดียวกันโดยไม่บอกว่า token หมดอายุหรือลายเซ็นผิด',
      'ปิด if หลังคืน response เพื่อไม่รัน verification ต่อ',
      'เว้นบรรทัดเพื่อแยก input validation ออกจาก cryptographic verification',
      'เปิด jwt.verify พร้อม secret และ options ที่จำกัดการยืนยัน',
      'อนุญาตเฉพาะ algorithm HS256 เพื่อไม่ยอมรับวิธีอื่นที่ไม่ได้กำหนด',
      'กำหนด issuer authlab ให้ตรงกับ token ที่ออกจากระบบนี้',
      'กำหนด audience authlab-client เพื่อแยก token สำหรับ client นี้',
      'ปิด options ของ jwt.verify',
      'อ่าน subject จาก verified payload และแปลงเป็น id ตัวเลข',
      'แนบ user id เข้า req เพื่อ controller ใช้โดยไม่เชื่อม userId จาก body',
      'อนุญาตให้ request ผ่านไปยัง route ถัดไปเมื่อ verify สำเร็จ',
      'จับ error ทั้งหมดสำหรับ token ที่ผิด หมดอายุหรือ config ไม่ถูกต้อง',
      'ตอบ 401 ด้วยข้อความทั่วไปเพื่อไม่เปิดเผยรายละเอียดการยืนยัน',
      'ปิด catch เพื่อสิ้นสุด middleware และปิดฟังก์ชัน',
    ],
    'JWT ไม่ได้ encrypt ข้อมูล; ห้ามเก็บ password หรือ secret ใน payload',
  ),
  defineSnippet(
    'backend-auth-controller',
    'auth-backend/src/controllers/authController.js',
    'javascript',
    `import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { createUser, findByEmail, findById } from '../models/userModel.js';
import { signAccessToken } from '../utils/token.js';

function publicUser(user) {
  return { id: user.id, email: user.email, created_at: user.created_at ?? null };
}

export async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'error',
      message: 'ข้อมูลที่กรอกไม่ถูกต้อง',
      data: { errors: errors.array().map((error) => ({ field: error.path, message: error.msg })) },
    });
  }

  const email = req.body.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(req.body.password, 12);

  try {
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'อีเมลนี้ถูกใช้งานแล้ว', data: null });
    }
    const id = await createUser(email, passwordHash);
    const token = signAccessToken({ id });
    return res.status(201).json({
      status: 'success',
      message: 'สมัครสมาชิกสำเร็จ',
      data: { token, user: publicUser({ id, email }) },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'อีเมลนี้ถูกใช้งานแล้ว', data: null });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', message: 'ข้อมูลที่กรอกไม่ถูกต้อง', data: null });
  }

  const email = req.body.email.trim().toLowerCase();
  const user = await findByEmail(email);
  const validPassword = user ? await bcrypt.compare(req.body.password, user.password_hash) : false;

  if (!user || !validPassword) {
    return res.status(401).json({ status: 'error', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', data: null });
  }

  const token = signAccessToken({ id: user.id });
  return res.status(200).json({
    status: 'success',
    message: 'เข้าสู่ระบบสำเร็จ',
    data: { token, user: publicUser(user) },
  });
}

export async function me(req, res, next) {
  const user = await findById(req.user.id);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'ไม่พบผู้ใช้ที่เข้าสู่ระบบ', data: null });
  }
  return res.status(200).json({ status: 'success', message: 'อ่านข้อมูลผู้ใช้สำเร็จ', data: { user } });
}`,
    [
      'นำเข้า bcryptjs สำหรับ hash และ compare password แบบ asynchronous',
      'นำเข้า validationResult เพื่ออ่านผลตรวจสอบ input ที่ middleware บันทึกไว้',
      'นำเข้า model สามฟังก์ชันสำหรับค้นหาและสร้างผู้ใช้',
      'นำเข้า signAccessToken เพื่อออก token หลังยืนยันตัวตนสำเร็จ',
      'เว้นบรรทัดเพื่อแยก dependency ออกจาก helper ของ controller',
      'ประกาศ helper ที่เลือกเฉพาะ field ที่ปลอดภัยจะแสดงให้ client',
      'คืน id, email และเวลาสร้าง โดยไม่รวม password_hash',
      'ปิด helper publicUser ที่จำกัดข้อมูลผู้ใช้ใน response',
      'เว้นบรรทัดเพื่อแยก helper ออกจาก Register handler',
      'ส่งออก asynchronous controller สำหรับ POST /api/auth/register',
      'รวบรวม validation errors จาก request นี้โดยไม่ panic เมื่อข้อมูลผิด',
      'ตรวจว่ามี error หรือไม่ก่อนทำงานกับ database',
      'ตอบ 422 เมื่อ input ผ่านรูปแบบ HTTP แต่ไม่ผ่าน business validation',
      'กำหนด status error และ message ภาษาไทยที่ Frontend แสดงได้',
      'ส่ง errors แบบ field/message เพื่อให้ฟอร์ม map error กับ input ได้',
      'ปิด object data ที่บรรจุ validation errors สำหรับ client',
      'ปิด response object ของ 422',
      'ปิด if เมื่อ validation ไม่ผ่านแล้วไม่ดำเนินการต่อ',
      'เว้นบรรทัดเพื่อแยก validation response ออกจากกระบวนการสมัคร',
      'normalize email เป็น lowercase และ trim เพื่อลดปัญหา duplicate จากช่องว่างหรือตัวพิมพ์',
      'hash password ด้วย cost 12 ก่อนส่งเข้า database และไม่เก็บ plaintext',
      'เว้นบรรทัดเพื่อแยกการเตรียม credential ออกจากการเขียนข้อมูล',
      'เริ่ม try block สำหรับ database และ token errors ที่ต้องจัดการต่อ',
      'ค้นหาอีเมลก่อนเพื่อให้ผู้ใช้ได้รับ feedback ที่ช่วยได้',
      'ตรวจผลค้นหาเพื่อแยกกรณีอีเมลที่ใช้แล้ว',
      'ตอบ 409 เมื่ออีเมลมีอยู่แล้วโดยไม่สร้างผู้ใช้ซ้ำ',
      'ปิด if ของอีเมลที่ซ้ำเพื่อไปขั้นตอนถัดไปเมื่อไม่มีผู้ใช้',
      'สร้างผู้ใช้จาก email และ hash ที่ผ่าน validation แล้ว',
      'ออก access token ด้วย id จาก INSERT ไม่ใช่อีเมลที่ client ส่งเข้ามา',
      'ตอบ 201 Created เพราะมี resource ผู้ใช้ใหม่ถูกสร้าง',
      'กำหนด status success และข้อความยืนยันการสมัคร',
      'กำหนดข้อความยืนยันการสมัครสมาชิกภาษาไทย',
      'ส่ง token และ public user ใน data เพื่อ Frontend เริ่ม session ได้ทันที',
      'ปิด object ของ response สำเร็จ',
      'เริ่ม catch เพื่อจับ error ที่ไม่ใช่ duplicate และจัดการต่อ',
      'แยกกรณี ER_DUP_ENTRY ที่เกิดจาก unique constraint ระหว่าง race',
      'ตอบ 409 แบบเดียวกันเมื่อ request พร้อมกันแล้ว unique constraint ป้องกัน race condition',
      'ปิด if ของ duplicate error',
      'ส่ง error อื่นไป global handler เพื่อตอบ 500 และ log ฝั่ง server',
      'ปิด try/catch ของ Register',
      'ปิด Register handler',
      'เว้นบรรทัดเพื่อแยก Register และ Login handlers',
      'ส่งออก asynchronous controller สำหรับ POST /api/auth/login',
      'รวบรวม validation errors ของ Login ก่อนค้นหาผู้ใช้',
      'ตรวจว่าฟอร์ม Login มี field หรือ format ที่ผิดหรือไม่',
      'ตอบ 422 แบบสั้นเมื่อ input ไม่ถูกต้องโดยไม่เปิดเผยรายละเอียดภายใน',
      'ปิด if เมื่อ Login ไม่ผ่าน validation',
      'เว้นบรรทัดเพื่อแยก validation ออกจากการค้นหาผู้ใช้',
      'อ่าน email แล้ว normalize เหมือน Register เพื่อค้นพบผู้ใช้เดียวกัน',
      'ค้นหาผู้ใช้ด้วย parameterized query จาก model',
      'เปรียบเทียบ password กับ bcrypt hash เฉพาะเมื่อพบผู้ใช้และ false เมื่อไม่พบ',
      'เว้นบรรทัดเพื่อแยกการยืนยัน credential ออกจากการตัดสินใจ response',
      'รวมเงื่อนไข user ไม่พบหรือ password ผิดไว้ในทางออกเดียวกัน',
      'ตอบ 401 Unauthorized ด้วย generic error เพื่อลด user enumeration',
      'ปิด if ของ credential ที่ไม่ถูกต้อง',
      'เว้นบรรทัดก่อนออก token เพื่อแยกเส้นทาง login ที่ล้มเหลวออกจากเส้นทางสำเร็จ',
      'sign token ใหม่หลัง password ถูกยืนยันสำเร็จ',
      'ตอบ 200 OK สำหรับ Login ที่ไม่สร้าง resource ใหม่',
      'กำหนด status success และข้อความเข้าสู่ระบบภาษาไทย',
      'ส่งข้อความเข้าสู่ระบบสำเร็จให้ Frontend แสดงโดยไม่มีข้อมูลลับ',
      'ส่ง token และ public user ใน data เพื่อ Frontend เก็บ session',
      'ปิด object ของ response Login สำเร็จ',
      'ปิด Login handler',
      'เว้นบรรทัดเพื่อแยก Login ออกจาก protected endpoint',
      'ส่งออก controller สำหรับ GET /api/auth/me ที่ requireAuth ป้องกันไว้',
      'อ่านผู้ใช้จาก id ที่ JWT middleware ตรวจแล้ว ไม่รับ id จาก query string',
      'ตรวจว่าผู้ใช้ยังมีอยู่ใน database หรือถูกถูกลบไปแล้ว',
      'ตอบ 401 เมื่อ token ถูกต้องแต่ผู้ใช้ไม่มีใน database แล้ว',
      'ปิด if ของผู้ใช้ที่ถูกลบ',
      'ตอบ 200 พร้อม public user เท่านั้นเมื่อพบข้อมูล',
      'ปิด response object และปิดฟังก์ชัน me',
    ],
    'Controller ไม่ส่ง password_hash, stack trace หรือ token ใน log',
  ),
  defineSnippet(
    'backend-auth-routes',
    'auth-backend/src/routes/authRoutes.js',
    'javascript',
    `import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { loginValidation, registerValidation } from '../middleware/validateAuth.js';
import { requireAuth } from '../middleware/auth.js';
import { login, me, register } from '../controllers/authController.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const router = Router();
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', requireAuth, me);

export default router;`,
    [
      'นำเข้า Router เพื่อแยกเส้นทาง authentication ออกจาก app หลัก',
      'นำเข้า rateLimit เพื่อลดการ bruteforce และ request flooding บน auth endpoints',
      'นำเข้า validation chains สำหรับ Register และ Login',
      'นำเข้า requireAuth เพื่อปกป้อง endpoint /me',
      'นำเข้า controller ทั้งสามฟังก์ชันที่ดำเนินการจริง',
      'เว้นบรรทัดเพื่อแยก imports ออกจาก rate limiter',
      'สร้าง auth rate limiter ที่นับ request ต่อ IP',
      'ตั้งหน้าต่าง 15 นาทีเพื่อให้การยิงรหัสผ่านต่อเนื่องถูกจำกัด',
      'กำหนดเพดาน 20 requests ต่อ IP ต่อหน้าต่างเป็นจุดเริ่มสำหรับฝึก',
      'เปิด standard headers เพื่อให้ client รู้สถานะ rate limit',
      'ปิด legacy headers เพื่อลด header ที่ไม่จำเป็น',
      'ปิด rateLimit พร้อมส่ง options ทั้งหมดให้ limiter ถูกสร้าง',
      'เว้นบรรทัดเพื่อแยก limiter ออกจาก route declarations',
      'สร้าง router instance สำหรับเก็บเส้นทาง authentication ทั้งหมด',
      'ผูก POST /register กับ limiter, validation และ controller ตามลำดับ',
      'ผูก POST /login กับ limiter, validation และ controller เช่นกัน',
      'ผูก GET /me กับ requireAuth ก่อน controller เพื่อบังคับ Bearer token',
      'ส่ง router ไปให้ app.js เมานต์ภายใต้ /api/auth',
      'เว้นบรรทัดก่อนส่งออก router เพื่อแยก declarations ออกจาก export',
    ],
    'เส้นทางเต็มคือ /api/auth/register, /api/auth/login และ /api/auth/me',
  ),
  defineSnippet(
    'backend-auth-app',
    'auth-backend/src/app.js',
    'javascript',
    `import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';

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
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'ไม่พบ endpoint ที่ร้องขอ', data: null });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', data: null });
});

export default app;`,
    [
      'โหลด .env ก่อนสร้างแอปและอ่านค่า environment',
      'นำเข้า Express สำหรับสร้าง application instance',
      'นำเข้า helmet เพื่อเพิ่ม security headers',
      'นำเข้า cors เพื่อจำกัด origin ที่อ่าน response ข้าม port ได้',
      'นำเข้า rateLimit เพื่อจำกัด request รวมของ API',
      'นำเข้า authRoutes ที่สร้างจาก middleware และ controller ในบทนี้',
      'เว้นบรรทัดแยก dependency ออกจากการสร้าง app',
      'สร้าง Express app โดยยังไม่เปิด network listener',
      'อ่าน origin ที่อนุญาตจาก env พร้อมค่า dev localhost:5173',
      'เว้นบรรทัดแยก configuration ออกจาก middleware',
      'ติดตั้ง helmet ให้ response ทุกเส้นทาง',
      'เปิด CORS เฉพาะ origin ที่กำหนด',
      'อ่าน JSON body โดยจำกัดขนาด 16kb',
      'ติดตั้ง global rate limiter ที่ path /api',
      'ตั้งหน้าต่างนับ request 15 นาที',
      'จำกัดแต่ละ IP ที่ 100 requests ต่อหน้าต่าง',
      'เปิด standard rate limit headers',
      'ปิด legacy headers เพื่อไม่ส่งข้อมูลซ้ำ',
      'ปิด global rate limiter',
      'เว้นบรรทัดก่อน health endpoint',
      'สร้าง GET /api/health ที่ไม่ต้อง authentication',
      'ตอบ JSON ว่า process พร้อมใช้งานโดยไม่ query database',
      'ปิด health callback',
      'เมานต์ authRoutes ใต้ /api/auth เพื่อเปิด Register, Login และ /me',
      'เว้นบรรทัดแยก routes ที่รู้จักออกจาก fallback',
      'เพิ่ม fallback สำหรับ request ที่ไม่ตรง endpoint ใด',
      'ตอบ 404 ด้วย response envelope เดียวกัน',
      'ปิด fallback callback',
      'เว้นบรรทัดก่อน error handler',
      'ประกาศ Express error handler สี่อาร์กิวเมนต์',
      'บันทึก error ฝั่ง server เพื่อช่วย debug',
      'ตอบ 500 ทั่วไปโดยไม่ส่ง stack trace ให้ client',
      'ปิด error handler',
      'เว้นบรรทัดก่อนส่งออก app',
      'ส่ง app instance ให้ server.js เปิด listener',
    ],
    'แทนที่ app.js จากบท Setup ด้วยไฟล์นี้หลังจากสร้าง authRoutes.js แล้วรีสตาร์ต npm run dev',
  ),
];

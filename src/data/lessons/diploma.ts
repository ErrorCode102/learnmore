import type { LessonContent, LessonSummary } from '../../types/course';
import { devopsSnippets } from '../snippets/devops';
import { securitySnippets } from '../snippets/security';
import { createCoreLessonContent } from './certificate';

type AdvancedLessonId = 'security' | 'devops';
type AdvancedBlueprint = Omit<LessonContent, keyof LessonSummary>;

const advancedBlueprints: Record<AdvancedLessonId, AdvancedBlueprint> = {
  security: {
    intro:
      'ยกระดับความเข้าใจด้าน authentication จาก JWT ขั้นพื้นฐานไปสู่ lifecycle, rotation, revocation, HttpOnly refresh cookie และ threat model สำหรับ XSS, CSRF, CORS, rate limit, user enumeration และ production secret management',
    sections: [
      {
        id: 'jwt-vs-session',
        title: 'JWT กับ Server-side Session: เลือกโมเดลที่เหมาะกับข้อจำกัด',
        body: [
          'JWT แบบ stateless ให้ Backend ตรวจลายเซ็นได้โดยไม่ query session ทุก request และ scale แนวนอนได้ง่าย แต่การ revoke token รายการนั้นยาก ต้องพึ่ง short expiry, token version หรือ denylist และ payload ที่ใหญ่อาจเพิ่ม overhead',
          'Server-side Session เก็บสถานะใน database/Redis ทำให้ revoke ทันทีและควบคุม credentials ได้ตรงกว่า แต่ทุก request ต้องอ่าน session store และต้องออกแบบ session fixation, cookie flags และ distributed storage ให้ดี',
        ],
        bullets: ['JWT: เหมาะกับ service-to-service และ stateless API ที่ยอมรับ short expiry', 'Session: เหมาะกับ web app ที่ต้องการ logout/revoke ทันที', 'ทั้งสองแบบต้องใช้ HTTPS, least privilege, audit และ incident response', 'ตัวอย่าง AuthLab ใช้ access JWT เพื่อเรียนรู้ ไม่ใช่คำตัดสินใจสำหรับ production ทุกระบบ'],
        callouts: [{ tone: 'info', title: 'Claims ไม่ใช่ความลับ', text: 'JWT payload มี signature เท่านั้น ทุกคนที่ถือ token อ่าน payload ได้ จึงใส่ sub/exp/iss/aud เท่านั้นและไม่ใส่ password_hash หรือ PII ที่ไม่จำเป็น' }],
      },
      {
        id: 'token-lifecycle',
        title: 'Expiry, Rotation และ Revocation',
        body: [
          'Access token ตั้งสั้น 15 นาที ส่วน refresh token ตั้ง 7 วันและเก็บ SHA-256 hash ใน database เมื่อ refresh สำเร็จ ต้อง revoke token เก่าก่อนออกใหม่ (rotation) เพื่อลดการใช้งาน token ที่ถูกขโมยซ้ำ',
          'Revocation ต้องตรวจ revoked_at และ expires_at ก่อนออก access token ใหม่ ตัวอย่างใช้ transaction พร้อม SELECT ... FOR UPDATE และ conditional UPDATE เพื่อให้ token เดียวกัน rotate ได้เพียงครั้งเดียว หาก token ที่ revoke แล้วถูกนำมาใช้ซ้ำ ควร revoke token family ทั้งหมดและแจ้งผู้ใช้',
        ],
        snippets: [securitySnippets[2], securitySnippets[3]],
        bullets: ['ใช้ cryptographic RNG ไม่ใช้ Math.random สำหรับ refresh token', 'Raw refresh token ไม่อยู่ใน database หรือ log', 'Rotation ต้อง atomic หรือใช้ transaction เพื่อป้องกัน race', 'ทำ cleanup records ที่หมดอายุและบันทึก audit เหตุการณ์'],
        callouts: [{ tone: 'warning', title: 'Stateless access token', text: 'การ revoke access token รายการจะเพิ่ม state; หากต้องการ immediate revocation ต้องเพิ่ม token version/session store และยอมรับ trade-off ในแง่ประสิทธิภาพ' }],
      },
      {
        id: 'http-only-refresh-cookie',
        title: 'Refresh token ใน HttpOnly Cookie',
        body: [
          'Refresh route อ่าน cookie แทน JavaScript localStorage แล้ว rotate และออก access token ใหม่ HttpOnly ทำให้ XSS อ่าน cookie ไม่ได้โดยตรง แต่ token ยังถูกแนบอัตโนมัติจึงต้องป้องกัน CSRF',
          'Secure เปิดเฉพาะ production, SameSite=Lax ไม่ส่ง cookie บน cross-site POST โดยทั่วไป และ path จำกัดไว้ที่ /api/auth สำหรับ concept นี้ cookie-parser ติดตั้งจากบท Setup แล้ว route ตรวจ Origin allowlist ก่อน state-changing request',
        ],
        snippets: [securitySnippets[4], securitySnippets[6]],
        bullets: ['Login/Register ที่ production ต้องเรียก issueRefreshToken หลังยืนยันสำเร็จ', 'Axios ที่ใช้ cookie ต้องตั้ง withCredentials และ CORS origin ให้ตรงกัน', 'Logout ต้อง revoke record และ clear cookie ด้วย options เดียวกัน', 'Browser Demo ใน AuthLab ไม่ใช่ production auth เพราะยังไม่มี flow ทั้งหมดนี้'],
        callouts: [{ tone: 'warning', title: 'CSRF ไม่หายจาก HttpOnly', text: 'HttpOnly ป้องกันการอ่าน token ด้วย JavaScript ไม่ได้ป้องกัน browser การส่ง cookie ให้ attacker; ตัวอย่างนี้รวม SameSite=Lax กับ Origin allowlist และยังควรเพิ่ม CSRF token เมื่อ threat model ต้องการ defense เพิ่ม' }],
      },
      {
        id: 'web-threat-controls',
        title: 'XSS, CSRF, CORS และ Rate Limit',
        body: [
          'XSS เกิดเมื่อ untrusted content ถูก render เป็น HTML/JavaScript; Vue escaping ช่วย template แต่ต้อง sanitize HTML ที่รับจากผู้ใช้ หลีกเลี่ยง dangerouslyUseRawHtml และกำหนด CSP โดยไม่ใช้ inline script ที่ไม่จำเป็น',
          'CSRF เกิดขึ้นเมื่อ browser ส่ง cookie ของผู้ใช้ตามคำขอของ site อื่น ในขณะที่ CORS เป็น policy ของ browser ไม่ใช่ authentication; rate limit ช่วย brute force แต่ต้องนับ IP ผ่าน trusted proxy และแยก limit ตาม endpoint/account',
        ],
        snippets: [securitySnippets[1]],
        bullets: ['CORS: ตั้ง allowlist แทน wildcard พร้อม credentials', 'CSRF: ตรวจ Origin และใช้ synchronizer token สำหรับ cookie auth', 'XSS: escape output, sanitize rich HTML และ mask token ใน logging', 'Rate limit: พิจารณา distributed store และ response 429 พร้อม Retry-After', 'Validation: ตรวจ server ทุก field และใช้ parameterized query'],
        callouts: [{ tone: 'info', title: 'Layered defense', text: 'ไม่มี control ตัวเดียวแก้ทุก attack; ให้ CORS, CSRF, XSS prevention, rate limit และ server validation ทำงานร่วมกันและทดสอบ negative paths' }],
      },
      {
        id: 'enumeration-secrets-review',
        title: 'User Enumeration, Secret Management และ Review',
        body: [
          'Login ควรราตอบ generic error และเวลาประมวลผลให้คล้ายกันทั้งเมื่อ user ไม่พบหรือ password ผิด ขณะที่ Register ที่บอก duplicate ทันทียังมี enumeration risk ต้องประเมิน email verification flow และ rate limit',
          'JWT_SECRET ต้องมาจาก process.env.JWT_SECRET หรือ secret manager ไม่มี fallback และยาวอย่างน้อย 32 ตัว  rotates เซิร์ฟเวอร์ต้องรองรับ key id/overlap ชั่วคราวและ revoke sessions ตามนโยบาย',
        ],
        snippets: [securitySnippets[0], securitySnippets[5]],
        bullets: ['แยก environment และสิทธิ์ database account', 'ไม่ commit .env, password, token หรือ Cookie header', 'ใช้ masked/protected CI variables และ secret manager', 'สแกน dependencies/images และทดสอบ restore backup', 'ทบทวน checklist ก่อน production review'],
        callouts: [{ tone: 'success', title: 'Security baseline', text: 'โค้ดตัวอย่างใช้ parameterized SQL, bcrypt hashes only, generic login error, server validation และ env secret แต่ต้องผ่าน review และ threat modeling ก่อน deploy จริง' }],
      },
    ],
    checkpoint: {
      summary: 'ยืนยันว่าคุณสามารถอธิบาย trade-off และแสดง lifecycle ของ token รวมถึงการควบคุม ที่ป้องกัน web attacks ได้',
      checklist: ['เปรียบเทียบ JWT กับ Session ใน scalability และ revocation', 'อธิบาย expiry, rotation, reuse detection และ token family revocation', 'ระบุข้อจำกัดของ localStorage และ Demo ที่ไม่ใช่ production auth', 'อธิบาย XSS/CSRF/CORS/rate limit และ user enumeration', 'ตรวจ secret management และ production review checklist'],
    },
  },
  devops: {
    intro:
      'แพ็กเกจ Node Backend, Vue Frontend และ MySQL ด้วย Docker Compose จากนั้นออกแบบ GitLab CI/CD แบบ test/build/push/deploy โดยแยก environment กับ secrets และคงข้อมูลไว้ใน persistent volume',
    sections: [
      {
        id: 'container-images',
        title: 'Backend/Frontend Dockerfiles และ .dockerignore',
        body: [
          'Backend image ใช้ Node LTS, npm ci --omit=dev, non-root user และ healthcheck /api/health; Frontend ใช้ multi-stage build จาก Vite dist แล้วเสิร์ฟด้วย nginx พร้อม /api proxy ไปยัง backend service',
          '.dockerignore กัน node_modules, dist, .env, Git history และ log เข้า build context ซึ่งลดขนาดและความเสี่ยงของการรั่ว secrets ส่วน VITE_API_BASE_URL ไม่ใช่ secret เพราะถูกฝังใน static bundle',
        ],
        snippets: [devopsSnippets[0], devopsSnippets[1], devopsSnippets[3], devopsSnippets[2]],
        bullets: ['Pin major/minor image แทน latest', 'ใช้ lockfile และ npm ci เพื่อ build ซ้ำได้', 'Backend รันด้วย USER node', 'nginx fallback ไป index.html สำหรับ Vue Router', 'Healthcheck ต้องตรวจ service จริงไม่ใช่แค่ process'],
        callouts: [{ tone: 'warning', title: 'Build context', text: 'Dockerfile แต่ละฝั่งต้อง build จากโฟลเดอร์ที่ถูกต้องและ .dockerignore ต้องไม่ส่ง .env จริงเข้าสู่ image หรือ layer cache' }],
      },
      {
        id: 'compose-services',
        title: 'MySQL healthcheck และ persistent volume',
        body: [
          'docker-compose.yaml กำหนด mysql, backend และ frontend โดย MySQL มี healthcheck และ named volume db_data; Backend ใช้ depends_on condition service_healthy เพื่อไม่ลอง connect ก่อน database พร้อม',
          'schema.sql ถูกเมานต์แบบ read-only ไปยัง docker-entrypoint-initdb.d เพื่อสร้าง users เมื่อ volume เริ่มใหม่ ครั้งเดียว MYSQL_ROOT_PASSWORD, DB_PASSWORD และ JWT_SECRET ต้องมาจาก environment ภายนอก',
        ],
        snippets: [devopsSnippets[4]],
        bullets: ['MySQL port bind เฉพาะ 127.0.0.1 สำหรับฝึก', 'Frontend เปิด 8080:80 และ Backend 3000', 'db_data ทำให้ข้อมูลอยู่รอดหลัง container recreate', 'database init scripts ไม่ได้รันทุกครั้งบน volume เดิม', 'Migration สำหรับ production ต้องแยกจาก bootstrap script'],
        callouts: [{ tone: 'info', title: 'Service discovery', text: 'ภายใน Docker network ใช้ชื่อ mysql และ backend จาก Compose service; browser ยังเรียก localhost:8080 และ nginx proxy ไป backend:3000' }],
      },
      {
        id: 'build-run-verify',
        title: 'Build, Run และตรวจสอบ Compose',
        body: [
          ' ส่งค่า secrets ชั่วคราวใน Terminal แล้วรัน docker compose up -d --build; ตรวจ docker compose ps, health endpoint, SHOW TABLES และ logs เพื่อยืนยันว่า schema และ service dependencies ทำงาน',
          'docker compose down ลบ containers แต่คง named volume; ห้ามใช้ down -v เว้นแต่ตั้งใจลบข้อมูลทดสอบ เพราะการ destructive reset อาจลบผู้ใช้ทั้งหมด',
        ],
        snippets: [devopsSnippets[5]],
        bullets: ['คาดว่า mysql healthy, backend/frontend running', 'curl /api/health = 200', 'SHOW TABLES มี users', 'ตรวจ logs เมื่อ Backend รอ MySQL หรือ JWT config', 'ทดสอบ Register ผ่าน Frontend ที่ 8080'],
        callouts: [{ tone: 'success', title: 'ผลลัพธ์ที่คาดหวัง', text: 'เมื่อ healthcheck และ SHOW TABLES ผ่าน คุณสามารถรัน flow Register/Login ได้ใน containers แบบเดียวกับ development' }],
      },
      {
        id: 'gitlab-pipeline',
        title: 'GitLab CI/CD: test, build, push และ deploy',
        body: [
          'Pipeline เริ่ม unit-test ด้วย Vitest แล้ว build-frontend เพื่อพิสูจน์ Vite bundle; push-images build Backend/Frontend images ด้วย tag commit SHA และ push ไป GitLab Container Registry เพื่อไม่ย้าย image ข้าม job',
          'deploy-production อยู่ stage สุดท้ายและเป็น manual gate บน main; job ใช้ SSH protected key ส่ง registry password ผ่าน stdin เพื่อ login บน server แล้ว export AUTH_BACKEND_IMAGE/AUTH_FRONTEND_IMAGE ที่ tagged ด้วย commit SHA ก่อน docker compose pull/up โดย environment และ secrets จริงอยู่บน server ไม่ใน YAML',
        ],
        snippets: [devopsSnippets[6]],
        bullets: ['stage test ต้องผ่านก่อน downstream jobs', 'artifacts dist หมดอายุใน 1 วัน', 'docker login รับ password ผ่าน stdin', 'images ใช้ immutable commit SHA tags', 'production deploy ต้อง manual approval และ audit history'],
        callouts: [{ tone: 'warning', title: 'Secrets ใน CI', text: 'CI_SSH_PRIVATE_KEY, registry password, DB_PASSWORD และ JWT_SECRET ต้องเป็น protected/masked variables ห้าม echo ค่าใน log หรือ hardcode ใน .gitlab-ci.yml' }],
      },
      {
        id: 'environment-secret-separation',
        title: 'แยก Development, Staging และ Production',
        body: [
          'Configuration ที่ไม่ลับ เช่น PORT, DB_NAME, API base URL แยกตาม environment ได้ใน config files; secrets เช่น database password, JWT secret และ SSH key ต้อง inject จาก secret manager/CI protected variables และ rotate ตามนโยบาย',
          'การ deploy ควรมี rollback plan, migration order, backup/restore drill, monitoring และ health gate; pipeline ตัวอย่างเป็นจุดเริ่ม ไม่ได้ครอบคลุม high availability, zero-downtime migration หรือ secret rotation อัตโนมัติ',
        ],
        bullets: ['Dev ใช้ .env local ที่ไม่ commit', 'Staging ใช้ credentials และ database แยก', 'Production ใช้ least privilege, TLS และ secret manager', 'บันทึก deployment audit โดยไม่บันทึก credential', 'ทดสอบ rollback และกู้คืน volume เป็นประจำ'],
        callouts: [{ tone: 'info', title: 'ขอบเขตของบท', text: 'บทนี้สอน container และ pipeline ขั้นพื้นฐาน ไม่ได้กล่าวว่า Docker Compose หรือ pipeline ตัวอย่างพร้อมใช้งาน production โดยไม่มี review เพิ่มเติม' }],
      },
    ],
    checkpoint: {
      summary: 'ตรวจ images, service dependencies, persistent data และ pipeline gates รวมถึง secret separation ก่อน deploy',
      checklist: ['Build Backend/Frontend images และรัน non-root/healthcheck', 'รัน Compose ทั้งสาม services และตรวจ users table', 'อธิบาย healthcheck, persistent volume และ init script', 'อ่าน GitLab stages test/build/push/deploy และmanual gate', 'แยก secrets และวาง rollback/backup plan'],
    },
  },
};

export function createDiplomaLessonContent(summaries: LessonSummary[]): LessonContent[] {
  return summaries.map((summary) => {
    if (summary.id === 'security' || summary.id === 'devops') {
      return { ...summary, ...advancedBlueprints[summary.id] };
    }
    return createCoreLessonContent(summary, 'diploma');
  });
}

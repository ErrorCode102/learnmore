import { defineSnippet } from './defineSnippet';

export const devopsSnippets = [
  defineSnippet(
    'devops-backend-dockerfile',
    'auth-backend/Dockerfile',
    'text',
    `FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src

ENV NODE_ENV=production
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "start"]`,
    [
      'ใช้ Node.js 24 alpine image เป็นฐาน LTS ขนาดเล็กสำหรับ production runtime',
      'เว้นบรรทัดก่อนกำหนด working directory',
      'กำหนด /app เป็นโฟลเดอร์ทำงานภายใน container',
      'คัดลอก manifest และ lockfile ก่อน source เพื่อใช้ Docker layer cache',
      'ติดตั้ง production dependency จาก lockfile โดยไม่รวม nodemon',
      'คัดลอก source ของ Backend ลงใน image',
      'เว้นบรรทัดก่อน runtime configuration',
      'ตั้ง NODE_ENV=production เพื่อเลือกพฤติกรรมของ library และแอป',
      'ใช้ user node ที่ไม่ใช่ root เพื่อลดผลกระทบเมื่อ process ถูกโจมตี',
      'เปิด port 3000 เพื่อให้ service อื่นใน Docker network เรียกได้',
      'เว้นบรรทัดก่อน healthcheck',
      'ตรวจ /api/health ทุก 30 วินาทีและ fail เมื่อ response ไม่ ok',
      'เริ่ม process ด้วย npm start ซึ่งเรียก node src/server.js',
    ],
    'Build context ต้องเป็น auth-backend; ห้าม copy .env หรือ node_modules เข้า image',
  ),
  defineSnippet(
    'devops-frontend-dockerfile',
    'auth-frontend/Dockerfile',
    'text',
    `FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]`,
    [
      'เริ่ม build stage ด้วย Node.js LTS สำหรับ compile Vue และ Vite',
      'กำหนด working directory ของ build stage',
      'คัดลอก manifests ก่อนเพื่อ cache dependency layers',
      'ติดตั้ง Frontend dependency ทั้งหมดจาก lockfile',
      'คัดลอก source และ Vite config ไป build',
      'เว้นบรรทัดก่อน build-time configuration',
      'รับค่า API base URL จาก build argument และใช้ /api เป็น default',
      'เปิดเผยค่าให้ Vite ฝังใน static bundle ระหว่าง build',      'รัน TypeScript check/build ของ Vite เพื่อสร้าง dist',
      'เว้นบรรทัดก่อน runtime stage',
      'ใช้ nginx alpine สำหรับเสิร์ฟ static files และ reverse proxy',
      'คัดลอก nginx config สำหรับ SPA fallback และ /api proxy',
      'คัดลอก dist จาก build stage ไปยัง document root ของ nginx',
      'เปิด port 80 ของ container',
      'เว้นบรรทัดก่อน healthcheck',
      'ตรวจว่า nginx ตอบหน้า root ได้ทุก 30 วินาที',
      'รัน nginx แบบ foreground เพื่อให้ container ค้างอยู่เมื่อ process ทำงาน',
    ],
    'VITE_API_BASE_URL ไม่ใช่ secret เพราะ value ถูกฝังในไฟล์ที่ browser โหลดได้',
  ),
  defineSnippet(
    'devops-nginx-config',
    'auth-frontend/nginx.conf',
    'text',
    `server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
  }
}`,
    [
      'เปิด server block สำหรับ Virtual host ของ Frontend',
      'รับ HTTP ที่ port 80 ภายใน container',
      'รับ host name ใดก็ได้เพราะ production TLS จัดการที่ reverse proxy',
      'ชี้ root ไปยัง dist ที่ copy จาก build stage',
      'เลือก index.html เป็นไฟล์เริ่มต้นเมื่อเข้าหน้า root',
      'เว้นบรรทัดก่อน API proxy',
      'จับ path ที่ขึ้นต้นด้วย /api/ พร้อม slash',
      'ส่ง request ไปยัง backend service ชื่อ backend ที่ port 3000',
      'ส่ง Host header เดิมให้ Backend ตรวจสอบ request',
      'ส่ง IP จริงของ client ใน X-Real-IP',
      'ต่อเลข IP ตาม chain ของ proxy เพื่อให้ rate limit วิเคราะห์ได้ถูกต้อง',
      'ส่ง scheme เดิมเพื่อ Backend รู้ว่า client ใช้ HTTP หรือ HTTPS',
      'ปิด API location block',
      'เว้นบรรทัดก่อน SPA location',
      'เสิร์ฟไฟล์ที่ موجود otherwise fallback ไป index.html สำหรับ Vue Router',
      'เพิ่ม header nosniff เพื่อ browser ไม่เดาชนิดไฟล์จากเนื้อหา',
      'เพิ่ม Referrer-Policy เพื่อไม่ส่ง path เต็มไปยังเว็บไซต์อื่น',
      'ปิด SPA location block',
      'ปิด server block',
    ],
    'ที่ /api/ ไม่เพิ่ม CORS เพราะ browser เรียก same-origin ผ่าน nginx',
  ),
  defineSnippet(
    'devops-dockerignore',
    '.dockerignore',
    'text',
    `node_modules
dist
.env
.env.*
!.env.example
.git
coverage
*.log`,
    [
      'ไม่ส่ง node_modules ของเครื่อง host เข้า build context',
      'ไม่ส่ง dist เก่าเข้า image เพราะ build stage จะสร้างใหม่',
      'ไม่ส่ง .env ที่อาจมี secrets จริง',
      'ไม่ส่ง environment files อื่น ๆ เช่น .env.production',
      'อนุญาตเฉพาะ .env.example ที่ไม่ควรมีค่าจริง',
      'ไม่ส่งข้อมูลและ history ของ Git repository',
      'ไม่ส่ง coverage reports ที่ไม่ใช้ runtime',
      'ไม่ส่ง log files ที่อาจมีข้อมูลผู้ใช้หรือ token',
    ],
    'วางที่ root ของแต่ละ build context หรือ root auth-lab แล้วตรวจ docker build context',
  ),
  defineSnippet(
    'devops-compose',
    'docker-compose.yaml',
    'text',
    `services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:?required}
      MYSQL_DATABASE: authlab
      MYSQL_USER: authlab_app
      MYSQL_PASSWORD: \${DB_PASSWORD:?required}
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -p$$MYSQL_ROOT_PASSWORD --silent"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./auth-backend
    environment:
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: authlab_app
      DB_PASSWORD: \${DB_PASSWORD:?required}
      DB_NAME: authlab
      CLIENT_ORIGIN: http://localhost:8080
      JWT_SECRET: \${JWT_SECRET:?required}
      JWT_EXPIRES_IN: 15m
    depends_on:
      mysql:
        condition: service_healthy
    ports:
      - "127.0.0.1:3000:3000"
    restart: unless-stopped

  frontend:
    build:
      context: ./auth-frontend
      args:
        VITE_API_BASE_URL: /api
    depends_on:
      - backend
    ports:
      - "8080:80"
    restart: unless-stopped

volumes:
  db_data:`,
    [
      'เปิด services ของ Docker Compose สำหรับระบบ AuthLab',
      'ประกาศ MySQL service สำหรับเก็บ users และ refresh tokens',
      'กำหนด image MySQL 8.4 อย่างชัดเจนเพื่อระบุเวอร์ชันที่ทดสอบ',      'เปิด environment ของ MySQL container',
      'รับ root password จากตัวแปรภายนอกและ fail หากยังไม่ตั้งค่า',
      'สร้าง database authlab อัตโนมัติตอน volume เริ่มใหม่',
      'สร้าง application user authlab_app แทนการใช้ root ในแอป',
      'ใช้ DB_PASSWORD จาก secret ภายนอกสำหรับ application user',
      'เปิด MySQL port เฉพาะ loopback เพื่อไม่เปิดสู่สาธารณะ',
      'เว้นบรรทัดก่อน volumes ของ MySQL',
      'ผูก named volume กับ data directory เพื่อข้อมูลอยู่รอดหลัง recreate container',
      'เมานต์ schema.sql แบบ read-only เพื่อสร้างตารางเมื่อ database ว่าง',
      'กำหนด healthcheck สำหรับ MySQL',
      'รัน mysqladmin ping ด้วย root password จาก environment ของ container',
      'ตรวจ health ทุก 5 วินาที',
      'กำหนด timeout 5 วินาทีต่อการตรวจ',
      'ลอง healthcheck 10 ครั้งก่อนจัดสถานะ unhealthy',
      'เว้นบรรทัดก่อน Backend service',
      'สร้าง Backend image จาก context auth-backend',
      'เปิด environment ที่ process ของ Node อ่าน',
      'กำหนด Backend port 3000 ภายใน network',
      'ใช้ host mysql ตามชื่อ service แทน localhost',
      'กำหนด MySQL port 3306',
      'ใช้ authlab_app ให้ตรงกับ MYSQL_USER',
      'ส่ง DB password จาก secret เดียวกับ MySQL',      'เลือก database authlab ให้ตรงกับ schema',
      'อนุญาต origin ของ Frontend ที่ localhost:8080',
      'ส่ง JWT secret จากภายนอกและ fail ถ้าว่าง',      'กำหนด access token expiry 15 นาที',
      'รอ MySQL healthy ก่อนเริ่ม Backend',
      'เปิด Backend port เฉพาะ loopback สำหรับทดสอบจาก host',
      'เริ่ม container ใหม่เมื่อหยุดเองยกเว้นการ stop ด้วยมือ',
      'เว้นบรรทัดก่อน Frontend service',
      'สร้าง Frontend image จาก context auth-frontend',
      'ส่ง VITE_API_BASE_URL=/api เป็น build argument',
      'ให้ Compose เริ่ม Backend ก่อน Frontend',
      'map port 8080 ของ host ไปยัง nginx port 80',
      'ใช้ restart unless-stopped สำหรับ Frontend เช่นเดียวกับ Backend',
      'เว้นบรรทัดก่อน named volume declaration',
      'ประกาศ db_data เป็น persistent named volume',
    ],
    'Export MYSQL_ROOT_PASSWORD, DB_PASSWORD และ JWT_SECRET ก่อนรัน; ไม่ใส่ค่าจริงในไฟล์นี้',
  ),
  defineSnippet(
    'devops-compose-commands',
    'terminal/docker-compose-commands.sh',
    'bash',
    `docker compose up -d --build
docker compose ps
curl -i http://localhost:3000/api/health
docker compose exec mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" authlab -e "SHOW TABLES;"
docker compose logs --tail=50 backend frontend
docker compose down`,
    [
      'build และเริ่ม MySQL, Backend และ Frontend ในโหมด background',
      'ตรวจสถานะ containers; คาดว่า mysql, backend และ frontend อยู่ในสถานะ running/healthy',
      'ยิง health endpoint เพื่อคาดหวัง 200 พร้อม JSON status success',
      'เปิด MySQL client ใน container เพื่อตรวจว่ามีตาราง users หลัง schema ทำงาน',
      'ดู log ห้าสิบบรรทัดล่าสุดเพื่อวินิจฉัยการเชื่อมต่อระหว่าง services',
      'หยุดและลบ containers แต่คง named volume ไว้เพื่อไม่ลบข้อมูลผู้ใช้',
    ],
    'ผลลัพธ์ที่คาดหวัง: /api/health = 200, mysql healthy และ SHOW TABLES แสดง users',
  ),
  defineSnippet(
    'devops-gitlab-ci',
    '.gitlab-ci.yml',
    'text',
    `stages:
  - test
  - build
  - push
  - deploy

unit-test:
  stage: test
  image: node:24-alpine
  cache:
    key:
      files:
        - auth-backend/package-lock.json
    paths:
      - auth-backend/node_modules
  before_script:
    - cd auth-backend && npm ci
  script:
    - npx vitest run
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

build-frontend:
  stage: build
  image: node:24-alpine
  script:
    - cd auth-frontend && npm ci && npm run build
  artifacts:
    paths:
      - auth-frontend/dist/
    expire_in: 1 day
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

push-images:
  stage: push
  image: docker:27-cli
  services:
    - docker:27-dind
  variables:
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_CERTDIR: /certs
    DOCKER_TLS_VERIFY: 1
    DOCKER_CERT_PATH: /certs/client
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login "$CI_REGISTRY" -u "$CI_REGISTRY_USER" --password-stdin
  script:
    - docker build --pull -t "$CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA" ./auth-backend
    - docker build --pull -t "$CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA" ./auth-frontend
    - docker push "$CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA"
    - docker push "$CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA"
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy-production:
  stage: deploy
  image: alpine:3.21
  environment:
    name: production
  before_script:
    - apk add --no-cache openssh-client
    - eval "$(ssh-agent -s)"
    - printf '%s' "$CI_SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan "$DEPLOY_HOST" >> ~/.ssh/known_hosts
  script:
    - ssh "$DEPLOY_USER@$DEPLOY_HOST" "cd /opt/authlab && docker compose pull && docker compose up -d"
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: manual`,
    [
      'เปิด YAML configuration ของ GitLab CI/CD',
      'เริ่ม stages ตามลำดับ test, build, push และ deploy',
      'กำหนด job แรกสำหรับ unit test',
      'กำหนด stage test เพื่อ gate ไม่ให้ build ต่อเมื่อ test ล้มเหลว',
      'ใช้ Node.js LTS image ใน job ไม่ต้องติดตั้ง runtime บน runner',
      'เปิด cache configuration',
      'กำหนด cache key จาก package-lock.json ของ Backend',
      'เปิด key files array สำหรับ lockfile',
      'ระบุ path lockfile ที่ใช้พิสูจน์ dependency เปลี่ยน',
      'ระบุโฟลเดอร์ node_modules ที่ cache ใหม่เมื่อ lockfile เปลี่ยน',
      'ปิด cache key object',
      'กำหนด directory ของ cache ให้สัมพันธ์กับ project root',
      'ปิด cache configuration',
      'ติดตั้ง dependency ให้ตรง lockfile ก่อนรัน test',
      'รัน Vitest ทั้งหมดและ fail job เมื่อมี test ไม่ผ่าน',
      'จำกัด job นี้เฉพาะ branch main',
      'เว้นบรรทัดก่อน Frontend build job',
      'กำหนด job build สำหรับตรวจ production bundle',
      'จัด job ไว้ใน stage build หลัง test',
      'ใช้ Node.js LTS image สำหรับ Vite build',
      'ติดตั้ง Frontend dependencies แล้วรัน build แบบ lockfile',
      'เก็บ dist เป็น artifact เพื่อตรวจสอบหรือส่งต่อได้',
      'เปิด artifact paths',
      'ระบุ dist ที่สร้างจาก Vite',
      'กำหนด artifact หมดอายุใน 1 วันเพื่อไม่ใช้ storage นานเกินจำเป็น',
      'ปิด artifact configuration',
      'รัน Frontend build เฉพาะ main',
      'เว้นบรรทัดก่อน image registry job',
      'กำหนด job สำหรับ build และ push Docker images',
      'จัด job ไว้ใน stage push หลัง test/build',
      'ใช้ Docker CLI image สำหรับส่งคำสั่ง build',
      'เปิด services สำหรับ Docker-in-Docker',
      'เริ่ม daemon Docker แบบ TLS ใน service',
      'ชี้ Docker CLI ไปยัง daemon ที่ชื่อ docker',
      'เปิด TLS verification ของ Docker daemon',
      'เปิด DOCKER_TLS_VERIFY',
      'ชี้ client certificates ไปยัง /certs/client',
      'ปิด variables object',
      'เข้าสู่ระบบ registry โดยรับ password จาก stdin ไม่ใส่ literal ใน YAML',
      'build Backend image พร้อม tag commit SHA',
      'build Frontend image ด้วย source และ nginx config ล่าสุด',
      'push Backend image ที่ tagged ด้วย commit SHA',
      'push Frontend image ที่ tagged ด้วย commit SHA',
      'จำกัด image job เฉพาะ main',
      'เว้นบรรทัดก่อน deployment job',
      'กำหนด job deploy ไปยัง production server',
      'จัด job ไว้ใน deploy stage สุดท้าย',
      'ใช้ alpine image ขนาดเล็กและติดตั้ง SSH client เพิ่ม',
      'ผูก job กับ GitLab environment ชื่อ production',
      'เปิด environment configuration',
      'ตั้งชื่อ production เพื่อเก็บ deployment history',
      'ปิด environment configuration',
      'ติดตั้ง OpenSSH client บน alpine',
      'เริ่ม ssh-agent สำหรับเก็บ private key ชั่วคราว',
      'เพิ่ม CI_SSH_PRIVATE_KEY จาก protected variable โดยลบ carriage return',
      'สร้าง .ssh directory และจำกัด permission ให้ปลอดภัย',
      'เก็บ host key จาก DEPLOY_HOST สำหรับตรวจ SSH connection',
      'ปิด before_script',
      'เชื่อมต่อ server แล้ว pull images ล่าสุดและ recreate services',
      'ให้ deploy รหัส main แบบ manual เพื่อมนุษย์กดอนุมัติ',
      'เปิด rules ของ deploy job',
      'ตรวจ condition ว่าเป็น branch main',
      'กำหนด when manual แทน deploy อัตโนมัติ',
    ],
    'CI variables และ secrets ต้องเป็น protected/masked; production env อยู่บน server หรือ secret manager',
  ),
];

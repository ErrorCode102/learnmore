import { defineSnippet } from './defineSnippet';

export const frontendSnippets = [
  defineSnippet(
    'frontend-http-client',
    'auth-frontend/src/api/http.js',
    'javascript',
    `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authlab.token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    const requestError = new Error(message);
    requestError.status = error.response?.status;
    return Promise.reject(requestError);
  },
);

export default api;`,
    [
      'นำเข้า Axios เพื่อสร้าง client ที่ใช้ configuration และ interceptors ร่วมกัน',
      'เว้นบรรทัดเพื่อแยก dependency ออกจาก instance',
      'สร้าง Axios instance แทนการเรียก axios ตรง ๆ ในทุก view',
      'ใช้ /api เป็นค่าเริ่มต้นเพื่อให้ Vite proxy ส่งไป Express ขณะ development',
      'กำหนด JSON content type สำหรับ request body ทั้งหมด',
      'ปิด config object ของ Axios instance',
      'เว้นบรรทัดเพื่อแยก config ออกจาก request interceptor',
      'เพิ่ม interceptor ที่ทำงานก่อน request ถูกส่งออกจาก browser',
      'อ่าน token จาก localStorage ด้วย key เดียวกับ Pinia store',
      'แนบ Bearer header เฉพาะเมื่อมี token เพื่อไม่ส่งค่า null',
      'คืน config ที่แก้ไขแล้วให้ Axios ใช้งานต่อ',
      'ปิด request interceptor',
      'เว้นบรรทัดเพื่อแยก request interceptor ออกจาก response interceptor',
      'ส่ง response ตรงไปยัง store เมื่อสถานะไม่ใช่ error',
      'แปลง error ของ Axios เป็น message ที่เข้าใจได้สำหรับผู้ใช้',
      'สร้าง Error object ใหม่โดยเก็บ message ที่ sanitize จาก response แล้ว',
      'แนบ status code เดิมเพื่อให้ store แยก 401 ออกจาก error อื่น',
      'คืน rejected Promise ด้วย error ที่มี status สำหรับ try/catch ใน store',
      'ปิด response interceptor',
      'เว้นบรรทัดก่อนส่งออก client สำหรับโมดูลอื่น',
      'ส่ง Axios instance เป็น default ให้ store และ views import ใช้',
    ],
    'Demo นี้เก็บ token ใน localStorage; ไม่ใช่ production auth และต้องพิจารณา XSS risk',
  ),
  defineSnippet(
    'frontend-auth-store',
    'auth-frontend/src/stores/auth.js',
    'javascript',
    `import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import api from '../api/http.js';

const TOKEN_KEY = 'authlab.token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY));
  const user = ref(null);
  const loading = ref(false);
  const error = ref('');
  const isAuthenticated = computed(() => Boolean(token.value));

  async function authenticate(endpoint, payload) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.post('/auth/' + endpoint, payload);
      token.value = response.data.data.token;
      user.value = response.data.data.user;
      localStorage.setItem(TOKEN_KEY, token.value);
    } catch (cause) {
      error.value = cause.message;
      throw cause;
    } finally {
      loading.value = false;
    }
  }

  async function loadMe() {
    if (!token.value) return;
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.data.user;
    } catch (cause) {
      error.value = cause.message;
      if (cause.status === 401) logout();
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return { token, user, loading, error, isAuthenticated, authenticate, loadMe, logout };
});`,
    [
      'นำเข้า ref และ computed จาก Vue Composition API สำหรับ state แบบ reactive',
      'นำเข้า defineStore จาก Pinia เพื่อสร้าง store ชื่อ auth',
      'นำเข้า Axios client ที่เพิ่ม Bearer header ให้อัตโนมัติ',
      'เว้นบรรทัดเพื่อแยก imports ออกจาก constant',
      'กำหนด key ของ token ให้ตรงกับ http interceptor และ localStorage caveat',
      'เว้นบรรทัดก่อนสร้าง store',
      'สร้าง setup store แบบ Composition API และกำหนดชื่อ auth',
      'อ่าน token เดิมเมื่อหน้า reload เพื่อให้ router รู้ว่ามี session ตัวอย่าง',
      'สร้าง state user ที่จะเก็บ public profile จาก /me',
      'สร้าง state loading เพื่อ views ปิดปุ่มและแสดง progress',
      'สร้าง state error สำหรับข้อความที่ผู้ใช้อ่านได้',
      'สร้าง computed isAuthenticated จากมี/ไม่มี token',
      'เว้นบรรทัดเพื่อแยก state ออกจาก actions',
      'สร้าง action รวมสำหรับ Register และ Login เพื่อลดโค้ดซ้ำ',
      'เปิด loading และล้าง error เก่าก่อนเริ่ม request',
      'เรียก endpoint /auth/register หรือ /auth/login ตาม action ที่ส่งมา',
      'อ่าน token จาก response envelope ช่อง data.token',
      'เก็บ public user จาก response เพื่อแสดงผลทันทีโดยไม่ต้องรีโหลด',
      'บันทึก token ลง localStorage เพื่อคงเหลือเมื่อ refresh',
      'เก็บ message จาก error เพื่อให้ form แสดง feedback',
      'โยน error ต่อให้ view เลือกการ navigator หรือการอยู่หน้าจอ',
      'ปิด loading เสมอแม้ request สำเร็จหรือล้มเหลว',
      'ปิด authenticate action',
      'เว้นบรรทัดเพื่อแยก Register/Login ออกจาก /me',
      'สร้าง action โหลดผู้ใช้จาก protected endpoint',
      'ไม่เรียก API เมื่อไม่มี token เพราะจะได้รับ 401 โดยไม่จำเป็น',
      'เปิด loading และล้าง error ก่อนยิง /me',
      'เรียก GET /auth/me โดย client จะแนบ Bearer token ให้',
      'แทน user state ด้วย public profile ล่าสุดจาก Backend',
      'เก็บ error message หาก /me ล้มเหลว',
      'ล้าง session เมื่อ server ตอบ 401 เพราะ token อาจหมดอายุหรือถูกเพิกถอน',      'ปิด loading หลังตรวจสอบผู้ใช้เสร็จ',
      'ปิด loadMe action',
      'เว้นบรรทัดเพื่อแยก server sync ออกจาก logout',
      'สร้าง action logout ที่ล้างทั้ง state และ storage',
      'ตั้ง token เป็น null เพื่อ computed และ router guard อ่านค่าล่าสุด',
      'ล้าง user state เพื่อไม่แสดงข้อมูลของผู้ใช้ก่อนหน้า',
      'ลบ token ออกจาก localStorage เพื่อไม่กลับมา login อัตโนมัติ',
      'ปิด logout action',
      'เว้นบรรทัดก่อนส่ง API ของ store ออกไป',
      'ส่ง state, computed และ actions ทั้งหมดให้ components ใช้งาน',
      'ปิด setup store function',
    ],
    'Store เป็น single source of truth; localStorage ไม่เข้ารหัสและ XSS อ่านได้',
  ),
  defineSnippet(
    'frontend-router-guard',
    'auth-frontend/src/router/index.js',
    'javascript',
    `import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login';
  if (to.meta.guestOnly && auth.isAuthenticated) return '/dashboard';
  return true;
});

export default router;`,
    [
      'นำ API สร้าง router และ history แบบ HTML5 จาก Vue Router',
      'นำเข้า auth store เพื่อ guard ตรวจ session ที่ชัดเจน',
      'นำเข้า LoginView สำหรับ route ที่ไม่ต้อง login',
      'นำเข้า RegisterView สำหรับ route สมัครสมาชิก',
      'นำเข้า DashboardView สำหรับ route ที่ต้องมี token',
      'เว้นบรรทัดเพื่อแยก imports ออกจาก router instance',
      'สร้าง router พร้อม history ที่เหมาะกับ production server',
      'เปิด routes array สำหรับ mapping path กับ component',
      'ส่ง path หลักไปยัง dashboard ซึ่ง guard จะตัดสินใจ login ถ้าจำเป็น',
      'กำหนด route Login พร้อม meta guestOnly สำหรับผู้ที่ยังไม่ login',
      'กำหนด route Register ด้วย meta guestOnly เช่นเดียวกัน',
      'กำหนด route Dashboard ด้วย meta requiresAuth เพื่อปกป้อง client navigation',
      'ปิด routes array',
      'ปิด router configuration',
      'เว้นบรรทัดก่อน navigation guard',
      'เพิ่ม beforeEach guard ที่ทำงานก่อน render route เป้าหมาย',
      'อ่าน auth store ปัจจุบันจาก Pinia',
      'redirect ไป Login เมื่อ route ต้อง auth แต่ไม่มี token',
      'redirect ผู้ที่ login แล้วออกจากหน้า Login/Register ไป Dashboard',
      'อนุญาต navigation เมื่อไม่ตรงเงื่อนไข redirect',
      'ปิด navigation guard',
      'เว้นบรรทัดก่อนส่งออก router',
      'ส่ง router instance ให้ main.js ติดตั้งกับ Vue app',
    ],
    'Router guard เป็น UX/client-side เท่านั้น; การตรวจสอบจริงเกิดขึ้นที่ /me บน Backend',  ),
  defineSnippet(
    'frontend-main',
    'auth-frontend/src/main.js',
    'javascript',
    `import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import './style.css';

createApp(App).use(createPinia()).use(router).mount('#app');`,
    [
      'นำเข้า createApp สำหรับเริ่ม Vue application',
      'นำเข้า createPinia เพื่อเปิดใช้งาน store ทั้งหมด',
      'นำเข้า App component ที่เป็น root ของโปรเจกต์',
      'นำเข้า router ที่มี guard และ routes ครบแล้ว',
      'นำเข้า style.css เพื่อโหลด visual styling ของแอป',
      'เว้นบรรทัดก่อน mount application',
      'สร้าง Vue app, ลงทะเบียน Pinia และ router เรียงตามลำดับ แล้ว mount ลง #app',
    ],
    'Vite template ใช้ TypeScript ได้ แต่ตัวอย่างนี้ใช้ JavaScript ให้โฟกัสที่ flow',
  ),
  defineSnippet(
    'frontend-app-view',
    'auth-frontend/src/App.vue',
    'vue',
    `<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <main class="min-h-screen bg-slate-50 p-6 text-slate-900">
    <RouterView />
  </main>
</template>`,
    [
      'เปิด script setup เพื่อใช้ Composition API โดยไม่ต้อง export component',
      'นำเข้า RouterView component สำหรับแสดง route ปัจจุบัน',
      'ปิด script block',
      'เว้นบรรทัดเพื่อแยก logic ออกจาก template',
      'เปิด template ของ root component',
      'สร้าง main element พร้อม padding และพื้นหลังพื้นฐานสำหรับทุกหน้า',
      'แสดง view ที่ router เลือกไว้แทนที่ตำแหน่งนี้',
      'ปิด main element',
      'ปิด template block',
    ],
    'เป็น shell ขั้นต่ำของ Frontend; ส่วนฟอร์มและ feedback อยู่ในแต่ละ view',
  ),
  defineSnippet(
    'frontend-login-view',
    'auth-frontend/src/views/LoginView.vue',
    'vue',
    `<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const auth = useAuthStore();
const submitting = ref(false);
const error = ref('');
const form = reactive({ email: '', password: '' });

async function submit() {
  submitting.value = true;
  error.value = '';
  try {
    await auth.authenticate('login', { email: form.email, password: form.password });
    await router.push('/dashboard');
  } catch (cause) {
    error.value = cause.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="mx-auto max-w-md rounded-2xl bg-white p-6 shadow">
    <h1 class="text-2xl font-semibold">เข้าสู่ระบบ AuthLab</h1>
    <p v-if="error" role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{{ error }}</p>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="login-email" class="block text-sm font-medium">อีเมล</label>
        <input id="login-email" v-model="form.email" type="email" autocomplete="email" required class="mt-1 w-full rounded-lg border p-2" />
      </div>
      <div>
        <label for="login-password" class="block text-sm font-medium">รหัสผ่าน</label>
        <input id="login-password" v-model="form.password" type="password" autocomplete="current-password" required class="mt-1 w-full rounded-lg border p-2" />
      </div>
      <button type="submit" :disabled="submitting || auth.loading" class="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white disabled:opacity-50">
        {{ submitting || auth.loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
      </button>
    </form>
    <p class="mt-4 text-sm">ยังไม่มีบัญชี? <RouterLink :to="'/register'" class="text-indigo-700 underline">สมัครสมาชิก</RouterLink></p>
  </section>
</template>`,
    [
      'เปิด script setup สำหรับ Composition API ของ LoginView',
      'นำเข้า reactive สำหรับ form object และ ref สำหรับ state ที่เปลี่ยนทีละค่า',
      'นำเข้า useRouter เพื่อนำทางหลัง Login สำเร็จ',
      'นำเข้า RouterLink component สำหรับลิงก์ไป Register',
      'นำเข้า auth store เป็นตัวกลางทุก authentication action',
      'เว้นบรรทัดเพื่อแยก imports ออกจาก component state',
      'สร้าง router instance สำหรับ navigation หลังรับ token',
      'อ่าน Pinia store ที่จะให้ loading และ action อยู่ร่วมกัน',
      'สร้าง local submitting state ป้องกันการกดปุ่มซ้ำขณะ request ค้าง',
      'สร้าง local error state สำหรับข้อความที่แสดงใน role alert',
      'สร้าง form object reactive ซึ่ง v-model อัปเดตค่าได้',
      'เว้นบรรทัดก่อน submit handler',
      'ประกาศ async function ที่รับ submit event จากฟอร์ม',
      'ตั้ง submitting และล้าง error เก่าก่อนเริ่ม request',
      'เรียก store authenticate ด้วย endpoint login และ payload ดิบ โดยปล่อยให้ server trim และตรวจสอบ',
      'นำทางไป Dashboard เมื่อ token ถูกสร้างสำเร็จ',
      'จับ error จาก API และเก็บ message สำหรับผู้ใช้',
      'ปิด submitting ใน finally ไม่ว่าจะสำเร็จหรือไม่',
      'ปิด submit function',
      'ปิด script block',
      'เว้นบรรทัดระหว่าง script และ template',
      'เปิด template ของหน้า Login',
      'สร้าง card กว้างสูงสุด md เพื่อใช้งานบนมือถือได้',
      'แสดง heading ชื่อหน้าเพื่อให้ผู้ใช้และ screen reader รู้ตำแหน่ง',
      'แสดง error ด้วย role alert เมื่อ store หรือ network ส่งข้อความกลับ',
      'เปิด form และผูก prevent submit เพื่อไม่รีโหลดหน้า',
      'เปิด div กลุ่มของ email พร้อม label for ที่เชื่อม input',
      'ปิด label ที่มีข้อความอีเมล',
      'ผูก email v-model และกำหนด type/autocomplete/required พร้อมสไตล์ input',
      'ปิดกลุ่ม input email',
      'เปิด div กลุ่มของ password',
      'แสดง label ที่อ้าง input รหัสผ่าน',
      'ผูก password v-model โดยไม่ trim และใช้ autocomplete current-password',
      'ปิดกลุ่ม input password',
      'สร้างปุ่ม submit ที่ปิดระหว่าง local หรือ store loading',
      'เปลี่ยนข้อความปุ่มเป็นกำลังเข้าสู่ระบบเมื่อ request ค้าง',
      'ปิดปุ่ม submit',
      'ปิด form',
      'แสดงลิงก์สมัครสมาชิกด้วย RouterLink เมื่อยังไม่มีบัญชี',
      'ปิด paragraph ของลิงก์',
      'ปิด section card',
      'ปิด template block',
    ],
    'Browser validation ช่วย UX แต่ Express validation เป็นจุดบังคับหลัก',
  ),
  defineSnippet(
    'frontend-register-view',
    'auth-frontend/src/views/RegisterView.vue',
    'vue',
    `<script setup>
import { reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const auth = useAuthStore();
const submitting = ref(false);
const error = ref('');
const form = reactive({ email: '', password: '', confirmPassword: '' });

async function submit() {
  error.value = '';
  if (form.password !== form.confirmPassword) {
    error.value = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน';
    return;
  }
  submitting.value = true;
  try {
    await auth.authenticate('register', { email: form.email, password: form.password });
    await router.push('/dashboard');
  } catch (cause) {
    error.value = cause.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="mx-auto max-w-md rounded-2xl bg-white p-6 shadow">
    <h1 class="text-2xl font-semibold">สมัครสมาชิก AuthLab</h1>
    <p v-if="error" role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{{ error }}</p>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="register-email" class="block text-sm font-medium">อีเมล</label>
        <input id="register-email" v-model="form.email" type="email" autocomplete="email" required class="mt-1 w-full rounded-lg border p-2" />
      </div>
      <div>
        <label for="register-password" class="block text-sm font-medium">รหัสผ่าน</label>
        <input id="register-password" v-model="form.password" type="password" autocomplete="new-password" required class="mt-1 w-full rounded-lg border p-2" />
      </div>
      <div>
        <label for="register-confirm" class="block text-sm font-medium">ยืนยันรหัสผ่าน</label>
        <input id="register-confirm" v-model="form.confirmPassword" type="password" autocomplete="new-password" required class="mt-1 w-full rounded-lg border p-2" />
      </div>
      <button type="submit" :disabled="submitting || auth.loading" class="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white disabled:opacity-50">
        {{ submitting || auth.loading ? 'กำลังสมัครสมาชิก…' : 'สมัครสมาชิก' }}
      </button>
    </form>
    <p class="mt-4 text-sm">มีบัญชีแล้ว? <RouterLink :to="'/login'" class="text-indigo-700 underline">เข้าสู่ระบบ</RouterLink></p>
  </section>
</template>`,
    [
      'เปิด script setup ของ RegisterView เพื่อเขียน state และ action แบบ Composition API',
      'นำเข้า reactive และ ref สำหรับ form และสถานะการส่ง',
      'นำเข้า router และ RouterLink จาก vue-router',
      'นำเข้า auth store สำหรับ action สมัครสมาชิก',
      'เว้นบรรทัดก่อนสร้าง component state',
      'สร้าง router instance เพื่อกลับ Dashboard หลัง Register สำเร็จ',
      'อ่าน auth store เพื่อใช้ loading และ error ที่แชร์กัน',
      'สร้าง submitting state ป้องกัน double submit',
      'สร้าง error state สำหรับแสดงปัญหาเฉพาะฟอร์มนี้',
      'สร้าง form ที่มี email, password และ confirmPassword',
      'เว้นบรรทัดก่อน submit handler',
      'ประกาศ async submit สำหรับตรวจข้อมูลและเรียก API',
      'ล้าง error ก่อนตรวจสอบความสัมพันธ์ของรหัสผ่าน',
      'เปรียบเทียบ password กับ confirmPassword ก่อนส่ง request',
      'แสดงข้อความไทยและ return เมื่อยืนยันรหัสผ่านไม่ตรงกัน',
      'เปิด submitting หลัง input ผ่านการตรวจเบื้องต้น',
      'เรียก Register ด้วย payload สอง field ที่ Backend ต้องการ',
      'นำทางไป Dashboard เมื่อได้รับ token และ user สำเร็จ',
      'จับ error จาก server เช่น duplicate email หรือ weak password',
      'ปิด submitting ใน finally เพื่อให้แก้ไขและส่งใหม่ได้',
      'ปิด submit handler',
      'ปิด script block',
      'เว้นบรรทัดก่อน template',
      'เปิด template ของหน้า Register',
      'สร้าง card พร้อม heading ที่บอกการกระทำชัดเจน',
      'แสดง error ด้วย role alert เพื่อ screen reader อ่านเมื่อข้อความเปลี่ยน',
      'เปิด form และป้องกัน reload เมื่อผู้ใช้กด Enter',
      'เปิดกลุ่ม email พร้อม label for ที่เชื่อม input',
      'ปิด label อีเมล',
      'ผูก email v-model และใช้ autocomplete email สำหรับ password manager',
      'ปิดกลุ่ม email',
      'เปิดกลุ่ม password หลัก',
      'แสดง label ของ password',
      'ใช้ autocomplete new-password เพื่อไม่เสนอรหัสเก่าให้กรอก',
      'ปิดกลุ่ม password หลัก',
      'เปิดกลุ่มยืนยันรหัสผ่าน',
      'แสดง label ของ confirmPassword',
      'ผูก confirmPassword v-model และกำหนด type password',
      'ปิดกลุ่มยืนยันรหัสผ่าน',
      'ปิดปุ่มส่งขณะ request หรือ store loading',
      'เปลี่ยนข้อความปุ่มเป็นการทำงานคงที่เมื่อกำลังส่ง',
      'ปิดปุ่ม submit',
      'ปิด form',
      'แสดง RouterLink กลับ Login สำหรับผู้ที่มีบัญชี',
      'ปิด paragraph ลิงก์',
      'ปิด section',
      'ปิด template',
    ],
    'policy ยืนยันซ้ำไม่ใช่ secret; ไม่เก็บ confirmPassword ใน store หรือ localStorage',
  ),
  defineSnippet(
    'frontend-dashboard-view',
    'auth-frontend/src/views/DashboardView.vue',
    'vue',
    `<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  await auth.loadMe();
});

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <section class="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
    <h1 class="text-2xl font-semibold">แดชบอร์ด AuthLab</h1>
    <p v-if="auth.loading" role="status" class="mt-4 text-slate-600">กำลังตรวจสอบสิทธิ์…</p>
    <p v-else-if="auth.error" role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{{ auth.error }}</p>
    <template v-else>
      <p class="mt-4">ยินดีต้อนรับ {{ auth.user?.email }}</p>
      <p class="mt-2 text-sm text-slate-600">หน้านี้แสดงข้อมูลที่ GET /api/auth/me ยืนยันแล้ว</p>
      <button type="button" @click="logout" class="mt-6 rounded-lg border border-slate-300 px-4 py-2 font-medium">ออกจากระบบ</button>
    </template>
  </section>
</template>`,
    [
      'เปิด script setup ของ DashboardView',
      'นำเข้า onMounted เพื่อ sync ข้อมูลกับ server หลัง component ปรากฏ',
      'นำเข้า useRouter สำหรับกลับ Login เมื่อ logout',
      'นำเข้า auth store ที่เก็บ token, user, loading และ error',
      'เว้นบรรทัดก่อนสร้าง instance',
      'สร้าง router instance สำหรับ action logout',
      'อ่าน store เดียวกันกับ Login และ Register',
      'เว้นบรรทัดก่อน lifecycle hook',
      'เรียก loadMe เมื่อ mount เพื่อยืนยัน token กับ Backend ทุกครั้งที่เปิด dashboard',
      'ปิด lifecycle callback',
      'เว้นบรรทัดก่อน logout handler',
      'ประกาศ logout handler สำหรับปุ่มใน template',
      'ล้าง token และ user ใน store',
      'นำทางกลับ Login หลัง session ถูกล้างแล้ว',
      'ปิด logout handler',
      'ปิด script block',
      'เว้นบรรทัดก่อน template',
      'เปิด template ของ Dashboard',
      'สร้าง card สำหรับข้อมูลผู้ใช้ที่ผ่าน authentication',
      'แสดง heading ของ dashboard',
      'แสดง loading ด้วย role status ขณะ /me ยังไม่ตอบ',
      'แสดง error ด้วย role alert เมื่อ /me ล้มเหลวและไม่ clear session',
      'เปิด template fallback สำหรับสถานะพร้อมแสดงข้อมูล',
      'แสดงอีเมลจาก public user ที่ Backend ส่งมา',
      'อธิบายว่าข้อมูลบนหน้าจอมาจาก protected endpoint ไม่ใช่ token payload',
      'สร้างปุ่ม logout ที่เรียก handler และมี label ภาษาไทย',
      'ปิด template fallback',
      'ปิด section card',
      'ปิด template block',
    ],
    'Dashboard reload ต้องเรียก /me; การมี token ใน localStorage เพียงอย่างเดียวไม่ยืนยันสิทธิ์',
  ),
];

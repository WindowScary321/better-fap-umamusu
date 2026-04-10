<template>
  <div class="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans antialiased text-white fixed inset-0 z-[999999]">
    <div class="bg-slate-800 p-8 rounded-2xl shadow-2xl w-[400px] border border-slate-700/50 backdrop-blur-md">
      <div class="flex flex-col items-center text-center mb-8">
        <h1 class="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">FPT University</h1>
        <p class="text-slate-400 mt-2 text-sm font-medium tracking-wide uppercase">Academic Portal</p>
      </div>

      <div class="space-y-6">
        <!-- Campus Selection -->
        <div>
          <label class="block mb-2 text-sm font-semibold text-slate-300">Select Campus</label>
          <select 
            v-model="selectedCampus"
            class="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3.5 transition-colors appearance-none cursor-pointer hover:border-slate-500"
          >
            <option value="" disabled>-- Chọn cơ sở --</option>
            <option value="3">FU-Hòa Lạc</option>
            <option value="4">FU-Hồ Chí Minh</option>
            <option value="5">FU-Đà Nẵng</option>
            <option value="6">FU-Cần Thơ</option>
            <option value="7">FU-Quy Nhơn</option>
          </select>
        </div>

        <!-- Login Actions -->
        <div class="space-y-3 pt-4">
          <button 
            @click="loginWithGoogle"
            class="w-full relative flex items-center justify-center p-3.5 rounded-xl overflow-hidden bg-white text-slate-800 font-semibold hover:bg-slate-100 hover:shadow-lg transition-all"
          >
            <span class="absolute left-5">
              <!-- Google Icon SVG -->
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </span>
            <span>Login With Google</span>
          </button>

          <button 
            @click="loginWithFeID"
            class="w-full relative flex items-center justify-center p-3.5 rounded-xl overflow-hidden bg-[#f36f21] text-white font-semibold hover:bg-[#e05f15] hover:shadow-lg transition-all"
          >
            <span class="absolute left-5">
              <!-- Mail/FEID icon -->
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </span>
            <span>Login With FeID</span>
          </button>
        </div>
        
        <p class="text-[11px] text-center text-slate-500 mt-6 pt-4 border-t border-slate-700/50">
          Re-designed with Vue 3 & WXT
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const selectedCampus = ref('');

// Sync từ dropdown gốc khi component mount xong
onMounted(() => {
  const originalSelect = document.querySelector('#ctl00_mainContent_ddlCampus') as HTMLSelectElement | null;
  if (originalSelect) {
    selectedCampus.value = originalSelect.value;
  }
});

const submitLogin = (eventTarget: string) => {
  if (!selectedCampus.value) {
    alert('Vui lòng chọn cơ sở (Campus) trước.');
    return;
  }

  // 1. Sync campus value về dropdown gốc (ASP.NET cần đọc giá trị này)
  const originalSelect = document.querySelector('#ctl00_mainContent_ddlCampus') as HTMLSelectElement | null;
  if (!originalSelect) {
    alert('Không tìm thấy form trang gốc. Vui lòng thử tải lại trang.');
    return;
  }
  originalSelect.value = selectedCampus.value;

  // 2. Lấy / tạo hidden input __EVENTTARGET để ASP.NET biết nút nào được nhấn
  const evTarget = document.getElementById('__EVENTTARGET') as HTMLInputElement;
  const evArgument = document.getElementById('__EVENTARGUMENT') as HTMLInputElement;
  if (evTarget) evTarget.value = eventTarget;
  if (evArgument) evArgument.value = '';

  // 3. Submit form gốc — đây là cách chính xác theo ASP.NET WebForms
  const aspNetForm = document.querySelector<HTMLFormElement>('#aspnetForm');
  if (aspNetForm) {
    aspNetForm.submit();
  } else {
    alert('Không tìm thấy form ASP.NET. Vui lòng tải lại trang.');
  }
};

const loginWithGoogle = () => submitLogin('ctl00$mainContent$btnLogin');
const loginWithFeID = () => submitLogin('ctl00$mainContent$btnloginFeId');
</script>

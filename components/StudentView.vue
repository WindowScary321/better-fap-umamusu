<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans antialiased fixed inset-0 z-[999999] overflow-y-auto">
    <!-- Header / Navbar -->
    <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">FPT University</span>
          <span class="text-slate-500 text-sm">Academic Portal</span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-slate-300">📧 {{ userEmail }}</span>
          <span class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">{{ campus }}</span>
          <a :href="logoutUrl" class="text-slate-400 hover:text-red-400 transition-colors text-xs">Đăng xuất</a>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <!-- Breadcrumb -->
      <nav class="text-sm text-slate-500">
        <span class="font-semibold text-orange-400">🏠 Trang chủ</span>
      </nav>

      <!-- Quick Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="https://fap.fpt.edu.vn/Grade.aspx" class="group bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
          <div class="text-2xl mb-1">📊</div>
          <div class="text-sm font-semibold text-slate-200 group-hover:text-orange-300 transition-colors">Bảng điểm</div>
          <div class="text-xs text-slate-500 mt-0.5">Kết quả học tập</div>
        </a>
        <a href="https://fap.fpt.edu.vn/TimeTable.aspx" class="group bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
          <div class="text-2xl mb-1">📅</div>
          <div class="text-sm font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">Thời khóa biểu</div>
          <div class="text-xs text-slate-500 mt-0.5">Lịch học của bạn</div>
        </a>
        <a href="https://fap.fpt.edu.vn/Thongbao.aspx" class="group bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div class="text-2xl mb-1">🔔</div>
          <div class="text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">Thông báo</div>
          <div class="text-xs text-slate-500 mt-0.5">Tin từ nhà trường</div>
        </a>
        <a href="https://fap.fpt.edu.vn/Tuition.aspx" class="group bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
          <div class="text-2xl mb-1">💳</div>
          <div class="text-sm font-semibold text-slate-200 group-hover:text-green-300 transition-colors">Học phí</div>
          <div class="text-xs text-slate-500 mt-0.5">Thông tin thanh toán</div>
        </a>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main: Important Notice / Procedure Table -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <h2 class="font-bold text-slate-100">Thủ tục quan trọng</h2>
            </div>
            <div class="divide-y divide-slate-700/30">
              <div v-for="(item, i) in procedures" :key="i" class="px-5 py-3.5 flex justify-between items-center hover:bg-slate-700/20 transition-colors">
                <span class="text-sm text-slate-300">{{ item.type }}</span>
                <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="deadlineBadge(item.deadline)">{{ item.deadline }}</span>
              </div>
              <div v-if="procedures.length === 0" class="px-5 py-6 text-center text-slate-500 text-sm">
                Không có thủ tục quan trọng nào.
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: News + Links -->
        <div class="space-y-4">
          <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 class="font-bold text-slate-100">📰 Tin tức</h2>
              <a href="https://fap.fpt.edu.vn/CmsFAP/News.aspx" class="text-xs text-orange-400 hover:text-orange-300 transition-colors">Xem tất cả →</a>
            </div>
            <div class="p-4">
              <p class="text-sm text-slate-400">Truy cập trang tin tức để xem các thông báo mới nhất từ nhà trường.</p>
              <a href="https://fap.fpt.edu.vn/CmsFAP/News.aspx"
                class="mt-3 inline-flex items-center gap-1.5 text-sm text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all font-medium">
                Xem tin tức
              </a>
            </div>
          </div>

          <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-700/50">
              <h2 class="font-bold text-slate-100">🔗 Liên kết nhanh</h2>
            </div>
            <div class="p-4 space-y-2">
              <a v-for="link in quickLinks" :key="link.href" :href="link.href"
                class="flex items-center gap-2 text-sm text-slate-300 hover:text-orange-400 py-1 transition-colors">
                <span>{{ link.icon }}</span>{{ link.label }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const userEmail = ref('');
const campus = ref('');
const logoutUrl = ref('https://fap.fpt.edu.vn/Student.aspx?logout=true');

interface Procedure {
  type: string;
  deadline: string;
}
const procedures = ref<Procedure[]>([]);

const quickLinks = [
  { href: 'https://fap.fpt.edu.vn/Course.aspx', icon: '📚', label: 'Đăng ký môn học' },
  { href: 'https://fap.fpt.edu.vn/Attendance.aspx', icon: '✅', label: 'Điểm danh' },
  { href: 'https://fap.fpt.edu.vn/Feedback.aspx', icon: '💬', label: 'Phản hồi giảng viên' },
  { href: 'https://fap.fpt.edu.vn/Report.aspx', icon: '📋', label: 'Báo cáo học tập' },
];

const deadlineBadge = (d: string) => {
  if (d.includes('week') || d.includes('tuần')) return 'bg-yellow-500/20 text-yellow-400';
  if (d.includes('day') || d.includes('ngày')) return 'bg-red-500/20 text-red-400';
  return 'bg-slate-700 text-slate-300';
};

onMounted(() => {
  // Scrape user info từ trang gốc
  const emailEl = document.querySelector('#ctl00_lblLogIn');
  const campusEl = document.querySelector('#ctl00_lblCampusName');
  const logoutEl = document.querySelector<HTMLAnchorElement>('a[href*="logout=true"]');

  if (emailEl) userEmail.value = emailEl.textContent?.trim() ?? '';
  if (campusEl) campus.value = campusEl.textContent?.replace('CAMPUS:', '').trim() ?? '';
  if (logoutEl) logoutUrl.value = logoutEl.href;

  // Scrape bảng "Thủ tục quan trọng" từ table gốc
  const rows = document.querySelectorAll('.table-bordered tbody tr');
  const scraped: Procedure[] = [];
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const type = cells[0]?.textContent?.trim() ?? '';
      const deadline = cells[1]?.textContent?.trim() ?? '';
      if (type && deadline && !type.includes('Type of procedure')) {
        scraped.push({ type, deadline });
      }
    }
  });
  if (scraped.length > 0) procedures.value = scraped;
  else {
    // Fallback dữ liệu mặc định nếu không scrape được
    procedures.value = [
      { type: 'Changing major (Chuyển ngành)', deadline: '5 tuần trước học kỳ mới' },
      { type: 'Changing campus (Chuyển cơ sở)', deadline: '5 tuần trước học kỳ mới' },
      { type: 'Rejoin (Nhập học trở lại)', deadline: '10 ngày trước học kỳ mới' },
    ];
  }
});
</script>

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
          <span class="text-slate-300 text-xs">📧 {{ userEmail }}</span>
          <span class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">{{ campus }}</span>
          <a :href="logoutUrl" class="text-slate-400 hover:text-red-400 transition-colors text-xs">Đăng xuất</a>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <!-- Breadcrumb -->
      <nav class="text-sm text-slate-500 flex items-center gap-2">
        <a href="https://fap.fpt.edu.vn/Student.aspx" class="hover:text-orange-400 transition-colors">🏠 Trang chủ</a>
        <span>/</span>
        <span class="text-purple-400 font-semibold">🔔 Thông báo</span>
      </nav>

      <!-- Page Title -->
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Thông báo từ nhà trường</h1>
        <p v-if="announcementTitle" class="text-slate-400 mt-1 text-sm">{{ announcementTitle }}</p>
      </div>

      <!-- Announcement Text Content -->
      <div v-if="announcementHtml" class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
        <div class="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed announcement-content"
          v-html="announcementHtml">
        </div>
      </div>

      <!-- Data Table -->
      <div v-if="tableData.length > 0" class="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 class="font-bold text-slate-100">📋 Danh sách lớp dự kiến mở</h2>
          <span class="text-xs text-slate-500">{{ tableData.length - 1 }} lớp</span>
        </div>

        <!-- Search -->
        <div class="px-5 py-3 border-b border-slate-700/50">
          <input v-model="searchQuery" type="text" placeholder="🔍 Tìm kiếm mã môn, tên môn, tên lớp..."
            class="w-full bg-slate-900/80 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-slate-500" />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-900/50">
              <tr>
                <th v-for="(header, i) in tableHeaders" :key="i"
                  class="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-orange-400 transition-colors"
                  @click="sortBy(i)">
                  {{ header }}
                  <span v-if="sortCol === i" class="ml-1 text-orange-400">{{ sortAsc ? '↑' : '↓' }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <tr v-for="(row, ri) in filteredRows" :key="ri"
                class="hover:bg-slate-700/20 transition-colors">
                <td v-for="(cell, ci) in row" :key="ci" class="px-4 py-3 text-slate-300 whitespace-nowrap">
                  <span v-if="ci === 1" class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-mono text-xs">{{ cell }}</span>
                  <span v-else>{{ cell }}</span>
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td :colspan="tableHeaders.length" class="px-4 py-8 text-center text-slate-500">
                  Không tìm thấy kết quả phù hợp.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const userEmail = ref('');
const campus = ref('');
const logoutUrl = ref('https://fap.fpt.edu.vn/Thongbao.aspx?logout=true');
const announcementTitle = ref('');
const announcementHtml = ref('');
const tableHeaders = ref<string[]>([]);
const tableData = ref<string[][]>([]);
const searchQuery = ref('');
const sortCol = ref<number | null>(null);
const sortAsc = ref(true);

const filteredRows = computed(() => {
  const dataRows = tableData.value.slice(1); // bỏ header
  let rows = dataRows;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    rows = rows.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
  }
  if (sortCol.value !== null) {
    const col = sortCol.value;
    rows = [...rows].sort((a, b) => {
      const cmp = (a[col] ?? '').localeCompare(b[col] ?? '', 'vi');
      return sortAsc.value ? cmp : -cmp;
    });
  }
  return rows;
});

const sortBy = (col: number) => {
  if (sortCol.value === col) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortCol.value = col;
    sortAsc.value = true;
  }
};

// Scrape nội dung text của thông báo (loại bỏ table)
const scrapeAnnouncementText = (container: Element): string => {
  const clone = container.cloneNode(true) as Element;
  clone.querySelectorAll('table').forEach(t => t.remove());
  clone.querySelectorAll('script, style').forEach(s => s.remove());
  // Clean inline styles but keep text structure
  clone.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
  clone.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));
  return clone.innerHTML.trim();
};

// Scrape bảng HTML thành mảng 2D
const scrapeTable = (table: HTMLTableElement): string[][] => {
  const result: string[][] = [];
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const cells: string[] = [];
    row.querySelectorAll('td, th').forEach(cell => {
      cells.push(cell.textContent?.replace(/\s+/g, ' ').trim() ?? '');
    });
    if (cells.some(c => c)) result.push(cells);
  });
  return result;
};

onMounted(() => {
  const emailEl = document.querySelector('#ctl00_lblLogIn');
  const campusEl = document.querySelector('#ctl00_lblCampusName');
  const logoutEl = document.querySelector<HTMLAnchorElement>('a[href*="logout=true"]');
  const navEl = document.querySelector('#ctl00_lblNavigation');

  if (emailEl) userEmail.value = emailEl.textContent?.trim() ?? '';
  if (campusEl) campus.value = campusEl.textContent?.replace('CAMPUS:', '').trim() ?? '';
  if (logoutEl) logoutUrl.value = logoutEl.href;
  if (navEl) {
    const boldEl = navEl.querySelector('b');
    if (boldEl) announcementTitle.value = boldEl.textContent?.trim() ?? '';
  }

  // Scrape main content area
  const mainContent = document.querySelector('#ctl00_mainContent_divMain') 
    || document.querySelector('form#aspnetForm > table td:last-child div');

  if (mainContent) {
    // Lấy bảng đầu tiên trong content
    const table = mainContent.querySelector<HTMLTableElement>('table');
    if (table) {
      const allData = scrapeTable(table);
      if (allData.length > 0) {
        tableHeaders.value = allData[0];
        tableData.value = allData;
      }
    }
    // Scrape text (không bao gồm table)
    announcementHtml.value = scrapeAnnouncementText(mainContent);
  }
});
</script>

<style scoped>
.announcement-content :deep(p) {
  margin-bottom: 0.5rem;
}
.announcement-content :deep(b), .announcement-content :deep(strong) {
  color: #f1f5f9;
  font-weight: 600;
}
</style>

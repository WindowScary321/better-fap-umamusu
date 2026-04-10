<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans antialiased fixed inset-0 z-[999999] overflow-y-auto">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">FPT University</span>
          <span class="text-slate-500 text-sm hidden sm:inline">Academic Portal</span>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <span class="text-slate-300 text-xs hidden md:block">📧 {{ userEmail }}</span>
          <span class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">{{ campus }}</span>
          <a :href="logoutUrl" class="text-slate-400 hover:text-red-400 transition-colors text-xs">Đăng xuất</a>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <!-- Breadcrumb -->
      <nav class="text-sm text-slate-500 flex items-center gap-2">
        <a href="https://fap.fpt.edu.vn/Student.aspx" class="hover:text-orange-400 transition-colors">🏠 Trang chủ</a>
        <span>/</span>
        <span class="text-blue-400 font-semibold">📅 Lịch học theo tuần</span>
      </nav>

      <!-- Student + Week Picker -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-100">{{ studentName }}</h1>
          <p class="text-slate-400 text-sm mt-0.5">Lịch học và các hoạt động học tập</p>
        </div>

        <!-- Week Selector (relay to ASP.NET form) -->
        <div class="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5">
          <span class="text-xs text-slate-400 font-medium">Tuần</span>
          <select v-model="selectedWeek" @change="changeWeek"
            class="bg-transparent text-slate-200 text-sm font-semibold focus:outline-none cursor-pointer pr-1">
            <option v-for="opt in weekOptions" :key="opt.value" :value="opt.value"
              class="bg-slate-800 text-slate-200">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 text-xs">
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Đã tham dự</span>
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Vắng mặt</span>
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span> Chưa có dữ liệu</span>
      </div>

      <!-- Empty State -->
      <div v-if="!hasSchedule" class="flex flex-col items-center justify-center py-20 bg-slate-800/40 border border-slate-700/40 rounded-2xl">
        <div class="text-5xl mb-4">📭</div>
        <h2 class="text-lg font-semibold text-slate-300">Không có lịch học trong tuần này</h2>
        <p class="text-slate-500 text-sm mt-1">Hãy chọn tuần khác hoặc kiểm tra lại lịch.</p>
      </div>

      <!-- Schedule Grid -->
      <div v-else class="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/40">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-900/60">
              <th class="sticky left-0 z-10 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20 text-center">Slot</th>
              <th v-for="(day, i) in days" :key="i"
                class="px-3 py-3 text-center min-w-[120px]"
                :class="day.isToday ? 'bg-orange-500/10' : ''">
                <div class="text-xs font-bold" :class="day.isToday ? 'text-orange-400' : 'text-slate-300'">{{ day.name }}</div>
                <div class="text-xs font-medium mt-0.5" :class="day.isToday ? 'text-orange-300' : 'text-slate-500'">{{ day.date }}</div>
                <div v-if="day.isToday" class="w-1.5 h-1.5 rounded-full bg-orange-400 mx-auto mt-1"></div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr v-for="(row, slotIdx) in scheduleRows" :key="slotIdx"
              :class="row.hasClass ? 'bg-slate-800/20' : 'bg-transparent'"
              class="hover:bg-slate-700/10 transition-colors">
              <!-- Slot Label -->
              <td class="sticky left-0 z-10 bg-slate-900/80 px-4 py-2.5 text-center">
                <div class="text-xs font-bold text-slate-400">{{ slotLabels[slotIdx] ?? `S${slotIdx}` }}</div>
                <div class="text-[10px] text-slate-600 mt-0.5 leading-tight">{{ slotTimes[slotIdx] }}</div>
              </td>
              <!-- Day cells -->
              <td v-for="(cell, dayIdx) in row.cells" :key="dayIdx"
                class="px-2 py-2 text-center align-top border-l border-slate-700/20"
                :class="days[dayIdx]?.isToday ? 'bg-orange-500/5' : ''">
                <div v-if="cell" class="rounded-lg p-2 text-left space-y-1"
                  :class="{
                    'bg-green-500/10 border border-green-500/20': cell.status === 'attended',
                    'bg-red-500/10 border border-red-500/20': cell.status === 'absent',
                    'bg-slate-700/30 border border-slate-600/20': cell.status === 'nodata',
                  }">
                  <a :href="cell.detailUrl" target="_blank"
                    class="text-xs font-bold leading-tight hover:underline"
                    :class="{
                      'text-green-300': cell.status === 'attended',
                      'text-red-300': cell.status === 'absent',
                      'text-slate-300': cell.status === 'nodata',
                    }">
                    {{ cell.subject }}
                  </a>
                  <div class="text-[10px] text-slate-400 leading-tight">📍 {{ cell.room }}</div>
                  <div v-if="cell.time" class="text-[10px] font-mono text-blue-400">⏰ {{ cell.time }}</div>
                  <div class="flex gap-1 flex-wrap mt-1">
                    <a v-if="cell.materialsUrl" :href="cell.materialsUrl" target="_blank"
                      class="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors">
                      📚 Materials
                    </a>
                    <a v-if="cell.edunextUrl" :href="cell.edunextUrl" target="_blank"
                      class="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                      🎓 EduNext
                    </a>
                  </div>
                </div>
                <div v-else class="text-slate-700 text-xs">—</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const userEmail = ref('');
const campus = ref('');
const logoutUrl = ref('https://fap.fpt.edu.vn/Report/ScheduleOfWeek.aspx?logout=true');
const studentName = ref('');

const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_NAMES_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Slot time mapping (FAP standard)
const slotTimes: Record<number, string> = {
  0: '', 1: '07:30–09:50', 2: '10:00–12:20', 3: '12:30–14:50',
  4: '15:00–17:20', 5: '17:30–19:50', 6: '20:00–22:20',
};
const slotLabels: Record<number, string> = {
  0: 'Slot 0', 1: 'Slot 1', 2: 'Slot 2', 3: 'Slot 3',
  4: 'Slot 4', 5: 'Slot 5', 6: 'Slot 6', 7: 'Slot 7',
  8: 'Slot 8', 9: 'Slot 9', 10: 'Slot 10', 11: 'Slot 11', 12: 'Slot 12',
};

interface DayHeader { name: string; date: string; isToday: boolean; }
interface ClassCell {
  subject: string; room: string; status: 'attended' | 'absent' | 'nodata';
  time: string; detailUrl: string; materialsUrl: string; edunextUrl: string;
}
interface ScheduleRow { cells: (ClassCell | null)[]; hasClass: boolean; }

const days = ref<DayHeader[]>([]);
const scheduleRows = ref<ScheduleRow[]>([]);
const weekOptions = ref<{ value: string; label: string }[]>([]);
const selectedWeek = ref('');
const hasSchedule = computed(() => scheduleRows.value.some(r => r.hasClass));

const parseCell = (td: Element): ClassCell | null => {
  const text = td.textContent?.trim() ?? '';
  if (text === '-' || text === '') return null;

  const aDetail = td.querySelector<HTMLAnchorElement>('a[href*="ActivityDetail"]');
  const aMaterial = td.querySelector<HTMLAnchorElement>('a[href*="flm.fpt.edu.vn"]');
  const aEdunext = td.querySelector<HTMLAnchorElement>('a[href*="edunext"]');
  const fontGreen = td.querySelector<HTMLElement>('font[color="Green"]');
  const fontRed = td.querySelector<HTMLElement>('font[color="Red"]');
  const timeSpan = td.querySelector<HTMLElement>('span.label-success');

  // Extract subject code only (strip trailing -)
  const subject = (aDetail?.textContent ?? '').replace(/-+$/, '').trim();
  if (!subject) return null;

  // Extract room: look for " at ROOM " pattern in text
  const roomMatch = td.innerHTML.match(/at\s+([A-Z0-9\-]+)\s*</);
  const room = roomMatch ? roomMatch[1] : '';

  const time = (timeSpan?.textContent ?? '').replace(/[()]/g, '').trim();
  const status: ClassCell['status'] = fontGreen ? 'attended' : fontRed ? 'absent' : 'nodata';

  return {
    subject,
    room,
    status,
    time,
    detailUrl: aDetail?.href ?? '#',
    materialsUrl: aMaterial?.href ?? '',
    edunextUrl: aEdunext?.href ?? '',
  };
};

const parseDateHeader = (text: string): { date: string; isToday: boolean } => {
  const today = new Date();
  const [d, m] = text.split('/').map(Number);
  const isToday = today.getDate() === d && today.getMonth() + 1 === m;
  return { date: text, isToday };
};

onMounted(() => {
  const emailEl = document.querySelector('#ctl00_lblLogIn');
  const campusEl = document.querySelector('#ctl00_lblCampusName');
  const logoutEl = document.querySelector<HTMLAnchorElement>('a[href*="logout=true"]');
  const studentEl = document.querySelector('#ctl00_mainContent_lblStudent');

  if (emailEl) userEmail.value = emailEl.textContent?.trim() ?? '';
  if (campusEl) campus.value = campusEl.textContent?.replace('CAMPUS:', '').trim() ?? '';
  if (logoutEl) logoutUrl.value = logoutEl.href;
  if (studentEl) studentName.value = studentEl.textContent?.trim() ?? '';

  // Scrape week options
  const weekSelect = document.querySelector<HTMLSelectElement>('#ctl00_mainContent_drpSelectWeek');
  if (weekSelect) {
    weekSelect.querySelectorAll('option').forEach(opt => {
      weekOptions.value.push({ value: opt.value, label: `Tuần ${opt.value}: ${opt.textContent?.trim()}` });
      if (opt.selected) selectedWeek.value = opt.value;
    });
  }

  // Scrape the main schedule table
  // The schedule table is right after the dropdowns (first major table with Slot rows)
  const allTables = document.querySelectorAll<HTMLTableElement>('form#aspnetForm table');
  let scheduleTable: HTMLTableElement | null = null;
  for (const t of allTables) {
    const firstCell = t.querySelector('td');
    if (firstCell && /Slot/i.test(firstCell.textContent ?? '')) {
      scheduleTable = t;
      break;
    }
  }

  if (!scheduleTable) return;

  const theadRows = scheduleTable.querySelectorAll('thead tr');
  // Row 0: Mon/Tue/.., Row 1: dates
  if (theadRows.length >= 2) {
    const dayNameCells = theadRows[0].querySelectorAll('th');
    const dateCells = theadRows[1].querySelectorAll('th');
    const parsed: DayHeader[] = [];
    // First th is Year/Week selector, skip it
    dayNameCells.forEach((th, i) => {
      if (i === 0) return; // skip Year/Week cell
      const name = DAY_NAMES[i - 1] ?? th.textContent?.trim() ?? '';
      const dateText = dateCells[i - 1]?.textContent?.trim() ?? '';
      const { isToday } = parseDateHeader(dateText);
      parsed.push({ name, date: dateText, isToday });
    });
    days.value = parsed;
  }

  // Parse tbody rows (Slot 0 - 12)
  const tbodyRows = scheduleTable.querySelectorAll('tbody tr');
  const rows: ScheduleRow[] = [];
  tbodyRows.forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length === 0) return;
    const row: ScheduleRow = { cells: [], hasClass: false };
    cells.forEach((td, i) => {
      if (i === 0) return; // skip slot label column
      const cell = parseCell(td);
      row.cells.push(cell);
      if (cell) row.hasClass = true;
    });
    rows.push(row);
  });
  scheduleRows.value = rows;
});

const changeWeek = () => {
  // Trigger ASP.NET postback by changing the original select and submitting
  const weekSelect = document.querySelector<HTMLSelectElement>('#ctl00_mainContent_drpSelectWeek');
  if (weekSelect) {
    weekSelect.value = selectedWeek.value;
    // Trigger the onchange which calls __doPostBack
    weekSelect.dispatchEvent(new Event('change'));
  }
};
</script>

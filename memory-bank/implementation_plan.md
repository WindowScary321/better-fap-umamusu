# Kế hoạch Rewrite: FAP Beautifier bằng Vite + Vue 3 + WXT

Dự án gốc `fap-beautifier` sử dụng React 19, Vite, và một hệ thống build script tùy chỉnh phức tạp do sử dụng `esbuild` ghép tệp. 
Việc chuyển đổi sang **Vue 3** và dùng **WXT** (Next-gen framework for Chrome Extensions) là một quyết định kiến trúc tuyệt vời vì WXT giải quyết hoàn toàn bài toán build phức tạp của extension, còn Vue 3 vươn tới tính module và gọn nhẹ nhờ vào Composition API.

Mục tiêu của sự thay đổi này là:
1. Loại bỏ các build script `esbuild` phức tạp. WXT chạy bằng Vite dưới nền và tự lo chuyện đóng gói manifest.
2. Chuyển React Component sang Vue SFC (Single-File Component).
3. Chuyển đổi React Hooks (`useFapDataCustom`) thành Vue Composables.

---

## Giai đoạn 1: Khởi tạo và Cấu hình hạ tầng WXT

WXT định nghĩa dự án dựa trên thư mục `entrypoints/`. Cấu trúc của WXT sẽ thay thế hoàn toàn cấu trúc build cũ.

### 1.1 Khởi tạo dự án
*   Sử dụng trình quản lý gói `pnpm`: Chạy lệnh `pnpm dlx wxt@latest init fap-beautifier-vue` (chọn template Vue). Mọi thao tác cài đặt gói sau này đều dùng `pnpm`.
*   Cài đặt **Tailwind CSS v4** (hoặc v3 tích hợp) và thiết lập file `assets/tailwind.css`.
*   Cài đặt các thư viện thiết yếu:
    *   `vue-router`: Định tuyến (chuyển qua lại giữa các trang trong dự án một cách mượt mà không tải lại luồng Chrome).
    *   `pinia`: Quản lý trạng thái (State Management) -> Dùng để lưu trữ bộ nhớ DOM gốc khổng lồ đã cào được chia sẻ cho toàn bộ các trang khác xài chung. Thay thế cho React Context rắc rối.
    *   `@tanstack/vue-query`: Trình bắt luồng fetch dữ liệu ngầm cực mạnh -> Dùng để tải trước thông tin các trang ASPX khác lúc chuyển trang, kiêm luôn cơ chế tự bắt/quản lý Cache (bộ nhớ tạm).
    *   `vue-i18n`: Thư viện xử lý Đa ngôn ngữ (i18n) -> Phụ trách việc ráp dịch vụ Anh - Việt vào hệ thống. Cực kỳ dễ đồng bộ file JSON.

### 1.2 Di chuyển Cấu trúc cấu hình sang `wxt.config.ts`
*   Thay vì cấu hình `public/manifest.json` thủ công, tất cả host permissions, `*://fap.fpt.edu.vn/*`, permissions (`storage`, `scripting`, `identity`) sẽ được khai báo thẳng trong `wxt.config.ts`.
*   [Tính năng đa trình duyệt]: WXT cực kỳ bá đạo, nó hỗ trợ code 1 lần build ra cho nhiều trình duyệt. Nó hỗ trợ tất cả các lõi **Chromium** (Chrome, Edge, Opera, Cốc Cốc...) và cả **Firefox** hay Safari. Nó sẽ tự xuất file Manifest V2 hay V3 tuỳ theo tuỳ chọn cấu hình trình duyệt gốc `--browser` truyền vào.

---

## Giai đoạn 2: Migration Lớp Chrome Extension (Background & Content Scripts)

Đây là việc dịch chuyển cốt lõi vì logic "bắt cóc" dữ liệu DOM diễn ra ở đây.

### 2.1 Content Script (`entrypoints/content.ts`)
*   Cấu hình hook `run_at: "document_start"`.
*   **Capture**: Giữ nguyên logic bắt chuỗi `document.documentElement.innerHTML` và lưu tạm.
*   Lưu ý đổi cơ chế lưu từ `window._data` sang một biến được inject an toàn hơn, hoặc nhét thẳng vào một hidden script block.
*   Xóa trắng `document.body` và chèn thẻ `<div id="wxt-vue-root"></div>`.
*   Sử dụng hàm API của WXT (chẳng hạn như `injectContentScript`) để mount UI của Vue vào trang khi tới `document_end`.

### 2.2 Background Service Worker (`entrypoints/background.ts`)
*   Re-write từ TypeScript thuần sang hàm background của WXT.
*   Cài đặt listener `chrome.storage.local.onChanged` và kiểm tra logic Toggle bật/tắt (enabled/disabled).
*   Thực hiện Dynamic Injection nếu cần thiết. Tuy nhiên, WXT có hỗ trợ tính năng **Content Script UI**, cho phép trực tiếp load file Vue lên Shadow DOM hoặc trực tiếp trên Document Body mà không cần tải qua `asset-manifest.json` lằng nhằng như dự án cũ.

---

## Giai đoạn 3: Phục dựng Data Layer (Dữ liệu bị "Bắt cóc")

Khác quan trọng nhất là chuyển đổi `FapDataProvider` (React Context) sang Vue.

### 3.1 Khởi tạo State Store bằng Pinia
*   Tạo `stores/useFapDataStore.ts`: Nơi chứa HTML DOM thô lúc đầu fetch được.
*   Triển khai caching layer: Chuyển logic `dataCache` với thời gian hết hạn (1 phút) vào actions bên trong store.
*   Thực hiện hàm `fetchData` bằng Axios hoặc Fetch thuần, lưu lại giá trị bằng Node DOM ảo (giống DOMParser).

### 3.2 Khởi tạo các Vue Composables (Thay thế thay React Hooks)
*   Tạo `composables/useFapData.ts`: Một generic composable xuất ra DOM node.
*   Tạo `composables/useFapSelector.ts` (Thay cho `useFapDataCustom`): Nhận vào một Object chứa CSS Selectors và callback -> thực hiện bóc tách (scrape HTML) ngay trong runtime -> trả ra `ref()` hoặc `reactive()` data sạch sẽ JSON.

---

## Giai đoạn 4: Re-write Ứng dụng gốc sang Vue UI

### 4.1 Routing & Layout
*   Cài đặt `vue-router`. Khởi tạo Layout Container (`Demo7Layout.vue` tương ứng) với Header, Footer, Toolbar.
*   Thiết kế hệ thống Route: Route tới Dashbord, Route tới Grades, Lịch học, Đơn từ...

### 4.2 Thiết kế Component
*   Chuyển các thành phần UI shadcn/ui hoặc Metronic sang dạng Vue Component (Ví dụ `TuitionAlert.vue`).
*   Chuyển các thành phần biểu đồ/tuần sang ứng dụng tương đương của hệ sinh thái Vue.
*   Thêm thư viện `v-calendar` (hoặc `vue-tailwind-datepicker`) để thay cho `react-calendar` bên bảng "Hoạt động sinh viên/Đặt phòng".

### 4.3 Đảm bảo Đa ngôn ngữ (i18n)
*   Export toàn bộ file JSON ngôn ngữ bản gốc (hơn 346 keys).
*   Đưa vào `vue-i18n`. 
*   Trong SFC, gọi từ móc `$t('key')` tại thẻ template HTML.

---

## Giai đoạn 5: Testing và Hoàn thiện

*   Build ra extension bằng môi trường WXT (`wxt build`).
*   Thử nghiệm side-by-side: Cài extension Vue bên cạnh Extension React và bật/tắt luân phiên để đo tải bộ nhớ (memory leak) và khả năng capture DOM đúng hay xịt.
*   Đóng gói file `.zip` phát hành (WXT tự cung cấp `wxt zip`).

---

## ⚠️ Những điểm trọng yếu cần Review (User Review Required)

> [!WARNING]
> **Về Content Script Injection Cấu trúc WXT**
> Thay vì dùng `background.js` kết hợp với `chrome.scripting.registerContentScripts` và parse file `asset-manifest.json` như mã React đang làm, **WXT trang bị sẵn Content Script UI**. WXT tự biết cách chèn UI Vue trực tiếp lên trang một cách minh bạch. Vậy nên chúng ta sẽ bỏ hẳn module `updateReactScripts` rắc rối của FAP Beautifier. Theo bạn có nên xoá hệ thống Dynamic Inject này và theo quy chuẩn của WXT không?

> [!IMPORTANT]
> **Về tính chất Reactive Data**
> Vue xử lý DOM parsing dạng chuỗi rất khác React (vì hệ thống Vue reactivity track từng object nhỏ). Khi cào dữ liệu từ DOM, ta nên thiết kế `useFapSelector` trả về shallowRef() chứ không nên bọc ref() sâu, nhằm tránh tràn bộ nhớ khi DOM có quá nhiều biến động. Mình dự định sẽ dùng shallowRef cho toàn bộ output khi cạo DOM. Bạn có đồng ý với thiết kế này không?

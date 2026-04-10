import { createApp } from 'vue';
import LoginView from '@/components/LoginView.vue';
import '@/assets/tailwind.css';

export default defineContentScript({
  matches: ['*://fap.fpt.edu.vn/*'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
    console.log('[FAP Beautifier Vue] Content script loaded!');

    // 1. Check if it's Cloudflare DDOS Check Page (Just a moment...)
    // Wait for the real FAP portal which has the `#aspnetForm`
    const hasAspnetForm = document.querySelector('#aspnetForm') !== null;
    const isCloudflare = document.title.includes('Just a moment') || document.querySelector('#challenge-running');

    if (isCloudflare && !hasAspnetForm) {
      console.log('⏳ Đang đợi Cloudflare DDOS verification...');
      return; // Stop here, the browser will reload automatically when CF finishes
    }

    // 2. We are in the real portal, configure logic depending on route
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path === '/' || path === '/default.aspx';

    if (isLoginPage && hasAspnetForm) {
      await injectVueUI(ctx);
    }
  },
});

async function injectVueUI(ctx: any) {
  // Lấy trạng thái cài đặt từ chrome storage (nếu chưa có thì mặc định bật)
  let isCustomUIEnabled = (await storage.getItem<boolean>('local:fap_ui_enabled')) ?? true; 

  if (isCustomUIEnabled) {
    // Ẩn UI gốc khi đang bật mode
    document.body.style.visibility = 'hidden';
  }

  const ui = await createShadowRootUi(ctx, {
    name: 'fap-vue-auth',
    position: 'inline',
    anchor: 'body',
    onMount: (container) => {
      // Đảm bảo UI luôn hiện trên Root
      container.style.visibility = 'visible';

      const wrapper = document.createElement('div');
      
      // Tạo khung App Vue
      const appContainer = document.createElement('div');
      appContainer.style.display = isCustomUIEnabled ? 'block' : 'none';
      wrapper.appendChild(appContainer);

      // Tạo Nút Toggle UI lơ lửng góc dưới
      const toggleBtn = document.createElement('button');
      toggleBtn.innerText = isCustomUIEnabled ? 'Trở về Giao diện cũ' : 'Bật FAP Beautifier';
      toggleBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999999;
        padding: 10px 18px;
        background-color: ${isCustomUIEnabled ? '#475569' : '#f97316'};
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-family: sans-serif;
        font-weight: 600;
        font-size: 13px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.2s ease-in-out;
      `;
      wrapper.appendChild(toggleBtn);

      // Mount Vue
      const app = createApp(LoginView);
      app.mount(appContainer);
      
      // Xử lý logic Click
      toggleBtn.addEventListener('click', async () => {
        isCustomUIEnabled = !isCustomUIEnabled;
        await storage.setItem('local:fap_ui_enabled', isCustomUIEnabled);
        
        if (isCustomUIEnabled) {
          document.body.style.visibility = 'hidden';
          toggleBtn.innerText = 'Trở về Giao diện cũ';
          toggleBtn.style.backgroundColor = '#475569';
          appContainer.style.display = 'block';
        } else {
          document.body.style.visibility = 'visible';
          toggleBtn.innerText = 'Bật FAP Beautifier';
          toggleBtn.style.backgroundColor = '#f97316';
          appContainer.style.display = 'none';
        }
      });

      container.appendChild(wrapper);
      return { app, wrapper };
    },
    onRemove: (elements) => {
      elements?.app?.unmount();
    },
  });

  ui.mount();
}

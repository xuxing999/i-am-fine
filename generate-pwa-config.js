/**
 * PWA 配置自動生成器
 * 用於生成完整的 manifest.json 和 iOS splash screens 配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 版本號
const VERSION = '1.0.0';

// 設備尺寸映射表（根據 pwa-asset-generator 的命名規則）
const DEVICE_SPECS = {
  // iPhone
  'iPhone_17_Pro_Max__iPhone_16_Pro_Max': { width: 440, height: 956, ratio: 3, orientation: 'portrait' },
  'iPhone_17_Pro__iPhone_17__iPhone_16_Pro': { width: 402, height: 874, ratio: 3, orientation: 'portrait' },
  'iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max': { width: 430, height: 932, ratio: 3, orientation: 'portrait' },
  'iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro': { width: 393, height: 852, ratio: 3, orientation: 'portrait' },
  'iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12': { width: 390, height: 844, ratio: 3, orientation: 'portrait' },
  'iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max': { width: 428, height: 926, ratio: 3, orientation: 'portrait' },
  'iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X': { width: 375, height: 812, ratio: 3, orientation: 'portrait' },
  'iPhone_11_Pro_Max__iPhone_XS_Max': { width: 414, height: 896, ratio: 3, orientation: 'portrait' },
  'iPhone_11__iPhone_XR': { width: 414, height: 896, ratio: 2, orientation: 'portrait' },
  'iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus': { width: 414, height: 736, ratio: 3, orientation: 'portrait' },
  'iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE': { width: 375, height: 667, ratio: 2, orientation: 'portrait' },
  '4__iPhone_SE__iPod_touch_5th_generation_and_later': { width: 320, height: 568, ratio: 2, orientation: 'portrait' },
  'iPhone_Air': { width: 430, height: 932, ratio: 3, orientation: 'portrait' },

  // iPad
  '13__iPad_Pro_M4': { width: 1032, height: 1376, ratio: 2, orientation: 'portrait' },
  '12.9__iPad_Pro': { width: 1024, height: 1366, ratio: 2, orientation: 'portrait' },
  '11__iPad_Pro_M4': { width: 834, height: 1210, ratio: 2, orientation: 'portrait' },
  '11__iPad_Pro__10.5__iPad_Pro': { width: 834, height: 1194, ratio: 2, orientation: 'portrait' },
  '10.9__iPad_Air': { width: 820, height: 1180, ratio: 2, orientation: 'portrait' },
  '10.5__iPad_Air': { width: 834, height: 1112, ratio: 2, orientation: 'portrait' },
  '10.2__iPad': { width: 810, height: 1080, ratio: 2, orientation: 'portrait' },
  '9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad': { width: 768, height: 1024, ratio: 2, orientation: 'portrait' },
  '8.3__iPad_Mini': { width: 744, height: 1133, ratio: 2, orientation: 'portrait' },
};

function generateMediaQuery(filename) {
  // 移除 .png 後綴
  const baseName = filename.replace('.png', '');

  // 檢查方向
  const orientation = baseName.endsWith('_landscape') ? 'landscape' : 'portrait';
  const deviceKey = baseName.replace('_landscape', '').replace('_portrait', '');

  const spec = DEVICE_SPECS[deviceKey];

  if (!spec) {
    console.warn(`Unknown device: ${deviceKey}`);
    return null;
  }

  const width = orientation === 'landscape' ? spec.height : spec.width;
  const height = orientation === 'landscape' ? spec.width : spec.height;
  const ratio = spec.ratio;

  return `screen and (device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})`;
}

function generateSplashScreens(iconsDir) {
  const files = fs.readdirSync(iconsDir)
    .filter(f => f.endsWith('.png') && f !== 'icon.png')
    .sort();

  const splashScreens = [];

  for (const file of files) {
    const media = generateMediaQuery(file);
    if (media) {
      splashScreens.push({
        file,
        media,
        href: `/icons/pwa/${file}?v=${VERSION}`
      });
    }
  }

  return splashScreens;
}

function generateManifest() {
  return {
    name: '平安守護',
    short_name: '我很好',
    description: '獨居者的數位平安鐘 - 讓關心不再打擾，讓守護隨時在線',
    start_url: `/?v=${VERSION}`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    scope: '/',
    categories: ['health', 'lifestyle', 'social'],
    lang: 'zh-TW',
    dir: 'ltr',
    icons: [
      {
        src: `/icons/pwa/icon.png?v=${VERSION}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/icons/pwa/icon.png?v=${VERSION}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: `/icon-512.png?v=${VERSION}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: `/apple-touch-icon.png?v=${VERSION}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: `/icons/pwa/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png?v=${VERSION}`,
        sizes: '1179x2556',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'iPhone 主畫面'
      },
      {
        src: `/icons/pwa/12.9__iPad_Pro_portrait.png?v=${VERSION}`,
        sizes: '2048x2732',
        type: 'image/png',
        form_factor: 'wide',
        label: 'iPad 主畫面'
      }
    ]
  };
}

function generateHTMLLinks(splashScreens) {
  const links = splashScreens.map(({ file, media, href }) =>
    `    <link rel="apple-touch-startup-image" media="${media}" href="${href}" />`
  );

  return links.join('\n');
}

// 主程序
const iconsDir = path.join(__dirname, 'client/public/icons/pwa');
const manifest = generateManifest();
const splashScreens = generateSplashScreens(iconsDir);

// 寫入 manifest.json
const manifestPath = path.join(__dirname, 'client/public/manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

// 生成 HTML links
const htmlLinks = generateHTMLLinks(splashScreens);

// 輸出統計
console.log('✅ PWA 配置生成完成！');
console.log('');
console.log('📊 統計資訊：');
console.log(`  - 總圖示數量：${splashScreens.length + 1} (包含主圖示)`);
console.log(`  - iOS 啟動畫面：${splashScreens.length} 個`);
console.log(`  - Manifest 圖示配置：${manifest.icons.length} 個`);
console.log(`  - 版本號：v${VERSION}`);
console.log('');
console.log('📝 HTML Links (複製以下內容到 index.html):');
console.log('');
console.log(htmlLinks);
console.log('');

// 保存 HTML links 到文件
const htmlLinksPath = path.join(__dirname, 'splash-screens.html');
fs.writeFileSync(htmlLinksPath, htmlLinks, 'utf8');
console.log(`💾 HTML links 已保存到：splash-screens.html`);

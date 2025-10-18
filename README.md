### ✨ Taiwan Labor Receipt Generator | 勞務報酬單產生器

Cloudflare Workers + Hono + html2pdf.js 打造
線上即時產生、稅額自動試算、支援 PDF 匯出與 JSON 備份功能的勞務報酬單工具。

👉 查看線上 DEMO

⸻

📌 功能特色

模組 說明
📈 即時計算 依「所得類別」與「國籍／居住別」自動計算稅額與二代健保費
📄 PDF 匯出 使用 html2pdf.js 產生單頁 A4 PDF，不強制分頁，品質清晰
💾 LocalStorage 自動儲存 自動保存輸入資料，避免意外刷新遺失
🔁 JSON 匯入／匯出 一鍵備份或還原整張表單，含 radio/checkbox 狀態、計算結果等
💳 付款方式動態欄位 僅呈現使用者選擇的付款方式（支票、匯款、現金）對應欄位
⚡ 極致輕量部署 採用 Cloudflare Workers + Hono，無伺服器成本，全球節點加速
📱 響應式設計 Tailwind CSS 打造，行動裝置也能流暢填寫表單

⸻

🚀 快速開始

# 1. Clone 本專案

git clone https://github.com/your-id/taiwan-labor-receipt.git
cd taiwan-labor-receipt

# 2. 安裝依賴

npm install

# 3. 啟動本地開發

npm run dev # 開啟 http://localhost:8787

# 4. 建置部署

npm run build # 產生 dist/worker.js

⸻

🗂️ 專案結構
```
taiwan-labor-receipt/
├── public/ # 靜態前端資源
│ ├── index.html # 表單填寫頁面
│ ├── templates/quote.html # PDF 匯出樣板 (Handlebars 風 {{變數}})
│ ├── style.css # 額外自定義樣式
│ └── script.js # 計算、匯出匯入、PDF 下載邏輯
├── src/ # Workers 原始碼
│ └── index.ts # Hono App 設定 (處理 POST /quote)
├── wrangler.toml # Cloudflare Workers 設定檔
├── package.json # 依賴管理
└── README.md # 專案說明
```
⸻

⚙️ 客製化指引

修改 PDF 樣板
• 位置：/public/templates/quote.html
• 使用 {{變數名}} 進行填值，自動對應 src/index.ts 中 templateReplace()。
• 如需調整邊界 → 修改 @page margin + html2pdf.js 匯出參數。

更新稅率公式
• 位置：/public/script.js > updateCalculations()
• 可根據最新國稅局公告調整稅額條件與百分比。

⸻

🛠️ 使用技術
• Cloudflare Workers – 全球分佈的零伺服器架構
• Hono – 超輕量 TypeScript Web 框架
• html2pdf.js – HTML DOM 轉 Canvas 再轉 PDF
• Tailwind CSS 3 – Utility-first CSS
• ESBuild – 極速打包器

⸻

📜 License

Released under the MIT License.
自由使用、修改、商業化。
若有建議或回報問題，歡迎開啟 Issues 或 PR 🙌

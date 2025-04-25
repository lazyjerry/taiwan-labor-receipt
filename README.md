# Taiwan-Labor-Receipt ⬇️

**勞務報酬單產生器｜ Cloudflare Workers + Hono + html2pdf.js**

> 線上填寫 ➜ 一鍵匯出 A4 PDF  
> 內建稅額／二代健保試算、JSON 備份／還原、LocalStorage 自動儲存，並支援「支票｜匯款｜現金」完整付款細節。

---

## ✨ 特色功能

| 模組                 | 重點                                                        |
| -------------------- | ----------------------------------------------------------- |
| **即時計算**         | 依所得類別、國籍／居住別自動計算扣繳稅與二代健保補充保費    |
| **PDF 匯出**         | html2pdf.js 生成單頁 A4（不強制斷頁），可直接列印或下載     |
| **JSON 匯入／匯出**  | 記錄整張表單（含計算結果、radio/checkbox 及表單編號）       |
| **LocalStorage**     | 使用過程即時儲存，再刷頁面資料不遺失                        |
| **付款方式動態欄位** | 只顯示使用者選擇的付款欄位與子項                            |
| **部署輕量**         | 採 **Cloudflare Workers + Hono (TypeScript)**，零伺服器成本 |
| **RWD**              | Tailwind CSS 打造行動裝置亦舒適編輯的 UI                    |

---

## 📂 資料夾結構

taiwan-labor-receipt/
├─ public/ # 靜態檔案部署（Workers Sites）
│ ├─ index.html # 主表單頁面
│ ├─ templates/quote.html # PDF 樣板 (Handlebars 風 {{變數}})
│ ├─ style.css # 額外自訂樣式
│ └─ script.js # 計算 / 匯入匯出 / PDF 下載
├─ src/ # Workers 原始碼
│ └─ index.ts # Hono App (POST /quote)
├─ wrangler.toml # Cloudflare 設定
├─ package.json # dev / build 腳本
└─ README.md

---

## 🚀 快速開始

```bash
# 1. 下載
git clone https://github.com/your-id/taiwan-labor-receipt.git
cd taiwan-labor-receipt

# 2. 安裝
pnpm install   # 或 npm i

# 3. 本地開發
pnpm dev       # Miniflare + 靜態伺服器 http://localhost:8787

# 4. 建置
pnpm build     # esbuild -> dist/worker.js



⸻

🛠️ 可用指令

Script	功能
pnpm dev	Miniflare hot-reload Worker、Vite 伺服器
pnpm build	esbuild 打包 src/ → dist/worker.js
pnpm lint	ESLint + Prettier
pnpm preview	模擬 Cloudflare 執行 dist/worker.js
pnpm deploy	一鍵 wrangler publish 上線



⸻

⚙️ 環境變數（wrangler.toml）

Key	描述	範例
ACCOUNT_ID	Cloudflare 帳號 ID	123abc…
WORKERS_RS	(opt) 是否啟用 Rust-based runtime	true

亦可改用 GitHub Actions → wrangler action 自動部署。

⸻

📝 客製化說明

1. 修改 PDF 樣板

public/templates/quote.html
	•	使用 {{變數名}} 與 src/index.ts templateReplace() 對應
	•	如要更動版面大小 → 修改 @page margin + html2pdf opt.margin

2. 更新稅率公式

public/script.js > updateCalculations()
	•	依最新法令調整臨界金額與百分比
	•	重新 build / deploy 即生效

⸻

💡 技術棧
	•	Cloudflare Workers（電量小、全球節點）
	•	Hono – 輕量 TypeScript Web Framework
	•	html2pdf.js – DOM → Canvas → jsPDF
	•	Tailwind CSS v3 – Utility-first 樣式
	•	ESBuild – 超高速打包

⸻

📜 License

MIT License – 歡迎自由使用、修改與商業化。如有問題或建議，歡迎開  Issue 或提  PR 🙌
```

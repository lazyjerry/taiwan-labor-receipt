// src/index.ts
import { Hono } from "hono"; // Hono 是一個輕量級的 Web 框架
import quoteTemplate from "./templates/quote.html"; // 引入勞務報酬單範本

// ——— helper ———
/// 將 {{key}} 佔位符替換成對應值
function templateReplace(tpl: string, vars: Record<string, string | number>): string {
	return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)), tpl);
}

// --- helper: 值 → 中文顯示文字 ------------------------------------------
const mapResident: Record<string, string> = {
	resident: "本國籍",
	nonResidentTW: "本國籍但未在台居住",
	foreign183: "外國籍在台滿183天",
	foreignNot183: "外國籍在台未滿183天",
};
const mapIdType: Record<string, string> = {
	idcard: "身分證",
	arc: "居留證",
	passport: "護照",
};
const mapPayMethod: Record<string, string> = {
	check: "支票",
	bank: "匯款",
	cash: "現金",
};
const mapCheckReceive: Record<string, string> = {
	pickup: "親領",
	registered: "掛號",
};

// ——— 建立 Hono App ———
const app = new Hono();

/**
 * 依據使用者提交的表單資料，組出勞報單的 HTML
 * 1. 取得表單資料
 */
const handleQuote = async (c) => {
	// 1. 取得表單資料
	const formData = await c.req.raw.clone().formData();
	const raw = Object.fromEntries(formData.entries()) as Record<string, string>;

	// 2. 轉換為人類可讀文字 (若前端已映射則保持原值)
	const view = {
		...raw,
		residentType: mapResident[raw.residentType] ?? raw.residentType ?? "",
		idType: mapIdType[raw.idType] ?? raw.idType ?? "",
		payMethod: mapPayMethod[raw.payMethod] ?? raw.payMethod ?? "",
		checkReceive: mapCheckReceive[raw.checkReceive] ?? raw.checkReceive ?? "",
	};

	// 3. 其他動態欄位
	const quoteNumber = raw.formNumber || `${Date.now()}`;
	const today = (() => {
		const d = new Date();
		return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
	})();

	const formJSON = encodeURIComponent(JSON.stringify(raw));

	// 4. 套用模板
	const html = templateReplace(quoteTemplate, {
		...view,
		quoteNumber,
		formJSON,
		today,
	});

	return c.html(html);
};

// 2. 處理勞務報酬單產生
app.post("/quote", handleQuote);

// 3. 404
app.notFound((c) => c.text("Not Found", 404));

export default app;

// ===== 工具函數 =====
const $$ = (id) => document.getElementById(id);
const addComma = (n) => n.toLocaleString("zh-TW");

// 自動產生表單編號：YYYYMMDD-NNNN
(function genFormNumber() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  // 以時間戳末 4 碼做簡易序號（正式環境請改用 DB AutoIncrement）
  const seq = String(Date.now()).slice(-4);
  const formNumber = `${yyyy}${mm}${dd}-${seq}`;
  $$("formNumber").textContent = formNumber;
  $$("formNumberDisplay").value = formNumber;
})();

// 主計算函式
function updateCalculations() {
  const income = Number($$("incomeAmount").value || 0);
  const type = $$("incomeType").value; // "50" 或 "92"
  const residentType = document.querySelector('input[name="residentType"]:checked')?.value;
  const skipNHI = $$("skipNHI").checked;

  let tax = 0;
  let nhi = 0;

  // --- 扣繳稅 ---
  if (type === "50") {
    if (income > 88501) tax = income * 0.05;
  } else if (type === "92" || type === "9A" || type === "9B") {
    if (residentType === "resident" || residentType === "foreign183") {
      tax = income * 0.1;
    } else {
      tax = income * 0.2;
    }
  }
  if (tax <= 2000) tax = 0; // 稅額 ≤ 2,000 免扣

  // --- 二代健保補充保費 ---
  if (!skipNHI && income > 28590) {
    nhi = income * 0.0211;
  }

  const net = income - tax - nhi;

  // --- 顯示（千分位） ---
  $$("taxDeduct").textContent = addComma(Math.round(tax));
  $$("nhiDeduct").textContent = addComma(Math.round(nhi));
  $$("netPay").textContent = addComma(Math.round(net));
}

// 付款方式切換
function togglePaymentOptions() {
  const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value;

  // 隱藏所有選項
  $$("checkOptions").classList.add("hidden");
  $$("bankOptions").classList.add("hidden");
  $$("cashOptions").classList.add("hidden");

  // 顯示選擇的選項
  if (payMethod === "check") {
    $$("checkOptions").classList.remove("hidden");
  } else if (payMethod === "bank") {
    $$("bankOptions").classList.remove("hidden");
  } else if (payMethod === "cash") {
    $$("cashOptions").classList.remove("hidden");
  }
}

// 掛號地址顯示/隱藏
function toggleMailAddress() {
  const isRegistered = document.querySelector('input[name="checkReceive"]:checked')?.value === "registered";
  $$("mailAddrBox").classList.toggle("hidden", !isRegistered);

  if (isRegistered) {
    $$("mailAddr").required = true;
  } else {
    $$("mailAddr").required = false;
  }
}


// 綁定事件
document.addEventListener("DOMContentLoaded", function () {
  // 計算相關事件
  document.querySelectorAll("#payoutForm input, #payoutForm select").forEach((el) => {
    el.addEventListener("input", updateCalculations);
    el.addEventListener("change", updateCalculations);
  });
  $$("calcBtn").addEventListener("click", updateCalculations);

  // 付款方式切換
  document.querySelectorAll('input[name="payMethod"]').forEach((el) => {
    el.addEventListener("change", togglePaymentOptions);
  });

  // 支票領取方式切換
  document.querySelectorAll('input[name="checkReceive"]').forEach((el) => {
    el.addEventListener("change", toggleMailAddress);
  });

  // 初始計算
  updateCalculations();
  togglePaymentOptions();
});


// === 下載 PDF 按鈕 ===
$$("downloadBtn").addEventListener("click", (e) => {
  e.preventDefault();

  // 確保稅額計算最新
  updateCalculations();

  // 若沒有編號則即時產生
  if (!$$("formNumber").value) {
    const d = new Date();
    const seq = String(Date.now()).slice(-4);
    $$("formNumber").value = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${seq}`;
  }

  // --- 建立隱藏 <form> 送到 /quote ------------------------------
  const tempForm = document.createElement('form');
  tempForm.method = 'POST';
  tempForm.action = '/quote';
  tempForm.target = '_blank';

  const addField = (k, v) => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = k;
    input.value = v ?? '';
    tempForm.appendChild(input);
  };

  // 收集欄位值
  addField('formNumber',  $$("formNumber").value);
  addField('companyName', $$("companyName").value);
  addField('personName',  $$("personName").value);

  const resRadio = document.querySelector('input[name="residentType"]:checked');
  addField('residentType', resRadio ? resRadio.value : '');

  const idRadio = document.querySelector('input[name="idType"]:checked');
  addField('idType', idRadio ? idRadio.value : '');

  addField('idNumber', $$("idNumber").value);
  addField('addrReg',  $$("addrReg").value);
  addField('addrComm', $$("addrComm").value || '同戶籍地址');
  addField('phone',    $$("phone").value);

  addField('incomeType', $$("incomeType").options[$$("incomeType").selectedIndex].text);
  addField('incomeAmount', $$("incomeAmount").value);
  addField('skipNHI', $$("skipNHI").checked ? '是' : '否');

  addField('taxDeduct', $$("taxDeduct").value);
  addField('nhiDeduct', $$("nhiDeduct").value);
  addField('netPay',   $$("netPay").value);

  const payRadio = document.querySelector('input[name="payMethod"]:checked');
  const payMethod = payRadio ? payRadio.value : '';
  addField('payMethod', payMethod);

  if (payMethod === 'check') {
    const checkR = document.querySelector('input[name="checkReceive"]:checked');
    addField('checkReceive', checkR ? checkR.value : '');
    addField('mailAddr', $$("mailAddr") ? $$("mailAddr").value : '');
  } else if (payMethod === 'bank') {
    addField('bankName',   $$("bankName").value);
    addField('bankBranch', $$("bankBranch").value);
    addField('bankAccount',$$("bankAccount").value);
    addField('bankHolder', $$("bankHolder").value);
  }

  addField('taxDeduct', $$("taxDeduct").textContent.replace(/,/g, ''));
  addField('nhiDeduct', $$("nhiDeduct").textContent.replace(/,/g, '')); 
  addField('netPay',   $$("netPay").textContent.replace(/,/g, ''));

  // 送出
  document.body.appendChild(tempForm);
  tempForm.submit();
  tempForm.remove();
});

/**
 * 一鍵啟用「自動儲存／還原」，
 * 針對 <input> (含 radio/checkbox)、<select> 自動監聽。
 *
 * 用法：
 *   1. 先在 DOMContentLoaded 後呼叫  initFieldPersistence('#payoutForm');
 *   2. 不需改動 HTML，所有欄位輸入都會即時寫入 localStorage，
 *      下次載入頁面自動填回。
 */

function initFieldPersistence(formSelector = 'form') {
  const PREFIX = 'payoutForm.';            // localStorage key 前綴
  const form   = document.querySelector(formSelector);
  if (!form) return;

  // ---- 還原階段 -----------------------------------------------------------
  form.querySelectorAll('input, select').forEach((el) => {
    const key = PREFIX + (el.id || el.name);
    const saved = localStorage.getItem(key);
    if (saved === null) return;

    // radio/checkbox 由 value 比對
    if (el.type === 'radio' || el.type === 'checkbox') {
      el.checked = el.value === saved;
    } else {
      el.value = saved;
    }
  });

  // ---- 監聽並即時寫入 -----------------------------------------------------
  form.addEventListener('input', persist);
  form.addEventListener('blur', persist);
  form.addEventListener('change', persist);

  function persist(e) {
    const el = e.target;
    if (!el.name && !el.id) return;        // 必須有 id 或 name 作為 key
    const key = PREFIX + (el.id || el.name);

    if (el.type === 'radio') {
      if (el.checked) localStorage.setItem(key, el.value);
    } else if (el.type === 'checkbox') {
      localStorage.setItem(key, el.checked ? el.value : '');
    } else {
      localStorage.setItem(key, el.value);
    }
  }
}
/**
* 讀取 localStorage 中儲存的欄位值並回填到表單。
* - 預設只『還原』資料，不額外綁定監聽或寫入。
* - 如需自動呼叫，請在 DOMContentLoaded 後執行：
*     restoreFormData('#payoutForm');
*/
function restoreFormData(formSelector = '#payoutForm') {
 const PREFIX = 'payoutForm.';
 const form   = document.querySelector(formSelector);
 if (!form) return;

 form.querySelectorAll('input, select').forEach((el) => {
   const key = PREFIX + (el.id || el.name);
   const saved = localStorage.getItem(key);
   if (saved === null) return;

   if (el.type === 'radio' || el.type === 'checkbox') {
     // radio / checkbox 以 value 判斷
     el.checked = el.value === saved;
   } else {
     el.value = saved;
   }
 });

 // 還原完畢後，若需要立即重新計算，可呼叫既有 updateCalculations()
 if (typeof updateCalculations === 'function') updateCalculations();
}

// 在頁面載入後啟用
document.addEventListener('DOMContentLoaded', () => {
  initFieldPersistence('#payoutForm');
  restoreFormData('#payoutForm');
});


// === 隨機填充（Demo 用） ===
function autofillForm() {
  const $$ = (id) => document.getElementById(id)
    const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    // 基本資料
    const companies = ['測驗股份有限公司', '雲端數位工作室', '範例科技股份有限公司','伍壹柒數位工作室']
    const persons   = ['王小明', '陳淑芬', '林大衛', '張雅婷', '李惠美']
    const addrs     = ['台北市中正區重慶南路一段 122 號', '新北市板橋區文化路 100 號', '高雄市前鎮區中山二路 5 號']
    const addrComm  = ['','','','台北市萬華區華西街 129 號', '台中市中區三民路二段 87 號', '高雄市三民區建興路 391 號']
    const phones    = ['0911222333', '0987654321', '0922333444']
    const ids       = ['A123456789', 'B987654321', 'F223344556']

    $$('companyName').value = randItem(companies)
    $$('personName').value  = randItem(persons)
    $$('idNumber').value    = randItem(ids)
    $$('addrReg').value     = randItem(addrs)
    
    $$('addrComm').value    = randItem(addrComm)
    $$('phone').value       = randItem(phones)

    // Radio
    const pickRadio = (name, value) => {
      const el = document.querySelector(`input[name=\"${name}\"][value=\"${value}\"]`)
      if (el) el.checked = true
    }
    pickRadio('residentType', randItem(['resident','nonResidentTW','foreign183','foreignNot183']))
    pickRadio('idType',       randItem(['idcard','arc','passport']))

    // 所得
    const incomeSel = $$('incomeType')
    incomeSel.value = randItem(Array.from(incomeSel.options).map(o => o.value))
    $$('incomeAmount').value = randInt(24000, 500000)
    $$('skipNHI').checked = Math.random() < 0.3

    // 付款方式
    const payMethod = randItem(['check','bank','cash'])
    pickRadio('payMethod', payMethod)
    document.querySelectorAll('input[name=\"payMethod\"]').forEach(el => el.dispatchEvent(new Event('change', {bubbles:true})))

    if (payMethod === 'check') {
      const rec = randItem(['pickup','registered'])
      pickRadio('checkReceive', rec)
      document.querySelectorAll('input[name=\"checkReceive\"]').forEach(el => el.dispatchEvent(new Event('change', {bubbles:true})))
      if (rec === 'registered' && $$('mailAddr')) $$('mailAddr').value = randItem(addrs)
    } else if (payMethod === 'bank') {
      const banks   = ['台灣銀行','台北富邦銀行','玉山銀行']
      const branchs = ['中山分行','板橋分行','文化分行']
      $$('bankName').value    = randItem(banks)
      $$('bankBranch').value  = randItem(branchs)
      $$('bankAccount').value = randInt(100000000000, 999999999999).toString()
      $$('bankHolder').value  = randItem(persons)
    } else {
      if ($$('cashConfirm')) $$('cashConfirm').checked = true
    }
    
  // 重新計算
  updateCalculations();
}

/* ========= 勞務報酬單 JSON 匯出 / 匯入 ========= */

/* ======== 全欄位 JSON 匯出 / 匯入 ======== */

/**
 * 將整張表單（含隱藏欄位、計算結果、checkbox 狀態）完整匯出為 JSON 並下載
 * @param {string} formSelector 目標表單 CSS Selector
 */
function exportFormJSON(formSelector = '#payoutForm') {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const data = {};

  // 1) 擷取所有 <input>/<select>/<textarea>
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    const key = el.name || el.id;
    if (!key) return;

    if (el.type === 'radio') {
      if (el.checked) data[key] = el.value;
    } else if (el.type === 'checkbox') {
      data[key] = el.checked;              // 以布林記錄勾選狀態
    } else {
      data[key] = el.value;
    }
  });

  // 2) 額外擷取顯示用 <span> 及計算結果
  ['formNumber', 'formNumberDisplay', 'taxDeduct', 'nhiDeduct', 'netPay'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) data[id] = el.textContent || el.value || '';
  });

  // 3) 下載
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const filename = `payout_${data.formNumber || Date.now()}.json`;
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * 匯入 JSON 並回填到表單（含 radio/checkbox 與計算結果）
 * @param {Object|string} json          前次匯出的 JSON 物件或字串
 * @param {string}        formSelector  目標表單 CSS Selector
 */
function importFormJSON(json, formSelector = '#payoutForm') {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  const form = document.querySelector(formSelector);
  if (!form || !data) return;

  // 1) 回填欄位值
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    const key = el.name || el.id;
    if (!(key in data)) return;

    if (el.type === 'radio') {
      el.checked = data[key] === el.value;
    } else if (el.type === 'checkbox') {
      el.checked = !!data[key];
    } else {
      el.value = data[key];
    }
  });

  // 2) 還原顯示用 <span> 與只讀 input
  if (data.formNumber) {
    const span = document.getElementById('formNumber');
    if (span) span.textContent = data.formNumber;
    const disp = document.getElementById('formNumberDisplay');
    if (disp) disp.value = data.formNumber;
  }
  ['taxDeduct', 'nhiDeduct', 'netPay'].forEach((id) => {
    if (data[id] !== undefined) {
      const el = document.getElementById(id);
      if (el) el.textContent = data[id];
    }
  });

  // 3) 依欄位重新顯示 UI 及計算
  if (typeof togglePaymentOptions === 'function') togglePaymentOptions();
  if (typeof toggleMailAddress === 'function')   toggleMailAddress();
  if (typeof updateCalculations === 'function')  updateCalculations();
}

/* ======== 輔助：檔案匯入按鈕 ========
   <input type="file" id="jsonFileInput" accept=".json" class="hidden" onchange="handleJSONFile(this)">
------------------------------------------------*/
function handleJSONFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => importFormJSON(reader.result);
  reader.readAsText(file, 'utf-8');
}
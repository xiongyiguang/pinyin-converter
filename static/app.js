const state = {
  records: [],
};

const manualNames = document.getElementById("manualNames");
const inputFile = document.getElementById("inputFile");
const datFile = document.getElementById("datFile");
const generationMode = document.getElementById("generationMode");
const modeHint = document.getElementById("modeHint");
const converterPath = document.getElementById("converterPath");
const parseButton = document.getElementById("parseButton");
const inspectButton = document.getElementById("inspectButton");
const generateButton = document.getElementById("generateButton");
const downloadButton = document.getElementById("downloadButton");
const resultBody = document.getElementById("resultBody");
const inspectBody = document.getElementById("inspectBody");
const summaryText = document.getElementById("summaryText");
const messageBox = document.getElementById("messageBox");
const inspectMessageBox = document.getElementById("inspectMessageBox");
const codeColumnTitle = document.getElementById("codeColumnTitle");
const inspectCodeColumnTitle = document.getElementById("inspectCodeColumnTitle");
const detectedDatType = document.getElementById("detectedDatType");
const detectedDatHint = document.getElementById("detectedDatHint");
const themeOptions = document.querySelectorAll(".theme-option");

const defaultTheme = "desktop";
const validThemes = new Set(["desktop", "workbench", "macos", "gov"]);

const modeDetails = {
  custom_phrase: {
    title: "拼音首字母",
    typeName: "用户自定义短语 DAT",
    hint: "用于“用户自定义短语 -> 导入”，编码默认是姓名拼音首字母，可手工修改。",
    message: "解析完成，可以直接在表格里修改拼音首字母",
  },
  self_study: {
    title: "全拼编码",
    typeName: "自学习词汇 DAT",
    hint: "用于“自学习词汇 -> 导入”，编码默认是空格分隔全拼，例如 zhang san，可手工修改多音字。",
    message: "解析完成，可以直接在表格里修改全拼编码，多个字请用空格分隔",
  },
};

function applyTheme(theme) {
  const nextTheme = validThemes.has(theme) ? theme : defaultTheme;
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("pinyin-converter-theme", nextTheme);
  themeOptions.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeOption === nextTheme);
  });
}

function setButtonLoading(button, isLoading, loadingText) {
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }
  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

function showMessage(target, text, type) {
  target.textContent = text;
  target.className = `message ${type}`;
}

function hideMessage(target) {
  target.className = "message hidden";
  target.textContent = "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTable() {
  const details = modeDetails[generationMode.value];
  codeColumnTitle.textContent = details.title;
  if (!state.records.length) {
    resultBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="2">点击“解析并预览”后在这里查看并修改${details.title}</td>
      </tr>
    `;
    generateButton.disabled = true;
    return;
  }

  resultBody.innerHTML = state.records
    .map(
      (record, index) => `
        <tr>
          <td>${escapeHtml(record.name)}</td>
          <td>
            <input
              type="text"
              value="${escapeHtml(record.code)}"
              data-index="${index}"
              class="code-input"
            >
          </td>
        </tr>
      `
    )
    .join("");
  generateButton.disabled = false;
}

function renderInspectTable(records, mode) {
  const details = modeDetails[mode] || { title: "编码" };
  inspectCodeColumnTitle.textContent = details.title;

  if (!records.length) {
    inspectBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="2">上传 DAT 后在这里查看内容</td>
      </tr>
    `;
    return;
  }

  inspectBody.innerHTML = records
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.name)}</td>
          <td>${escapeHtml(record.code)}</td>
        </tr>
      `
    )
    .join("");
}

function syncEditedCodes() {
  const inputs = document.querySelectorAll(".code-input");
  inputs.forEach((input) => {
    const index = Number(input.dataset.index);
    state.records[index].code = input.value.trim().toLowerCase();
  });
}

async function parseNames() {
  hideMessage(messageBox);
  downloadButton.classList.add("hidden");
  generateButton.disabled = true;
  setButtonLoading(parseButton, true, "解析中...");

  const formData = new FormData();
  formData.append("manual_names", manualNames.value);
  formData.append("mode", generationMode.value);
  if (inputFile.files[0]) {
    formData.append("input_file", inputFile.files[0]);
  }

  try {
    const response = await fetch("/api/parse", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      state.records = [];
      renderTable();
      summaryText.textContent = "还没有解析结果";
      showMessage(messageBox, data.error || "解析失败", "error");
      return;
    }

    state.records = data.records;
    renderTable();
    const source = data.summary.source_file ? `，文件：${data.summary.source_file}` : "";
    summaryText.textContent = `共解析 ${data.summary.count} 条有效记录${source}，模式：${generationMode.options[generationMode.selectedIndex].text}`;
    showMessage(messageBox, modeDetails[generationMode.value].message, "success");
  } catch (error) {
    showMessage(messageBox, "解析请求失败，请确认服务仍在运行", "error");
  } finally {
    setButtonLoading(parseButton, false);
  }
}

async function inspectDat() {
  hideMessage(inspectMessageBox);
  detectedDatType.textContent = "解析中...";
  detectedDatHint.textContent = "正在调用 ImeWlConverter 读取 DAT 内容。";

  if (!datFile.files[0]) {
    detectedDatType.textContent = "未上传";
    detectedDatHint.textContent = "请先选择 .dat 文件。";
    showMessage(inspectMessageBox, "请先选择 DAT 文件", "error");
    return;
  }

  setButtonLoading(inspectButton, true, "查看中...");
  const formData = new FormData();
  formData.append("mode", generationMode.value);
  formData.append("converter_path", converterPath.value.trim());
  formData.append("dat_file", datFile.files[0]);

  try {
    const response = await fetch("/api/inspect-dat", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      renderInspectTable([], generationMode.value);
      detectedDatType.textContent = "解析失败";
      detectedDatHint.textContent = data.error || "请确认 DAT 文件是否损坏。";
      showMessage(inspectMessageBox, data.error || "解析 DAT 失败", "error");
      return;
    }

    const detectedMode = data.summary.mode;
    const details = modeDetails[detectedMode];
    renderInspectTable(data.records, detectedMode);
    detectedDatType.textContent = details.typeName;
    detectedDatHint.textContent = `格式：${detectedMode === "custom_phrase" ? "win10mspy" : "win10mspyss"}，共 ${data.summary.count} 条记录，文件：${data.summary.source_file}`;
    showMessage(inspectMessageBox, `DAT 解析完成：${details.typeName}，共 ${data.summary.count} 条记录`, "success");
  } catch (error) {
    detectedDatType.textContent = "解析失败";
    detectedDatHint.textContent = "请求失败，请确认服务仍在运行。";
    showMessage(inspectMessageBox, "解析 DAT 请求失败，请确认服务仍在运行", "error");
  } finally {
    setButtonLoading(inspectButton, false);
  }
}

async function generateDat() {
  hideMessage(messageBox);
  syncEditedCodes();
  setButtonLoading(generateButton, true, "生成中...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: generationMode.value,
        converter_path: converterPath.value.trim(),
        records: state.records,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      downloadButton.classList.add("hidden");
      showMessage(messageBox, data.error || "生成失败", "error");
      return;
    }

    downloadButton.href = data.download_url;
    downloadButton.classList.remove("hidden");
    showMessage(messageBox, `${data.message}，输出大小 ${data.dat_size} 字节`, "success");
  } catch (error) {
    downloadButton.classList.add("hidden");
    showMessage(messageBox, "生成请求失败，请确认服务仍在运行", "error");
  } finally {
    setButtonLoading(generateButton, false);
  }
}

parseButton.addEventListener("click", parseNames);
inspectButton.addEventListener("click", inspectDat);
generateButton.addEventListener("click", generateDat);
themeOptions.forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeOption);
  });
});
generationMode.addEventListener("change", () => {
  const details = modeDetails[generationMode.value];
  modeHint.textContent = details.hint;
  state.records = [];
  renderTable();
  summaryText.textContent = "切换模式后请重新解析";
  downloadButton.classList.add("hidden");
  hideMessage(messageBox);
});
datFile.addEventListener("change", () => {
  detectedDatType.textContent = datFile.files[0] ? "待识别" : "未上传";
  detectedDatHint.textContent = datFile.files[0]
    ? "点击“查看 DAT 文件”后会自动识别类型。"
    : "可查看两种类型：用户自定义短语 DAT、自学习词汇 DAT。";
  renderInspectTable([], generationMode.value);
  hideMessage(inspectMessageBox);
});
resultBody.addEventListener("input", (event) => {
  if (event.target.classList.contains("code-input")) {
    syncEditedCodes();
  }
});

applyTheme(localStorage.getItem("pinyin-converter-theme") || defaultTheme);

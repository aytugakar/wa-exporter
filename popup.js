let dataStore = {
  directChats: [],
  savedContacts: [],
  allDiscovered: [],
  groups: []
};

const btnFetch = document.getElementById("btnFetch");
const btnVCF = document.getElementById("btnVCF");
const btnCSV = document.getElementById("btnCSV");
const btnGroupMembers = document.getElementById("btnGroupMembers");

const countChats = document.getElementById("countChats");
const countSaved = document.getElementById("countSaved");
const countAll = document.getElementById("countAll");
const countGroups = document.getElementById("countGroups");
const statusDiv = document.getElementById("status");

// Metinler _locales/<dil>/messages.json'dan gelir; Chrome tarayıcı diline göre seçer.
const t = (key) => chrome.i18n.getMessage(key);

document.documentElement.lang = chrome.i18n.getUILanguage();
document.querySelectorAll("[data-i18n]").forEach(el => {
  el.textContent = t(el.dataset.i18n);
});

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function getSelectedScopeList() {
  const selectedScope = document.querySelector('input[name="scope"]:checked').value;
  return dataStore[selectedScope] || [];
}

// 1. Verileri Çek
btnFetch.addEventListener("click", async () => {
  statusDiv.innerText = t("statusScanning");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url.includes("web.whatsapp.com")) {
    statusDiv.innerText = t("statusOpenWhatsApp");
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_CONTACTS" }, (response) => {
    if (chrome.runtime.lastError || !response || response.error) {
      statusDiv.innerText = t("statusError");
      return;
    }

    dataStore = {
      directChats: response.data.directChats || [],
      savedContacts: response.data.savedContacts || [],
      allDiscovered: response.data.allDiscovered || [],
      groups: response.data.groups || []
    };

    countChats.innerText = dataStore.directChats.length;
    countSaved.innerText = dataStore.savedContacts.length;
    countAll.innerText = dataStore.allDiscovered.length;
    countGroups.innerText = dataStore.groups.length;

    statusDiv.innerText = t("statusReady");

    btnVCF.disabled = false;
    btnCSV.disabled = false;
    if (dataStore.groups.length > 0) {
      btnGroupMembers.disabled = false;
    }
  });
});

// 2. vCard (.vcf)
btnVCF.addEventListener("click", () => {
  const list = getSelectedScopeList();
  if (list.length === 0) {
    statusDiv.innerText = t("statusEmptyScope");
    return;
  }

  let vcf = "";
  list.forEach(c => {
    vcf += `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${c.name}\r\nTEL;TYPE=CELL:${c.phone}\r\nEND:VCARD\r\n`;
  });

  const scopeName = document.querySelector('input[name="scope"]:checked').value;
  downloadFile(vcf, `wa_${scopeName}.vcf`, "text/vcard");
});

// 3. Google Contacts CSV
btnCSV.addEventListener("click", () => {
  const list = getSelectedScopeList();
  if (list.length === 0) {
    statusDiv.innerText = t("statusEmptyScope");
    return;
  }

  let csv = "\uFEFFName,Given Name,Family Name,Phone 1 - Type,Phone 1 - Value\r\n";
  list.forEach(c => {
    const cleanName = `"${c.name.replace(/"/g, '""')}"`;
    csv += `${cleanName},${cleanName},,Mobile,${c.phone}\r\n`;
  });

  const scopeName = document.querySelector('input[name="scope"]:checked').value;
  downloadFile(csv, `wa_${scopeName}_google.csv`, "text/csv;charset=utf-8;");
});

// 4. Grup Üyeleri CSV
btnGroupMembers.addEventListener("click", () => {
  if (dataStore.groups.length === 0) return;

  let csv = `\uFEFF${t("groupCsvHeader")}\r\n`;
  dataStore.groups.forEach(g => {
    const groupName = `"${(g.groupName || t("unnamedGroup")).replace(/"/g, '""')}"`;
    g.participants.forEach(p => {
      const pName = `"${p.name.replace(/"/g, '""')}"`;
      csv += `${groupName},${g.groupId},${pName},${p.phone}\r\n`;
    });
  });

  downloadFile(csv, t("groupCsvFileName"), "text/csv;charset=utf-8;");
});

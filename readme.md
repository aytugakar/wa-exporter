# WA Contacts & Groups Extractor

Extract, filter, and export WhatsApp Web contacts, 1-on-1 chats, and group participants seamlessly.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)](https://github.com/ahalilakar/wa-contact-exporter/releases)
[![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/ahalilakar/wa-contact-exporter)](https://github.com/ahalilakar/wa-contact-exporter/issues)
[![Discussions](https://img.shields.io/github/discussions/ahalilakar/wa-contact-exporter)](https://github.com/ahalilakar/wa-contact-exporter/discussions)

[English](#-english) • [Türkçe](#-türkçe)

---

## 🌐 English

A lightweight, privacy-focused Chrome Extension (Manifest V3) that extracts your WhatsApp Web contacts, 1-on-1 chats, and group members directly from memory/local storage without requiring external servers or credentials. Export in formats ready for Google Contacts and mobile devices.

### 🚀 Tech Stack

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chrome Extensions](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### ✨ Key Features

- **Categorized Extraction:**
  - **1-on-1 Direct Chats Only:** Filters out random group participants with whom you have no direct chat history.
  - **Saved Address Book:** Extracts only users saved with an actual display name.
  - **All Discovered Contacts:** Combines both active chats and cached participants.
  - **Group Breakdown:** Catalogs groups and lists all their participant phone numbers and push names.
- **Multiple Export Formats:**
  - **vCard (.vcf):** Directly importable into iOS, Android, and macOS Address Book.
  - **Google Contacts CSV:** Pre-formatted with matching headers (`Name`, `Given Name`, `Phone 1 - Type`, `Phone 1 - Value`).
  - **Group CSV:** Tabulates `Group Name`, `Group ID`, `Participant Name`, and `Phone`.
- **Privacy-First Architecture:** 100% client-side execution. No telemetry, third-party trackers, or external network requests.

### 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                      WhatsApp Web                      │
│      [Webpack Store / ChatCollection / IndexedDB]      │
└───────────────────────────┬────────────────────────────┘
                            │ Injected Execution
                            ▼
                  [page-script.js]
             (Resolves & Filters Models)
                            │ window.postMessage
                            ▼
                    [content.js]
               (Runtime Bridge Layer)
                            │ chrome.tabs.sendMessage
                            ▼
              [popup.js] ──► [popup.html]
         (Format Converters: vCard / CSV)
```

### 📥 Installation & Usage

1. **Clone or Download:**
   ```bash
   git clone [https://github.com/ahalilakar/wa-contact-exporter.git](https://github.com/ahalilakar/wa-contact-exporter.git)
   ```
2. **Load into Chrome:**
   - Navigate to `chrome://extensions/` in your browser.
   - Enable **Developer mode** (top-right toggle).
   - Click **Load unpacked** and select the extension folder.
3. **Run Extraction:**
   - Open and log in to [WhatsApp Web](https://web.whatsapp.com).
   - Click the extension icon in the toolbar.
   - Click **Verileri Çek / Yenile** (Fetch/Refresh).
   - Select your export scope and click **vCard (.vcf)** or **Google Kişiler (CSV)**.
4. **Import to Google Contacts:**
   - Go to [Google Contacts](https://contacts.google.com).
   - Click **Import** on the sidebar and upload the generated CSV or VCF file.

### 📂 File Structure

```text
wa-contact-exporter/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json       # Manifest V3 configurations & permissions
├── popup.html          # Extension UI
├── popup.js            # UI handler and export engines (vCard/CSV)
├── content.js          # Isolated context bridge
├── page-script.js      # Main WhatsApp DOM/Store parser
└── README.md
```

### 🤝 Community & Support

- 🐛 **Found a bug?** Open an [Issue](https://github.com/ahalilakar/wa-contact-exporter/issues).
- 💡 **Feature idea?** Submit a [Feature Request](https://github.com/ahalilakar/wa-contact-exporter/issues/new?template=feature_request.md).
- 💬 **Questions or discussions?** Join our [Discussions](https://github.com/ahalilakar/wa-contact-exporter/discussions).
- 🔀 **Contributions:** Pull Requests are welcome!

---

## 🇹🇷 Türkçe

WhatsApp Web üzerinden kişilerinizi, doğrudan mesajlaştığınız sohbetleri ve grup üyelerini dış sunuculara veya harici API'lara ihtiyaç duymadan, yerel bellek üzerinden ayıklayan ve dışa aktaran açık kaynaklı bir Chrome Eklentisidir (Manifest V3).

### 🛠️ Teknolojiler

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chrome Extensions](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### 🌟 Özellikler

- **Gelişmiş Filtreleme:**
  - **Sadece Sohbetler:** Ortak gruplarda bulunup hiç mesajlaşmadığınız yabancı numaraları eler, yalnızca birebir sohbet geçmişiniz olanları listeler.
  - **Kayıtlı Rehberim:** Yalnızca isim verilerek kaydedilmiş kişileri filtreler.
  - **Gruplar Dahil Tümü:** Aktif sohbetler ve gruplardan yakalanan tüm benzersiz numaraları toplar.
  - **Grup Üyeleri:** Tüm grupları ve katılımcı listelerini grup bazlı olarak dışa aktarır.
- **Dışa Aktarma Formatları:**
  - **vCard (.vcf):** iOS, Android, macOS ve Outlook rehberlerine doğrudan çift tıklayarak aktarılabilir.
  - **Google Kişiler (CSV):** Google Contacts içe aktarma standartlarına tam uyumlu sütun başlıkları (`Name`, `Given Name`, `Phone 1 - Type`, `Phone 1 - Value`).
  - **Grup Katılımcıları (CSV):** Grup adı, Grup ID'si, Katılımcı adı ve telefon sütunlarıyla tam döküm.
- **Gizlilik Odaklı:** Bütün işlemler tarayıcınızın belleğinde gerçekleşir. Hiçbir veri kaydedilmez, harici sunucuya iletilmez.

### 📥 Kurulum ve Kullanım

1. **Projeyi İndirin:**
   ```bash
   git clone [https://github.com/ahalilakar/wa-contact-exporter.git](https://github.com/ahalilakar/wa-contact-exporter.git)
   ```
2. **Chrome'a Ekleyin:**
   - Tarayıcınızda `chrome://extensions/` adresine gidin.
   - Sağ üstteki **Geliştirici modu** anahtarını açın.
   - **Paketlenmemiş öge yükle** butonuna basarak proje klasörünü seçin.
3. **Çalıştırma:**
   - [web.whatsapp.com](https://web.whatsapp.com) adresine gidin ve oturum açın.
   - Araç çubuğundaki eklenti simgesine tıklayın.
   - **Verileri Çek / Yenile** butonuna basın.
   - İhtiyacınız olan kapsamı seçip **vCard (.vcf)** veya **Google Kişiler (CSV)** butonuna tıklayın.
4. **Google Kişiler'e Aktarma:**
   - [Google Contacts](https://contacts.google.com) adresine gidin.
   - Sol menüden **İçe aktar** seçeneğine tıklayıp indirdiğiniz CSV veya VCF dosyasını yükleyin.

### 💬 Katkı ve İletişim

- 🐛 Bir sorunla mı karşılaştınız? [Hata Bildirin (Issue)](https://github.com/ahalilakar/wa-contact-exporter/issues).
- 💡 Yeni bir özellik mi öneriyorsunuz? [İstek Açın](https://github.com/ahalilakar/wa-contact-exporter/issues/new).
- 💬 Toplulukla tartışmak için: [Discussions](https://github.com/ahalilakar/wa-contact-exporter/discussions).
- 🛠️ Katkıda bulunmak için Pull Request gönderebilirsiniz.

---

## 👨‍💻 Author / Geliştirici

**A. Halil AKAR**
- ✉️ Email: [aytugakar@gmail.com](mailto:aytugakar@gmail.com)
- 🐙 GitHub: [@ahalilakar](https://github.com/ahalilakar)
- 💼 LinkedIn: [ahalilakar](https://www.linkedin.com/in/ahalilakar)

---

## 📄 License / Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır.
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

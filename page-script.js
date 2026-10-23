(async function extractWAContactsRobust() {
  function formatPhone(raw) {
    if (!raw) return null;
    let str = "";
    if (typeof raw === "string") str = raw;
    else if (typeof raw === "object") str = raw._serialized || raw.user || "";

    // Grupları (@g.us), bültenleri/kanalları (@newsletter), yayın listelerini (@broadcast) doğrudan ele
    if (str.includes("@g.us") || str.includes("@newsletter") || str.includes("@broadcast")) {
      return null;
    }

    const phoneOnly = str.split("@")[0].replace(/\D/g, "");
    return phoneOnly && phoneOnly.length >= 7 ? `+${phoneOnly}` : null;
  }

  function getCleanName(contactObj, fallback) {
    if (!contactObj) return fallback;
    return (
      contactObj.name ||
      contactObj.formattedTitle ||
      contactObj.pushname ||
      contactObj.verifiedName ||
      fallback
    );
  }

  // --- 1. WhatsApp Web Dahili Store Nesnesini Çekme ---
  function getWhatsAppInternalStore() {
    if (window.Store && window.Store.Chat && window.Store.Contact) {
      return window.Store;
    }

    try {
      if (typeof window.require === "function") {
        const Chat = window.require("WAWebChatCollection")?.ChatCollection;
        const Contact = window.require("WAWebContactCollection")?.ContactCollection;
        if (Chat && Contact) return { Chat, Contact };
      }
    } catch (e) {}

    if (window.webpackChunkwhatsapp_web_client) {
      let foundModules = {};
      window.webpackChunkwhatsapp_web_client.push([
        [Math.random()],
        {},
        (req) => {
          for (const key of Object.keys(req.m)) {
            try {
              const mod = req(key);
              if (!mod) continue;
              if (mod.ChatCollection || (mod.default && mod.default.ChatCollection)) {
                foundModules.Chat = mod.ChatCollection || mod.default.ChatCollection;
              }
              if (mod.ContactCollection || (mod.default && mod.default.ContactCollection)) {
                foundModules.Contact = mod.ContactCollection || mod.default.ContactCollection;
              }
            } catch (err) {}
          }
        }
      ]);
      if (foundModules.Chat && foundModules.Contact) return foundModules;
    }

    return null;
  }

  // --- 2. IndexedDB Yedek Okuyucu ---
  async function readAllFromIndexedDB() {
    const raw = { chats: [], contacts: [] };
    const dbs = await indexedDB.databases();
    const targetDBs = dbs.filter(d => d.name === "model-storage" || d.name === "wawc");

    for (const dbInfo of targetDBs) {
      await new Promise((resolve) => {
        const req = indexedDB.open(dbInfo.name);
        req.onsuccess = (e) => {
          const db = e.target.result;
          const stores = Array.from(db.objectStoreNames);

          const readStore = (sName) => {
            return new Promise((res) => {
              if (!stores.includes(sName)) return res([]);
              try {
                const tx = db.transaction(sName, "readonly");
                const store = tx.objectStore(sName);
                const getReq = store.getAll();
                getReq.onsuccess = () => res(getReq.result || []);
                getReq.onerror = () => res([]);
              } catch {
                res([]);
              }
            });
          };

          Promise.all([readStore("chat"), readStore("contact")]).then(([cChats, cContacts]) => {
            raw.chats.push(...cChats);
            raw.contacts.push(...cContacts);
            db.close();
            resolve();
          });
        };
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    }
    return raw;
  }

  try {
    const directChatsMap = new Map();
    const savedContactsMap = new Map();
    const allDiscoveredMap = new Map();
    const groupsMap = new Map();

    const store = getWhatsAppInternalStore();

    if (store && store.Chat && store.Contact) {
      // Modelleri güvenli diziye çevir (models veya _models)
      const rawChats = store.Chat.models || store.Chat._models || (store.Chat.getModelsArray ? store.Chat.getModelsArray() : []);
      const rawContacts = store.Contact.models || store.Contact._models || (store.Contact.getModelsArray ? store.Contact.getModelsArray() : []);

      // 1. Rehber ve Tüm Havuz
      rawContacts.forEach(c => {
        const phone = formatPhone(c.id);
        if (!phone) return;

        const isSaved = Boolean(c.name);
        const name = getCleanName(c, phone);

        if (isSaved) {
          savedContactsMap.set(phone, { name: c.name.trim(), phone, isSaved: true });
        }
        allDiscoveredMap.set(phone, { name: name.trim(), phone, isSaved });
      });

      // 2. Sohbetler (Hata veren kısım düzeltildi)
      rawChats.forEach(chat => {
        const isGroup = chat.isGroup || (chat.id && String(chat.id._serialized || chat.id).includes("@g.us"));

        // GRUP SOHBETLERİ
        if (isGroup) {
          const rawId = chat.id?._serialized || String(chat.id || "");
          const groupTitle = chat.name || chat.formattedTitle || "İsimsiz Grup";
          const participants = [];

          const rawParts = chat.groupMetadata?.participants?.models ||
                           chat.groupMetadata?.participants?._models ||
                           chat.groupMetadata?.participants || [];

          rawParts.forEach(p => {
            const pPhone = formatPhone(p.id);
            if (pPhone) {
              const pContact = store.Contact.get ? store.Contact.get(p.id) : null;
              participants.push({
                phone: pPhone,
                name: getCleanName(pContact, p.name || pPhone)
              });
            }
          });

          groupsMap.set(rawId, {
            groupId: rawId,
            groupName: groupTitle,
            participants
          });
        }
        // BİREYSEL SOHBETLER (Grup, kanal veya duyuru değilse)
        else {
          const phone = formatPhone(chat.id);
          if (phone) {
            const contactObj = store.Contact.get ? store.Contact.get(chat.id) : null;
            const name = getCleanName(contactObj, chat.name || chat.formattedTitle || phone);

            directChatsMap.set(phone, {
              name: name.trim(),
              phone: phone,
              isSaved: Boolean(contactObj?.name)
            });
          }
        }
      });

    } else {
      // --- INDEXEDDB YEDEK MODU ---
      const dbData = await readAllFromIndexedDB();

      dbData.contacts.forEach(c => {
        const phone = formatPhone(c.id);
        if (!phone) return;

        const isSaved = Boolean(c.name);
        const name = (c.name || c.pushname || phone).trim();

        if (isSaved) {
          savedContactsMap.set(phone, { name: c.name.trim(), phone, isSaved: true });
        }
        allDiscoveredMap.set(phone, { name, phone, isSaved });
      });

      dbData.chats.forEach(chat => {
        const rawId = typeof chat.id === "string" ? chat.id : (chat.id?._serialized || "");
        if (!rawId) return;

        if (rawId.includes("@g.us")) {
          groupsMap.set(rawId, {
            groupId: rawId,
            groupName: chat.name || chat.formattedTitle || "İsimsiz Grup",
            participants: (chat.participants || []).map(p => {
              const pPhone = formatPhone(p.id || p);
              return { phone: pPhone, name: p.name || pPhone };
            }).filter(p => Boolean(p.phone))
          });
        } else {
          const phone = formatPhone(rawId);
          if (phone) {
            const saved = savedContactsMap.get(phone);
            const name = saved ? saved.name : (chat.name || chat.formattedTitle || phone).trim();

            directChatsMap.set(phone, {
              name,
              phone,
              isSaved: Boolean(saved)
            });
          }
        }
      });
    }

    const payload = {
      directChats: Array.from(directChatsMap.values()),
      savedContacts: Array.from(savedContactsMap.values()),
      allDiscovered: Array.from(allDiscoveredMap.values()),
      groups: Array.from(groupsMap.values())
    };

    window.postMessage({ type: "WA_EXTRACT_RESULT", data: payload }, "*");
  } catch (err) {
    window.postMessage({ type: "WA_EXTRACT_RESULT", error: err.message }, "*");
  }
})();

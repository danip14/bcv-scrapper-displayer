/**
 * ============================================================
 *  Tasa BCV - Visualizador en Tiempo Real
 *  app.js — Lógica del cliente (navegador)
 * ============================================================
 *  Autor:   Daniel Prieto
 *  Email:   dprietoalejandro@gmail.com
 *  GitHub:  https://github.com/danip14
 *  Licencia: MIT
 * ============================================================
 *
 *  CONFIGURACIÓN REQUERIDA:
 *  Antes de usar, reemplaza el placeholder de la IP:
 *
 *    SERVER_IP  →  IP de la PC donde corre servidor.js
 *                  Ejemplo: "192.168.1.100"
 *
 *  También puedes cambiar el puerto si lo modificaste en servidor.js:
 *    SERVER_PORT → Puerto del servidor (por defecto 3000)
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", function () {

  // ============================================================
  //  CONFIGURACIÓN — Reemplaza los placeholders antes de usar
  // ============================================================
  const SERVER_IP   = "TU_IP_AQUI";   // Ejemplo: "192.168.1.100"
  const SERVER_PORT = 3000;            // Puerto del servidor local
  const LOCAL_SERVER = `http://${SERVER_IP}:${SERVER_PORT}/tasa`;
  // ============================================================

  // Elementos del DOM
  const usdAmount         = document.getElementById("usd-amount");
  const lastUpdate        = document.getElementById("last-update");
  const lastCheck         = document.getElementById("last-check");
  const refreshBtn        = document.getElementById("refresh-btn");
  const autoRefreshToggle = document.getElementById("auto-refresh-toggle");
  const notificationToggle= document.getElementById("notification-toggle");
  const notificationStatus= document.getElementById("notification-status");
  const configModal       = document.getElementById("config-modal");
  const closeModal        = document.querySelector(".close-modal");
  const saveSettingsBtn   = document.getElementById("save-settings");
  const notification      = document.getElementById("notification");
  const notificationText  = document.getElementById("notification-text");

  // Variables de estado
  let autoRefreshInterval;
  let autoRefreshEnabled    = false;
  let autoRefreshTime       = 30000;
  let notificationsEnabled  = false;
  let soundEnabled          = true;
  let theme                 = "light";
  let lastUsdRate           = null;
  let notificationPermission= "default";

  // ================================
  // FUNCIÓN: fetchWithTimeout
  // ================================
  async function fetchWithTimeout(url, options = {}, timeout = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  // ================================
  // FUNCIÓN: Consultar tasa al servidor local
  // ================================
  async function fetchWithFallback() {
    console.log("🔍 Consultando servidor local BCV...");
    try {
      const response = await fetchWithTimeout(LOCAL_SERVER, { method: "GET" }, 10000);

      if (!response.ok) {
        throw new Error(`Servidor local respondió con status ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Datos recibidos:", data);

      const usd = parseFloat(data?.rates?.usd);
      if (!isNaN(usd) && usd > 0) {
        console.log("✅ Tasa USD:", usd);
        return { usd, date: data.updatedAt, source: data.source };
      } else {
        throw new Error("Tasa USD inválida en respuesta del servidor");
      }
    } catch (error) {
      console.error("❌ Error al consultar servidor local:", error.message);
      console.error("👉 ¿Está corriendo INICIAR_SERVIDOR.bat? ¿Es correcta la IP en app.js?");
      return null;
    }
  }

  // ================================
  // FUNCIÓN: fetchExchangeRates
  // ================================
  function fetchExchangeRates() {
    const now = new Date();

    lastCheck.textContent = formatTime(now);
    lastUpdate.querySelector("span").textContent = "Consultando...";
    usdAmount.textContent = "...";
    usdAmount.classList.add("loading");

    console.log(`🔍 Consultando tasa a las ${formatDateTime(now)}`);

    fetchWithFallback()
      .then((data) => {
        usdAmount.classList.remove("loading");

        if (data && data.usd && data.usd > 0) {
          const formattedAmount = formatNumber(data.usd);
          const rateChanged = lastUsdRate !== null && lastUsdRate !== data.usd;
          lastUsdRate = data.usd;

          usdAmount.textContent = formattedAmount;
          animateValueChange(usdAmount);

          const cardElement = document.getElementById("usd-card");
          cardElement.style.boxShadow = `0 0 15px ${theme === "dark" ? "#ffcc0080" : "#ffcc00"}`;
          setTimeout(() => { cardElement.style.boxShadow = ""; }, 1000);

          const displayDate = getTodayMidnightDate();
          lastUpdate.querySelector("span").textContent = formatDateTime(displayDate);

          document.querySelector(".app-footer p:last-child").innerHTML =
            `Fuente: Banco Central de Venezuela | Actualizado: ${formatDateTime(displayDate)}`;

          showNotification(`Tasa BCV: Bs. ${formattedAmount}`, "success");

          if (rateChanged && notificationsEnabled) {
            showDesktopNotification({
              title: "Tasa BCV Actualizada",
              body: `Nuevo valor: Bs. ${formattedAmount} / USD`,
            });
          }

          console.log("✅ Tasa actualizada:", formattedAmount);
        } else {
          console.warn("❌ No hay datos disponibles");
          usdAmount.textContent = "No disponible";
          usdAmount.classList.add("error");
          lastUpdate.querySelector("span").textContent = "Sin datos";
          showNotification("No se pudo obtener la tasa. Verifica el servidor.", "error");

          document.querySelector(".app-footer p:last-child").innerHTML =
            `Fuente: Banco Central de Venezuela | Última verificación: ${formatTime(now)}`;
        }
      })
      .catch((error) => {
        console.error("❌ Error:", error);
        usdAmount.classList.remove("loading");
        usdAmount.classList.add("error");
        usdAmount.textContent = "No disponible";
        lastUpdate.querySelector("span").textContent = "Error de conexión";
        showNotification("Error de conexión. Verifica el servidor.", "error");

        document.querySelector(".app-footer p:last-child").innerHTML =
          `Fuente: Banco Central de Venezuela | Última verificación: ${formatTime(now)}`;
      });
  }

  // ================================
  // NOTIFICACIONES
  // ================================
  function checkNotificationPermission() {
    if (!("Notification" in window)) {
      notificationsEnabled = false;
      updateNotificationButton();
      return false;
    }
    notificationPermission = Notification.permission;
    notificationsEnabled = notificationPermission === "granted";
    updateNotificationButton();
    return notificationsEnabled;
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      showNotification("Tu navegador no soporta notificaciones");
      return false;
    }
    if (Notification.permission === "granted") {
      notificationsEnabled = true;
      updateNotificationButton();
      showNotification("Notificaciones ya están activadas", "success");
      return true;
    }
    if (Notification.permission === "denied") {
      showNotification("Permisos denegados. Habilítalos en la configuración del navegador.", "error");
      notificationsEnabled = false;
      updateNotificationButton();
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        notificationsEnabled = true;
        notificationPermission = "granted";
        updateNotificationButton();
        showDesktopNotification({
          title: "Notificaciones Activadas ✓",
          body: "Recibirás alertas sobre cambios en la tasa del dólar",
        });
        showNotification("Notificaciones activadas correctamente", "success");
        return true;
      } else {
        notificationsEnabled = false;
        notificationPermission = "denied";
        updateNotificationButton();
        showNotification("Permisos de notificación denegados", "error");
        return false;
      }
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      showNotification("Error al activar notificaciones", "error");
      return false;
    }
  }

  function showDesktopNotification(options) {
    if (!notificationsEnabled || Notification.permission !== "granted") return;
    const defaultOptions = { icon: "bcv-logo.png", tag: "bcv-tasa-notification", requireInteraction: false };
    const notifOptions = { ...defaultOptions, ...options };
    try {
      const notif = new Notification(notifOptions.title, notifOptions);
      notif.onclick = function () { window.focus(); this.close(); };
      setTimeout(() => notif.close(), 8000);
      return notif;
    } catch (error) {
      console.error("Error al mostrar notificación del sistema:", error);
    }
  }

  async function toggleNotifications() {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        notificationsEnabled = true;
        setTimeout(() => {
          showDesktopNotification({
            title: "Tasa BCV - Notificaciones",
            body: "Las notificaciones están ahora activas.",
          });
        }, 1000);
      }
    } else {
      notificationsEnabled = false;
      showNotification("Notificaciones desactivadas", "warning");
    }
    updateNotificationButton();
    saveSettings();
  }

  function updateNotificationButton() {
    const status = notificationsEnabled ? "ON" : "OFF";
    let iconClass = "fa-bell";
    let buttonClass = "btn-secondary";
    if (notificationsEnabled) {
      iconClass = "fa-bell";
      buttonClass = "btn-primary";
    } else if (typeof Notification !== "undefined" && Notification.permission === "denied") {
      iconClass = "fa-bell-slash";
      buttonClass = "btn-error";
    }
    notificationToggle.className = buttonClass;
    notificationToggle.innerHTML = `<i class="fas ${iconClass}"></i> Notificaciones: <span id="notification-status">${status}</span>`;
  }

  function showNotification(message, type = "info") {
    notificationText.textContent = message;
    notification.className = "notification";
    if (type === "success") notification.classList.add("success");
    else if (type === "error") notification.classList.add("error");
    else if (type === "warning") notification.classList.add("warning");
    notification.style.display = "block";
    const closeTime = type === "error" ? 5000 : 3000;
    setTimeout(() => { notification.style.display = "none"; }, closeTime);
  }

  // ================================
  // AUTO-REFRESH
  // ================================
  function toggleAutoRefresh() {
    if (autoRefreshEnabled) stopAutoRefresh();
    else startAutoRefresh();
    updateAutoRefreshButton();
  }

  function startAutoRefresh() {
    autoRefreshEnabled = true;
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(fetchExchangeRates, autoRefreshTime);
  }

  function stopAutoRefresh() {
    autoRefreshEnabled = false;
    if (autoRefreshInterval) { clearInterval(autoRefreshInterval); autoRefreshInterval = null; }
  }

  function updateAutoRefreshButton() {
    const text = autoRefreshEnabled ? "Auto-actualizar (ON)" : "Auto-actualizar (OFF)";
    autoRefreshToggle.innerHTML = `<i class="fas ${autoRefreshEnabled ? "fa-pause-circle" : "fa-play-circle"}"></i> ${text}`;
  }

  // ================================
  // SONIDO
  // ================================
  function playSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.warn("No se pudo reproducir sonido:", e);
    }
  }

  // ================================
  // CONFIGURACIÓN
  // ================================
  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem("bcvTasaSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        autoRefreshEnabled  = settings.autoRefreshEnabled || false;
        autoRefreshTime     = settings.autoRefreshTime || 30000;
        notificationsEnabled= settings.notificationsEnabled || false;
        soundEnabled        = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        theme               = settings.theme || "light";

        document.getElementById("refresh-interval").value = autoRefreshTime / 1000;
        document.getElementById("sound-toggle").checked   = soundEnabled;
        document.getElementById("start-minimized").checked= settings.startMinimized || false;
        document.getElementById("theme-select").value     = theme;

        checkNotificationPermission();
      }
    } catch (e) {
      console.warn("Error al cargar configuración:", e);
    }
  }

  function saveSettings() {
    try {
      const settings = {
        autoRefreshEnabled,
        autoRefreshTime    : parseInt(document.getElementById("refresh-interval").value) * 1000,
        notificationsEnabled,
        soundEnabled       : document.getElementById("sound-toggle").checked,
        startMinimized     : document.getElementById("start-minimized").checked,
        theme              : document.getElementById("theme-select").value,
      };
      localStorage.setItem("bcvTasaSettings", JSON.stringify(settings));

      autoRefreshTime = settings.autoRefreshTime;
      theme           = settings.theme;
      soundEnabled    = settings.soundEnabled;

      if (autoRefreshEnabled) { stopAutoRefresh(); startAutoRefresh(); }

      applyTheme();
      configModal.style.display = "none";
      showNotification("Configuración guardada", "success");
    } catch (e) {
      console.warn("Error al guardar configuración:", e);
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // ================================
  // UTILIDADES
  // ================================
  function getTodayMidnightDate() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  }

  function animateValueChange(element) {
    element.classList.remove("error");
    element.style.transform = "scale(1.2)";
    element.style.color = theme === "dark" ? "#ffcc00" : "#0056a6";
    setTimeout(() => {
      element.style.transform = "scale(1)";
      setTimeout(() => { element.style.color = ""; }, 300);
    }, 300);
  }

  function formatNumber(num) {
    if (!num) return "0";
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("es-VE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
  }

  function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
  }

  // ================================
  // EVENTOS Y ARRANQUE
  // ================================
  function setupEventListeners() {
    refreshBtn.addEventListener("click", function () {
      fetchExchangeRates();
      if (soundEnabled) playSound();
    });

    autoRefreshToggle.addEventListener("click", toggleAutoRefresh);
    notificationToggle.addEventListener("click", toggleNotifications);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") configModal.style.display = "none";
    });

    closeModal.addEventListener("click", function () {
      configModal.style.display = "none";
    });

    saveSettingsBtn.addEventListener("click", saveSettings);

    // Doble clic en el header abre la configuración
    document.querySelector(".app-header").addEventListener("dblclick", function () {
      configModal.style.display = "flex";
    });

    window.addEventListener("focus", function () {
      checkNotificationPermission();
    });
  }

  function initApp() {
    loadSettings();
    applyTheme();
    setupEventListeners();
    checkNotificationPermission();
    fetchExchangeRates();

    if (autoRefreshEnabled) {
      startAutoRefresh();
      updateAutoRefreshButton();
    }

    updateNotificationButton();
  }

  window.addEventListener("online", fetchExchangeRates);
  window.addEventListener("offline", function () {
    showNotification("Sin conexión a Internet.", "warning");
  });

  // Timeout de seguridad: si tras 15s no llegó nada, mostrar error
  setTimeout(() => {
    if (usdAmount.textContent === "..." || usdAmount.textContent === "Cargando...") {
      usdAmount.textContent = "No disponible";
      usdAmount.classList.remove("loading");
      usdAmount.classList.add("error");
    }
  }, 15000);

  initApp();
});

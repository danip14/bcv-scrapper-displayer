/**
 * ============================================================
 *  Tasa BCV - Servidor Proxy Local
 *  servidor.js
 * ============================================================
 *  Autor:   Daniel Prieto
 *  Email:   dprietoalejandro@gmail.com
 *  GitHub:  https://github.com/danip14
 *  Licencia: MIT
 * ============================================================
 *
 *  Este servidor corre localmente en tu PC y actúa como
 *  puente entre el navegador y el sitio del BCV, resolviendo
 *  las restricciones CORS al abrir el HTML como archivo local.
 *
 *  CONFIGURACIÓN:
 *  No se requiere configuración adicional en este archivo.
 *  Solo asegúrate de que el puerto no esté en uso.
 *
 *  Si necesitas cambiar el puerto (por defecto 3000):
 *    PORT  →  número de puerto disponible en tu PC
 *             Recuerda actualizar SERVER_PORT en app.js también.
 *
 *  USO:
 *    node servidor.js
 *
 *  ENDPOINT DISPONIBLE:
 *    GET http://localhost:PORT/tasa
 *    Devuelve: { rates: { usd: NUMBER }, updatedAt: STRING, source: STRING }
 * ============================================================
 */

const http = require("http");

// El certificado SSL del BCV no es reconocido por Node.js por defecto.
// Esta línea deshabilita la verificación solo para este proceso.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const https = require("https");

// ============================================================
//  CONFIGURACIÓN — Modifica aquí si es necesario
// ============================================================
const PORT    = 3000;                                                              // Puerto del servidor
const BCV_URL = "https://www.bcv.org.ve/tasas-informativas-sistema-bancario";     // URL fuente de datos
// ============================================================

/**
 * Descarga el HTML de la página del BCV.
 * Maneja redirecciones automáticamente.
 */
function fetchBcvPage() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent"     : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept"         : "text/html,application/xhtml+xml",
        "Accept-Language": "es-VE,es;q=0.9",
      },
    };

    https.get(BCV_URL, options, (res) => {
      // Manejar redirecciones HTTP 3xx
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, options, (res2) => {
          let data = "";
          res2.on("data", (chunk) => (data += chunk));
          res2.on("end", () => resolve(data));
        }).on("error", reject);
        return;
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

/**
 * Extrae la tasa USD del HTML del BCV.
 * Busca el elemento con id="dolar" y lee el <strong> con el valor.
 * El valor viene en formato venezolano: "448,36860000"
 */
function extractUsdRate(html) {
  const match = html.match(/id=["']dolar["'][^]*?<strong>\s*([\d,\.]+)\s*<\/strong>/);
  if (match) {
    const rate = parseFloat(match[1].trim().replace(",", "."));
    if (!isNaN(rate) && rate > 0) return rate;
  }
  return null;
}

/**
 * Servidor HTTP local.
 * Escucha en 0.0.0.0 para aceptar conexiones de toda la red local,
 * no solo de localhost.
 */
const server = http.createServer(async (req, res) => {
  // Cabeceras CORS — permiten que el HTML (file://) llame a este servidor
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // Responder preflight CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/tasa") {
    try {
      console.log("[BCV] Consultando página del BCV...");
      const html = await fetchBcvPage();
      const usd  = extractUsdRate(html);

      if (usd) {
        console.log("[BCV] Tasa USD obtenida:", usd);
        res.writeHead(200);
        res.end(JSON.stringify({
          rates     : { usd },
          updatedAt : new Date().toISOString(),
          source    : "Banco Central de Venezuela",
        }));
      } else {
        console.warn("[BCV] No se encontró la tasa en el HTML");
        res.writeHead(503);
        res.end(JSON.stringify({ error: "No se pudo extraer la tasa del HTML del BCV" }));
      }
    } catch (err) {
      console.error("[BCV] Error:", err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Ruta no encontrada. Usa GET /tasa" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("===========================================");
  console.log(`  Tasa BCV — Servidor proxy local`);
  console.log(`  Autor: Daniel Prieto (github.com/danip14)`);
  console.log(`  Puerto: ${PORT}`);
  console.log(`  Endpoint: http://localhost:${PORT}/tasa`);
  console.log("  Deja esta ventana abierta mientras usas la app.");
  console.log("===========================================");
});

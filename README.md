# 💵 Tasa BCV — Visualizador en Tiempo Real

Herramienta de escritorio que muestra la tasa oficial del dólar publicada por el **Banco Central de Venezuela (BCV)**, consultando directamente el sitio oficial `bcv.org.ve`. Diseñada para funcionar en red local empresarial, permitiendo que múltiples computadoras vean la tasa desde un único servidor.

---

## ✨ Características

- Consulta la tasa oficial del BCV en tiempo real
- Funciona en red local: una PC sirve los datos a toda la red
- Auto-actualización configurable (10s, 30s, 1min, 5min)
- Tres temas de color: Claro, Oscuro y Azul
- Notificaciones de escritorio al cambiar la tasa
- Arranque automático al encender Windows
- Sin dependencias externas en producción (solo Node.js)

---

## 📁 Estructura del proyecto

```
tasa-bcv/
├── index.html                        # Interfaz visual
├── styles.css                        # Estilos y temas
├── app.js                            # Lógica del cliente (navegador)
├── servidor.js                       # Servidor proxy Node.js
├── iniciar_bcv.vbs                   # Arranque silencioso del servidor
├── INICIAR_SERVIDOR.bat              # Inicia el servidor manualmente
├── INSTALAR_INICIO_AUTOMATICO.bat    # Instala el arranque automático
├── DESINSTALAR_INICIO_AUTOMATICO.bat # Elimina el arranque automático
├── bcv-logo.png                      # Logo del BCV
├── bcv-logo.ico                      # Ícono del BCV
├── LICENSE                           # Licencia MIT
└── README.md                         # Este archivo
```

---

## ⚙️ Requisitos

- **Node.js** v14 o superior — [Descargar aquí](https://nodejs.org/)
- Windows 7 / 10 / 11
- Conexión a internet en la PC servidor
- No se requieren paquetes npm adicionales

---

## 🚀 Instalación y configuración

### Paso 1 — Clonar o descargar el repositorio

```bash
git clone https://github.com/danip14/bcv-scrapper-displayer.git
```

O descarga el ZIP desde GitHub y extrae los archivos en una carpeta de tu PC.

### Paso 2 — Configurar la IP del servidor en `app.js`

Abre `app.js` y reemplaza el placeholder con la IP de la PC donde correrá el servidor:

```javascript
// ANTES
const SERVER_IP = "TU_IP_AQUI";

// DESPUÉS (usa la IP real de tu PC)
const SERVER_IP = "192.168.1.100";
```

Para conocer tu IP abre el **Símbolo del sistema** (cmd) y escribe:
```
ipconfig
```
Busca la línea **Dirección IPv4**.

### Paso 3 — Configurar la ruta en `iniciar_bcv.vbs`

Abre `iniciar_bcv.vbs` con el Bloc de notas y reemplaza el placeholder:

```vbs
' ANTES
shell.Run "cmd /k node ""RUTA_SERVIDOR""", 1, False

' DESPUÉS (usa la ruta completa a servidor.js en tu PC)
shell.Run "cmd /k node ""C:\MiProyecto\tasa-bcv\servidor.js""", 1, False
```

### Paso 4 — Instalar el inicio automático

Haz doble clic en `INSTALAR_INICIO_AUTOMATICO.bat`.

Esto copia el `.vbs` a la carpeta de Inicio de Windows y arranca el servidor por primera vez.

### Paso 5 — Verificar

Abre en el navegador:
```
http://TU_IP:3000/tasa
```
Debes ver un JSON como este:
```json
{
  "rates": { "usd": 448.36 },
  "updatedAt": "2026-03-17T13:35:30.970Z",
  "source": "Banco Central de Venezuela"
}
```

### Paso 6 — Abrir la app

Abre `index.html` desde cualquier PC de la red. La tasa se mostrará automáticamente.

---

## 🌐 Cómo funciona la arquitectura

```
index.html  (cualquier PC de la red)
     │
     │  GET http://IP_SERVIDOR:3000/tasa
     ▼
servidor.js  (corre en la PC servidor)
     │
     │  scraping directo a bcv.org.ve
     ▼
Banco Central de Venezuela  (fuente oficial)
```

El servidor Node.js resuelve el problema de CORS: los navegadores no permiten que un archivo HTML local haga peticiones directas a sitios externos, pero Node.js sí puede hacerlo sin restricciones.

---

## 🔧 Gestión del servicio

| Acción | Archivo |
|---|---|
| Iniciar el servidor manualmente | `INICIAR_SERVIDOR.bat` |
| Instalar arranque automático con Windows | `INSTALAR_INICIO_AUTOMATICO.bat` |
| Desinstalar arranque automático | `DESINSTALAR_INICIO_AUTOMATICO.bat` |

> **Nota:** Si ves el error `EADDRINUSE: address already in use :::3000`, significa que el servidor ya está corriendo. No es un error — simplemente ya funciona.

---

## 🎨 Temas disponibles

Accede a la configuración haciendo **doble clic en el encabezado** de la app.

| Tema | Descripción |
|---|---|
| Claro | Blanco con azul BCV (por defecto) |
| Oscuro | Fondo oscuro para ambientes con poca luz |
| Azul | Tonos azules suaves |

---

## 🛠️ Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| Muestra "No disponible" | Servidor no está corriendo | Ejecutar `INICIAR_SERVIDOR.bat` |
| `ERR_CONNECTION_REFUSED` | Servidor apagado | Ejecutar `INICIAR_SERVIDOR.bat` |
| `EADDRINUSE` en el cmd | El servidor ya estaba corriendo | Ignorar, la app funciona igual |
| Otras PCs no cargan la tasa | Firewall bloqueando puerto 3000 | Permitir Node.js en el Firewall de Windows |
| `unable to verify the first certificate` | Certificado SSL del BCV no reconocido | Ya está resuelto en `servidor.js` con `NODE_TLS_REJECT_UNAUTHORIZED` |
| La tasa no cambia por días | El BCV solo publica en días hábiles | Es normal |

---

## 📊 Fuente de datos

Los datos se obtienen mediante scraping del sitio oficial del BCV:

**https://www.bcv.org.ve/tasas-informativas-sistema-bancario**

El BCV publica la tasa una vez al día en días hábiles. Esta herramienta no modifica ni interpreta los datos, los presenta tal como los publica el BCV.

---

## 📄 Licencia

MIT © 2026 [Daniel Prieto](https://github.com/danip14)

Libre uso, modificación y distribución. Se requiere mantener el aviso de copyright.

---

## 👤 Autor

**Daniel Prieto**
- GitHub: [@danip14](https://github.com/danip14)
- Email: dprietoalejandro@gmail.com

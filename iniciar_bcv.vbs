' ============================================================
'  Tasa BCV - Iniciador del servidor en segundo plano
'  iniciar_bcv.vbs
' ============================================================
'  Autor:   Daniel Prieto
'  GitHub:  https://github.com/danip14
' ============================================================
'
'  CONFIGURACIÓN REQUERIDA:
'  Reemplaza el placeholder con la ruta completa a servidor.js
'
'    RUTA_SERVIDOR  →  ruta completa a servidor.js
'                      Ejemplo: C:\MiProyecto\servidor.js
'                      Ejemplo: Z:\BCV\servidor.js
'
'  Este archivo se copia a la carpeta de Inicio de Windows
'  para que el servidor arranque automáticamente al iniciar sesión.
' ============================================================

Dim shell
Set shell = CreateObject("WScript.Shell")

' *** Reemplaza RUTA_SERVIDOR con la ruta completa a tu servidor.js ***
shell.Run "cmd /k node ""RUTA_SERVIDOR""", 1, False

Set shell = Nothing

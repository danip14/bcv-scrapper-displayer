@echo off
:: ============================================================
::  Tasa BCV - Instalar inicio automático al encender Windows
::  INSTALAR_INICIO_AUTOMATICO.bat
:: ============================================================
::  Autor:   Daniel Prieto
::  GitHub:  https://github.com/danip14
:: ============================================================
::
::  ANTES DE EJECUTAR:
::  1. Edita el archivo iniciar_bcv.vbs y reemplaza RUTA_SERVIDOR
::     con la ruta completa a servidor.js en tu PC.
::     Ejemplo: Z:\BCV\servidor.js
::
::  2. Ejecuta este .bat con doble clic (no requiere administrador).
::
::  Esto copia iniciar_bcv.vbs a la carpeta de Inicio de Windows,
::  haciendo que el servidor arranque automáticamente al iniciar sesión.
:: ============================================================

echo Instalando inicio automatico del servidor BCV...
echo.

set "ORIGEN=%~dp0iniciar_bcv.vbs"
set "DESTINO=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\iniciar_bcv.vbs"

if not exist "%ORIGEN%" (
    echo ERROR: No se encontro el archivo iniciar_bcv.vbs
    echo Asegurate de que este en la misma carpeta que este .bat
    pause
    exit /b
)

copy /y "%ORIGEN%" "%DESTINO%"

if %errorLevel% equ 0 (
    echo =============================================
    echo  Instalacion exitosa.
    echo  El servidor BCV arrancara automaticamente
    echo  cada vez que inicies sesion en Windows.
    echo.
    echo  Archivo instalado en:
    echo  %DESTINO%
    echo =============================================
    echo.
    echo Iniciando el servidor ahora mismo...
    start "" wscript.exe "%ORIGEN%"
    echo Listo.
) else (
    echo ERROR: No se pudo copiar el archivo.
)

pause

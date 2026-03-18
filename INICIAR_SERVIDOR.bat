@echo off
:: ============================================================
::  Tasa BCV - Iniciar servidor manualmente
::  INICIAR_SERVIDOR.bat
:: ============================================================
::  Autor:   Daniel Prieto
::  GitHub:  https://github.com/danip14
:: ============================================================
::
::  Ejecuta este archivo para iniciar el servidor manualmente.
::  Deja la ventana abierta mientras usas la app.
::
::  Si instalaste el inicio automático con
::  INSTALAR_INICIO_AUTOMATICO.bat, no necesitas este archivo
::  en el día a día — el servidor arranca solo al iniciar Windows.
:: ============================================================

echo Iniciando servidor proxy BCV...
echo Deja esta ventana abierta mientras usas la app.
echo.

:: El %~dp0 toma automáticamente la carpeta donde está este .bat
:: No necesitas cambiar nada aquí si servidor.js está en la misma carpeta
node "%~dp0servidor.js"
pause

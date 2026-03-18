@echo off
:: ============================================================
::  Tasa BCV - Desinstalar inicio automático
::  DESINSTALAR_INICIO_AUTOMATICO.bat
:: ============================================================
::  Autor:   Daniel Prieto
::  GitHub:  https://github.com/danip14
:: ============================================================
::
::  Elimina el inicio automático instalado previamente.
::  El servidor que esté corriendo en este momento NO se detiene.
::  Para detenerlo, cierra la ventana cmd del servidor manualmente.
:: ============================================================

echo Desinstalando inicio automatico del servidor BCV...
echo.

set "DESTINO=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\iniciar_bcv.vbs"

if not exist "%DESTINO%" (
    echo El inicio automatico no estaba instalado.
) else (
    del /f "%DESTINO%"
    if %errorLevel% equ 0 (
        echo =============================================
        echo  Desinstalacion exitosa.
        echo  El servidor BCV ya NO arrancara
        echo  automaticamente al iniciar Windows.
        echo =============================================
    ) else (
        echo ERROR: No se pudo eliminar el archivo.
    )
)

echo.
echo Nota: El servidor que esta corriendo ahora mismo
echo no se detendra. Para detenerlo cierra la ventana
echo cmd donde aparece el servidor BCV.
echo.
pause

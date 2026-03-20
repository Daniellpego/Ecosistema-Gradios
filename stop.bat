@echo off
echo Parando GRADIOS JARVIS...
taskkill /FI "WINDOWTITLE eq JARVIS API*" /F 2>nul
taskkill /FI "WINDOWTITLE eq GRADIOS UI*" /F 2>nul
echo Servicos parados.
pause

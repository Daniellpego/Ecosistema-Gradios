@echo off
echo ========================================
echo   GRADIOS AIOX — Iniciando tudo...
echo ========================================
echo.

echo [1/5] Subindo Docker (N8N + Evolution + Redis + Postgres)...
cd /d E:\gradios
docker-compose -f docker-compose.aiox.yml up -d
timeout /t 5 /nobreak > nul

echo [2/5] Iniciando backend JARVIS (porta 8001)...
cd /d E:\gradios\gradios-jarvis
start "JARVIS API" cmd /k "call venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak > nul

echo [3/5] Iniciando frontend GRADIOS UI (porta 3010)...
cd /d E:\gradios\apps\gradios-ui
start "GRADIOS UI" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo [4/5] Iniciando AIOX Scheduler (crons autonomos)...
cd /d E:\gradios
start "AIOX Scheduler" /min cmd /c "cd /d E:\gradios\gradios-jarvis && call venv\Scripts\activate && cd /d E:\gradios && python -m aiox.scheduler"
timeout /t 2 /nobreak > nul

echo [5/5] Verificando saude...
curl -s http://localhost:8001/health 2>nul
echo.
curl -s http://localhost:8080 2>nul
echo.

echo.
echo ========================================
echo   GRADIOS AIOX rodando:
echo   API JARVIS:    http://localhost:8001
echo   UI:            http://localhost:3010
echo   N8N:           http://localhost:5678
echo   Evolution API: http://localhost:8080
echo   Redis:         localhost:6379
echo   Scheduler:     background (logs: aiox/logs/)
echo ========================================
pause

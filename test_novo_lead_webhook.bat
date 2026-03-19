@echo off
chcp 65001 >nul
echo.
echo ========================================================
echo   TESTE: Simulando novo lead do quiz
echo   Endpoint: POST /jarvis/crm/novo-lead
echo ========================================================
echo.
echo Enviando lead simulado...
echo.
curl -s --max-time 120 -X POST http://localhost:8001/jarvis/crm/novo-lead ^
  -H "Content-Type: application/json" ^
  -d "{\"lead\": {\"nome\": \"Carlos Silva\", \"empresa\": \"TechFlow Solucoes\", \"email\": \"carlos@techflow.com.br\", \"whatsapp\": \"(43) 99999-1234\", \"score\": 78, \"tier\": \"A\", \"cargo\": \"Socio/Fundador\", \"tamanho\": \"11 a 50\", \"setor\": \"SaaS/Tecnologia\", \"gargalos\": [\"Financeiro — fechamentos manuais\", \"Comercial — CRM desatualizado\"], \"urgencia\": \"Proximos 30 dias\", \"prioridade\": \"Integrar sistemas\", \"created_at\": \"2026-03-19T14:30:00Z\"}}" | python -m json.tool 2>nul || echo [Resposta recebida - Ollama pode estar processando]
echo.
echo ========================================================
echo   Teste concluido.
echo ========================================================
pause

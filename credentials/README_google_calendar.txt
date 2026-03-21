=============================================
GRADIOS — Configuracao Google Calendar API
=============================================

Passo a passo para conectar o JARVIS ao Google Calendar.

---------------------------------------------
1. CRIAR PROJETO NO GOOGLE CLOUD CONSOLE
---------------------------------------------
- Acesse: https://console.cloud.google.com/
- Clique em "Selecionar projeto" > "Novo projeto"
- Nome: "GRADIOS JARVIS"
- Clique "Criar"
- Aguarde a criacao e selecione o projeto

---------------------------------------------
2. ATIVAR GOOGLE CALENDAR API
---------------------------------------------
- No menu lateral: APIs e servicos > Biblioteca
- Pesquise "Google Calendar API"
- Clique no resultado e depois em "Ativar"
- Aguarde a ativacao (poucos segundos)

---------------------------------------------
3. CRIAR SERVICE ACCOUNT
---------------------------------------------
- No menu lateral: APIs e servicos > Credenciais
- Clique "+ Criar credenciais" > "Conta de servico"
- Nome: "jarvis-calendar"
- ID: sera gerado automaticamente (ex: jarvis-calendar@gradios-jarvis.iam.gserviceaccount.com)
- Clique "Criar e continuar"
- Papel: pode pular (clique "Continuar")
- Clique "Concluir"

---------------------------------------------
4. BAIXAR JSON DE CREDENCIAIS
---------------------------------------------
- Na lista de contas de servico, clique na que voce criou
- Aba "Chaves" > "Adicionar chave" > "Criar nova chave"
- Tipo: JSON
- Clique "Criar"
- O arquivo .json sera baixado automaticamente
- MOVA o arquivo para: E:\gradios\credentials\google-service-account.json
- IMPORTANTE: nunca commite este arquivo no Git!

---------------------------------------------
5. COMPARTILHAR CALENDARIO COM A SERVICE ACCOUNT
---------------------------------------------
- Abra o Google Calendar no navegador: https://calendar.google.com/
- No menu lateral, clique nos 3 pontos ao lado do calendario desejado
- Clique "Configuracoes e compartilhamento"
- Secao "Compartilhar com pessoas especificas"
- Clique "Adicionar pessoas"
- Cole o email da service account (ex: jarvis-calendar@gradios-jarvis.iam.gserviceaccount.com)
- Permissao: "Fazer alteracoes nos eventos"
- Clique "Enviar"

---------------------------------------------
6. ADICIONAR VARIAVEIS NO .ENV
---------------------------------------------
Abra o arquivo E:\gradios\gradios-jarvis\.env e adicione:

GOOGLE_CALENDAR_ID=seu_email@gmail.com
GOOGLE_SERVICE_ACCOUNT_KEY=E:\gradios\credentials\google-service-account.json

Notas:
- GOOGLE_CALENDAR_ID e o email do calendario (geralmente seu Gmail)
  Para ver o ID exato: Configuracoes do calendario > "ID da agenda"
- GOOGLE_SERVICE_ACCOUNT_KEY e o caminho completo do JSON baixado

---------------------------------------------
7. INSTALAR DEPENDENCIA
---------------------------------------------
cd E:\gradios\gradios-jarvis
venv\Scripts\activate
pip install cryptography

(necessario para assinar JWT da Service Account)

---------------------------------------------
8. TESTAR
---------------------------------------------
Reinicie o backend:
  uvicorn app:app --host 0.0.0.0 --port 8001 --reload

Teste no terminal:
  curl -X POST http://localhost:8001/jarvis/agenda/criar-reuniao ^
    -H "Content-Type: application/json" ^
    -d "{\"lead_nome\": \"Teste\", \"empresa\": \"Teste SA\", \"data\": \"2026-03-25\", \"hora\": \"14:00\"}"

Se funcionar, o evento aparecera no Google Calendar.

---------------------------------------------
TROUBLESHOOTING
---------------------------------------------
- "Service account key nao encontrada"
  -> Verifique o caminho no .env

- "403 Forbidden" ou "The caller does not have permission"
  -> O calendario nao foi compartilhado com a service account
  -> Verifique se o email esta correto e com permissao de edicao

- "Google Calendar API has not been used in project"
  -> A API nao foi ativada no passo 2

- Sem erros mas evento nao aparece
  -> Verifique se o GOOGLE_CALENDAR_ID esta correto
  -> Pode ser "primary" ou o email exato do calendario

=============================================
Enquanto nao configurar, o JARVIS funciona em
modo fallback: salva reunioes no Supabase e
lista de la. Nenhuma funcionalidade e perdida.
=============================================

# HealthSys Distribuido

Front web em React + TypeScript + Tailwind CSS, empacotado com Vite.

## O que esta nesta base

- login
- dashboard shell
- cadastro e listagem de usuarios
- cadastro, listagem, detalhe e atualizacao de pacientes
- consulta de triagens vinculadas ao paciente
- triagem clinica com criacao, listagem, detalhe e atualizacao de status
- notificacoes assincronas com listagem, detalhe e marcacao como lida
- cliente de API apontando para o backend real por padrao

## Integracao com Backend

O frontend consome o API Gateway do backend. Endpoints integrados no client e utilizados pelos fluxos da interface:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users`
- `POST /api/users`
- `GET /api/patients`
- `GET /api/patients/{id}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `GET /api/triages`
- `GET /api/triages/{id}`
- `GET /api/triages/patient/{patientId}`
- `POST /api/triages`
- `PUT /api/triages/{id}/status`
- `GET /api/notifications`
- `GET /api/notifications?unread=true`
- `GET /api/notifications/{id}`
- `PUT /api/notifications/{id}/read`

## Estrutura

- `src/components/`
- `src/contexts/`
- `src/routes/`
- `src/screens/`
- `src/services/api/`
- `src/theme/`

## Acesso inicial

- `admin@healthsys.local` / `Admin@123`

## Configuracao da API

Por padrao o front consome o backend real em `http://localhost:8080`.

Para apontar para outra URL:

- defina `VITE_API_BASE_URL=http://host-do-gateway:8080`

O modo local em memoria/localStorage existe apenas para desenvolvimento isolado e so e ativado explicitamente:

- defina `VITE_USE_MOCK_API=true`

## Comandos

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`

## Docker

O `Dockerfile` aceita estes argumentos de build:

- `VITE_API_BASE_URL`
- `VITE_USE_MOCK_API`

No fluxo principal, use o Docker Compose do backend:

```powershell
Set-Location C:\Users\felip\OneDrive\Desktop\Comp-Dist-Backend
docker compose -f .\infra\docker-compose.yml up -d --build
```

Esse comando builda e sobe tambem o frontend em `http://localhost:4173`, apontando para o gateway em `http://localhost:8080`.

## Escopo nao incluido

Nao foram implementados os itens opcionais do documento base, como offline, analise de dados, QR Code, monitoramento hospitalar completo, educacao em saude, Terraform e ELK.

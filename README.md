# HealthSys Distribuido

Front web em React + TypeScript + Tailwind CSS, empacotado com Vite.

## O que esta nesta base

- login
- dashboard shell
- cadastro e listagem de usuarios
- cadastro, listagem e atualizacao de pacientes
- cliente de API configuravel com fallback local

## Estrutura

- `src/components/`
- `src/contexts/`
- `src/routes/`
- `src/screens/`
- `src/services/api/`
- `src/theme/`

## Credenciais demo

- `admin@healthsys.local` / `Admin@123`

## Configuracao da API

Por padrao o front usa o modo demo local. Para consumir o backend real:

- defina `VITE_API_BASE_URL`
- defina `VITE_USE_MOCK_API=false`

## Comandos

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`

## Docker

O `Dockerfile` aceita estes argumentos de build:

- `VITE_API_BASE_URL`
- `VITE_USE_MOCK_API`

## Escopo nao incluido

Nao foram implementados os itens opcionais do documento base, como offline, analise de dados, QR Code, monitoramento hospitalar completo, educacao em saude, Terraform e ELK.

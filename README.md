# HealthSys Distribuido

Front web em React + TypeScript + Tailwind CSS, empacotado com Vite.

## O que esta nesta base

- login
- dashboard shell
- cadastro e listagem de usuarios
- cadastro, listagem e atualizacao de pacientes
- triagem clinica com criacao, listagem e atualizacao de status
- notificacoes assincronas com listagem e marcacao como lida
- cliente de API apontando para o backend real por padrao

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

## Escopo nao incluido

Nao foram implementados os itens opcionais do documento base, como offline, analise de dados, QR Code, monitoramento hospitalar completo, educacao em saude, Terraform e ELK.

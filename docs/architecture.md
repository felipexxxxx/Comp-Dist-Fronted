# HealthSys Distribuido - Arquitetura do Front

## Estrutura

```
index.html
src/
  main.tsx
  App.tsx
  index.css
  contexts/
  components/
  routes/
  screens/
  services/api/
  theme/
```

## Responsabilidades

- `contexts/`: estado global de tema e autenticacao
- `components/`: blocos reutilizaveis de interface
- `routes/`: rotas protegidas e publicas com `react-router-dom`
- `screens/`: login, dashboard, usuarios e pacientes
- `services/api/`: contrato de API, mock local e cliente HTTP
- `theme/`: tokens visuais e modo claro/escuro

## Fluxo

1. `src/main.tsx` inicializa o React no `#root`.
2. `src/App.tsx` sobe `ThemeProvider`, `AuthProvider` e `BrowserRouter`.
3. `AppRoutes` decide entre login e area autenticada.
4. `AppShell` fornece navegacao lateral, cabecalho e contexto de ambiente.
5. As telas consomem `apiClient`, que pode usar mock local ou backend real.

## Variaveis de ambiente

- `VITE_API_BASE_URL`
- `VITE_USE_MOCK_API`

## Observacao

A camada HTTP esta pronta para os endpoints reais, mas o modo padrao permanece local para viabilizar a validacao imediata da entrega.

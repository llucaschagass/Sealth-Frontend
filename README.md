# Sealth: Frontend

Aplicação web do Sealth, construída com **Angular 22** (componentes standalone, signals e novo control flow).
Consome a API em [`../Sealth-Backend`](../Sealth-Backend).

## Funcionalidades

| Página                  | Rota                | Acesso  | O que faz                                                       |
| ----------------------- | ------------------- | ------- | --------------------------------------------------------------- |
| Landing                 | `/`                 | público | Apresentação, serviços, sobre e contato                         |
| Entrar / Criar conta    | `/login`, `/signup` | público | Autenticação com validação e erros por campo                    |
| Início                  | `/home`             | logado  | Atalhos para as seções                                          |
| Minhas consultas        | `/appointment`      | logado  | Criar, editar e cancelar consultas, com horário e lembrete      |
| Meus medicamentos       | `/medicines`        | logado  | Medicamentos em uso (dosagem e horários) e bulas em PDF         |
| Informações importantes | `/info`             | logado  | Artigos de saúde                                                |
| Minha saúde             | `/health`           | logado  | Calculadora (IMC, água, calorias, peso ideal) e histórico salvo |
| Configurações           | `/config`           | logado  | Alterar nome, e-mail e senha                                    |

## Como rodar

Pré-requisitos: Node 20+ e o backend no ar em `http://localhost:8080`
(`./mvnw spring-boot:run` em `Sealth-Backend/sealth-api`; ele já sobe com dados de demonstração).

```bash
npm ci
npm start          # http://localhost:4200
```

Usuário de demonstração (criado pelo seed do backend): `demo@sealth.com` / `123456`.

A URL da API fica em [`src/environments`](src/environments). Para outro ambiente, altere `apiUrl`
(o build de produção usa `environment.ts`; o `ng serve`, `environment.development.ts`).

## Scripts

| Comando                           | Para que serve                                                 |
| --------------------------------- | -------------------------------------------------------------- |
| `npm start`                       | Servidor de desenvolvimento                                    |
| `npm run build`                   | Build de produção (falha se estourar os orçamentos de tamanho) |
| `npm run lint`                    | ESLint, com regras de acessibilidade de template               |
| `npm run format` / `format:check` | Prettier                                                       |
| `npm test`                        | Testes em modo interativo (Chrome)                             |
| `npm run test:ci`                 | Testes uma vez, headless, **com cobertura** e limites mínimos  |
| `npm run verify`                  | Tudo acima em sequência: o que deve passar antes de um commit  |

## Arquitetura

```
src/
├── app/
│   ├── core/          # infraestrutura sem tela: sessão, interceptor HTTP, guard, erros, datas, validadores
│   ├── components/    # componentes compartilhados (AppShell, AuthLayout, TextField, Modal, Logo, Icon)
│   ├── pages/         # uma pasta por rota; lógica pura fica em arquivos .ts ao lado (ex.: health-calculator.ts)
│   └── services/      # um service por recurso da API
├── environments/
├── styles/            # tokens de design, base global, classes utilitárias (.btn, .card, .alert...)
└── types/             # tipos da API (Appointment, UserResponse, ApiError...)
```

Decisões que valem conhecer:

- **Sessão e erros ficam fora das telas.** `authInterceptor` anexa o token, converte qualquer erro HTTP em
  `ApiError` (`status`, `message`, `fieldErrors`) e encerra a sessão em 401. As páginas só tratam `ApiError`.
- **Erros do backend chegam ao campo certo.** `applyServerErrors` leva `fieldErrors` para os controles do formulário.
- **Rotas com lazy loading**, título por página e guard funcional (`authGuard`, que também checa a expiração do token).
- **Dados da API são tipados.** Não há `any` no código de aplicação.
- **Datas** chegam como `yyyy-MM-dd`; use `core/dates.ts`. `new Date("2026-12-01")` é lido como UTC e mostraria o dia
  anterior no Brasil.
- **Sem dados pessoais no `localStorage`.** O token e o nome ficam em `sessionStorage` e são apagados no logout.

## Design

Todo valor visual vem de tokens CSS em [`src/styles/_tokens.scss`](src/styles/_tokens.scss) (cores, espaçamento,
tipografia, raios, sombras). Os pares de cor texto/fundo foram escolhidos para contraste WCAG AA. Não escreva cores nem
tamanhos fixos nos componentes. Layouts são mobile-first, com breakpoints em `styles/_mixins.scss` (`@include up(md)`).

A fonte (Poppins, pesos 400 a 700) é auto-hospedada via `@fontsource`; imagens são WebP em `src/assets/images`
e ícones e marca são SVG.

## Qualidade

- **Testes:** Jasmine/Karma. Cobertura medida em cada `npm run test:ci`; abaixo de 90% das instruções/linhas,
  85% dos ramos ou 80% das funções, o comando falha (limites em `karma.conf.js`). Relatório em `coverage/sealth/index.html`.
- **Acessibilidade:** além do lint de template, as páginas foram verificadas com axe-core (WCAG 2.0/2.1 A e AA)
  em desktop, celular e com diálogos abertos, sem violações.
- **Padrão de teste:** services usam `HttpTestingController`; páginas isolam o service com spies e verificam o que o
  usuário vê (texto, links, estados de carregando/erro/vazio).

## Pendências conhecidas

- `npm audit` não aponta vulnerabilidades nas dependências de produção; os avisos restantes são de ferramentas de
  desenvolvimento (build/teste) e não vão para o bundle.
- Todos os componentes usam `OnPush` (padrão do Angular 22). A exceção é o `TextFieldComponent`, que lê o estado do
  `NgControl` (não reativo) e por isso usa `Eager`.
- Recuperação de senha ainda não existe (depende de endpoint no backend).

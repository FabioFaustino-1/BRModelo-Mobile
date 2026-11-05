# BRMM — BRModelo Mobile

> Aplicativo móvel para modelagem relacional de banco de dados diretamente no smartphone ou tablet, inspirado na proposta do BRModelo.

---

## 1. Descrição do Projeto
O **BRMM (BRModelo Mobile)** é uma solução mobile desenvolvida para proporcionar a estudantes, professores e entusiastas de bancos de dados a capacidade de criar, organizar e consultar modelos relacionais de forma prática e acessível em dispositivos móveis.

Este projeto também tem como objetivo atuar como um projeto de portfólio de engenharia de software, evidenciando boas práticas de arquitetura em camadas, versionamento com Git, documentação formal de requisitos, testes automatizados e princípios de DevSecOps.

---

## 2. Problema que o Projeto Pretende Resolver
Tradicionalmente, o aprendizado e a elaboração de esquemas conceituais e lógicos de bancos de dados dependem de softwares desktop (como o BRModelo tradicional em Java, MySQL Workbench ou ferramentas similares). 

Isso gera barreiras para estudantes em deslocamento, salas de aula sem acesso imediato a computadores ou pessoas que precisam rascunhar rapidamente uma modelagem. Ferramentas genéricas de desenho em celulares não possuem validação semântica de banco de dados (chaves primárias, tipos de dados e cardinalidades). O BRMM soluciona essa lacuna ao entregar um ambiente dedicado de modelagem relacional na palma da mão.

---

## 3. Objetivo do MVP
O MVP (Produto Mínimo Viável) disponibiliza uma experiência mobile enxuta, confiável e **100% offline**, permitindo:
- **Gestão de Projetos:** Criar, listar, renomear e excluir projetos com confirmação explícita.
- **Editor Visual Canvas 2D:** Acessar projetos em um **Editor Visual Canvas 2D** onde o usuário pode criar, posicionar e conectar visualmente entidades em uma área de trabalho interativa com arrastar-e-soltar, zoom/pan e visualização de relacionamentos por linhas.
- **Gestão de Entidades:** Criar, listar, renomear e excluir entidades (com deleção em cascata).
- **Gestão de Atributos:** Adicionar, editar e remover atributos com tipos relacionais (`INTEGER`, `VARCHAR`, `TEXT`, `REAL`, `DECIMAL`, `BOOLEAN`, `DATE`, `DATETIME`), indicador visual de chave primária (`[PK]`) e obrigatoriedade (`[NOT NULL]`).
- **Gestão de Relacionamentos:** Estabelecer associações estruturadas entre entidades do mesmo projeto com cardinalidades (`1:1`, `1:N`, `N:N`), validação de autorrelacionamento e integridade referencial.
- **Persistência Confiável:** Armazenamento local no SQLite (`expo-sqlite`) com integridade referencial ativa (`PRAGMA foreign_keys = ON`), migrações idempotentes e preservação integral dos dados após fechar e reabrir o aplicativo.

---

## 4. Documentação do Projeto
A documentação completa de engenharia de software do BRMM está organizada no diretório [`docs/`](./docs/):

1. 📄 [**01. Project Charter**](./docs/01-project-charter.md) — Visão geral, contexto, objetivos, público-alvo, escopo do MVP, restrições e premissas.
2. 📄 [**02. User Stories**](./docs/02-user-stories.md) — Histórias de usuário com formato ágil (`US-01` a `US-06`), personas e benefícios de negócio.
3. 📄 [**03. Requirements Specification**](./docs/03-requirements.md) — Requisitos funcionais (`RF-01` a `RF-10`) e não funcionais (`RNF-01` a `RNF-06`) com matriz de rastreabilidade.
4. 📄 [**04. Use Cases**](./docs/04-use-cases.md) — Caso de uso principal detalhado (`UC-01`), fluxos principal, alternativos e exceções.
5. 📄 [**05. Software Architecture**](./docs/05-architecture.md) — Diagramas conceituais (Mermaid), arquitetura em camadas, schema relacional do SQLite e DevSecOps.
6. 📄 [**06. Acceptance Criteria & Definition of Done**](./docs/06-acceptance-criteria.md) — Critérios de aceite objetivos (`CA-01` a `CA-09`) e checklist de Definition of Done (DoD).

---

## 5. Tecnologias Utilizadas

- **Framework Mobile:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 58)
- **Linguagem:** JavaScript (ES6+)
- **Banco de Dados Local:** SQLite via [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/) com migrações versionadas
- **Navegação:** Navegação por pilha de telas nativa com suporte ao botão físico de retorno do Android (`BackHandler`)
- **Estilização:** StyleSheet nativo do React Native com tema escuro BRMM
- **Controle de Versão:** [Git](https://git-scm.com/) e [GitHub](https://github.com/)
- **Testes Automatizados:** Test runner nativo do Node.js (`node:test`, `node:assert`) sem dependências externas

---

## 6. Estrutura do Repositório

```text
BRMM/
├── README.md                           # Documentação principal e guia rápido
├── .gitignore                          # Exclusões do controle de versão
├── docs/                               # Documentação de Engenharia de Software
│   ├── 01-project-charter.md
│   ├── 02-user-stories.md
│   ├── 03-requirements.md
│   ├── 04-use-cases.md
│   ├── 05-architecture.md
│   └── 06-acceptance-criteria.md
└── brmodelo-mobile/                    # Projeto da aplicação mobile Expo
    ├── package.json                    # Dependências e scripts npm
    ├── app.json                        # Configuração do Expo (SDK 58)
    ├── App.js                          # Ponto de entrada e pilha de navegação
    ├── src/
    │   ├── components/                 # Componentes reutilizáveis (Headers, Cards, Modais, Badges)
    │   │   ├── AppHeader.js
    │   │   ├── ConfirmModal.js
    │   │   ├── InputModal.js
    │   │   ├── AttributeModal.js
    │   │   ├── RelationshipModal.js
    │   │   ├── EmptyState.js
    │   │   ├── ProjectCard.js
    │   │   ├── EntityCard.js
    │   │   ├── AttributeItem.js
    │   │   └── RelationshipItem.js
    │   ├── components/canvas/          # Editor Visual Canvas 2D
    │   │   ├── EntityNode.js           # Nó visual arrastável de entidade
    │   │   ├── RelationshipLink.js     # Linha de conexão entre entidades
    │   │   ├── CanvasToolbar.js        # Barra de ferramentas do canvas
    │   │   ├── CanvasWorkspace.js      # Área de trabalho com zoom/pan
    │   │   └── SelectedElementDrawer.js # Painel de detalhes do elemento selecionado
    │   ├── screens/                    # Telas funcionais do MVP
    │   │   ├── HomeScreen.js           # Gestão de projetos
    │   │   ├── ProjectScreen.js        # Editor Visual Canvas 2D (Entidades e Relacionamentos)
    │   │   └── EntityScreen.js         # Gestor de atributos de entidades
    │   ├── services/                   # Regras de negócio desacopladas
    │   │   ├── projectService.js
    │   │   ├── entityService.js
    │   │   ├── attributeService.js
    │   │   └── relationshipService.js
    │   ├── database/                   # Camada de persistência SQLite
    │   │   ├── index.js                # Conexão e transações
    │   │   ├── schema.js               # DDL, constraints e índices
    │   │   ├── migrations/             # Migrações versionadas
    │   │   │   ├── 001_initial_schema.js
    │   │   │   └── 002_canvas_visual_editor.js  # Migração do Editor Visual Canvas 2D
    │   │   └── repositories/           # Repositórios CRUD parametrizados
    │   ├── models/                     # Entidades de domínio (Project, Entity, Attribute, Relationship)
    │   ├── constants/                  # Tipos de dados, cardinalidades e tema visual
    │   └── utils/                      # Validações, identificadores e formatadores
    └── tests/                          # Suítes de testes automatizados
        ├── persistence.test.js         # 15 testes de persistência SQLite
        ├── services.test.js            # 13 testes de serviços de negócio
        ├── acceptance_criteria.test.js # Teste do fluxo completo de aceitação de 15 passos
        ├── canvas_persistence.test.js  # 3 testes de persistência do canvas (posições X/Y e viewport)
        └── canvas_acceptance_flow.test.js # Teste integrado do fluxo completo do canvas 2D (12 passos)
```

---

## 7. Estado Atual do Desenvolvimento

| Funcionalidade / Artefato | Status | Observação |
| :--- | :---: | :--- |
| **Documentação de Engenharia (`docs/` 01 a 06)** | ✅ **Concluído** | 6 documentos completos, revisados e alinhados com o código. |
| **Estrutura Base do Repositório e `.gitignore`** | ✅ **Concluído** | Organização modular e boas práticas de versionamento. |
| **Camada de Persistência SQLite (`src/database`)** | ✅ **Concluído** | Conexão com `expo-sqlite`, migrações versionadas, `PRAGMA foreign_keys = ON` e exclusão em cascata. |
| **Repositórios de Dados (`src/database/repositories`)** | ✅ **Concluído** | CRUD 100% parametrizado contra SQL Injection para todas as entidades. |
| **Camada de Serviços de Negócio (`src/services`)** | ✅ **Concluído** | Validações prévias, unicidade de nomes, proibição de autorrelacionamento e cálculo de estatísticas. |
| **Componentes e Modais Reutilizáveis (`src/components`)** | ✅ **Concluído** | Modais de confirmação, entrada de texto, formulário de atributos e seletores de relacionamentos. |
| **Tela de Gerenciamento de Projetos (`HomeScreen`)** | ✅ **Concluído** | Criação, listagem com estatísticas reais, exclusão com confirmação e estados vazios. |
| **Editor Visual Canvas 2D (`ProjectScreen`)** | ✅ **Concluído** | Editor Visual Canvas 2D com entidades arrastáveis, relacionamentos visuais por linhas, barra de ferramentas, zoom/pan e toggle para modo lista. |
| **Editor Visual Canvas 2D (`src/components/canvas`)** | ✅ **Concluído** | 5 componentes dedicados: EntityNode, RelationshipLink, CanvasToolbar, CanvasWorkspace e SelectedElementDrawer. |
| **Tela de Atributos da Entidade (`EntityScreen`)** | ✅ **Concluído** | Adição e edição de atributos com tipos, switches de `[PK]` e `[NOT NULL]`, badges e ordenação. |
| **Seção Estruturada de Relacionamentos** | ✅ **Concluído** | Visualização em diagrama relacional com cardinalidades (`1:1`, `1:N`, `N:N`) e validações de integridade. |
| **Navegação Mobile Nativa** | ✅ **Concluído** | Pilha de navegação em JavaScript puro com suporte ao botão Voltar físico do Android. |
| **Testes Automatizados (33 cenários)** | ✅ **Concluído** | 33 testes aprovados (persistência, serviços, canvas e fluxo completo de aceitação). |
| **Compatibilidade Expo SDK 58 e Android** | ✅ **Concluído** | 20/20 verificações aprovadas no `npx expo-doctor` e bundle Android validado pelo Metro. |

---

## 8. Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 20+ ou 22+ instalada.
- [npm](https://www.npmjs.com/).
- Dispositivo físico móvel com o aplicativo **Expo Go** instalado (Android ou iOS) **OU** emulador Android configurado.

### Passo a Passo
1. Acesse a pasta do projeto mobile:
   ```bash
   cd brmodelo-mobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute a suíte de testes automatizados:
   ```bash
   npm test
   ```

4. Verifique a integridade do ambiente com o Expo Doctor:
   ```bash
   npx expo-doctor
   ```

5. Inicie o servidor Expo:
   ```bash
   npx expo start
   ```

6. Abra o aplicativo:
   - **No celular físico:** Abra o **Expo Go** e escaneie o QR Code exibido no terminal.
   - **No emulador Android:** Pressione a tecla `a` no terminal.
   - **Na web (para inspeção visual):** Pressione a tecla `w` no terminal.

---

## 9. Suíte de Testes Automatizados

O BRMM conta com **33 testes automatizados** divididos em cinco suítes de alta performance executadas via `node --test`:

```bash
cd brmodelo-mobile
npm test
```

### Detalhamento das Suítes:
1. `tests/persistence.test.js` (15 testes):
   - Validação de constraints SQLite (`UNIQUE`, `CHECK`, `FOREIGN KEY ... ON DELETE CASCADE`).
   - Integridade referencial composta para impedir relacionamentos entre projetos distintos.
   - Idempotência de inicialização e versionamento de migrações (`__migrations`).
2. `tests/services.test.js` (13 testes):
   - Validações de nomes vazios ou com espaços.
   - Unicidade de nomes de entidades por projeto.
   - Preservação de atributos ao editar propriedades parciais.
   - Proibição de autorrelacionamento no MVP e exigência de ao menos 2 entidades.
3. `tests/acceptance_criteria.test.js` (1 teste integrado de 15 passos):
   - Execução do fluxo completo de aceitação do MVP de ponta a ponta: criação de projeto -> entidades -> atributos com PK -> relacionamentos -> edição -> encerramento do app -> reabertura com persistência conferida -> exclusão em cascata.
4. `tests/canvas_persistence.test.js` (3 testes):
   - Persistência de posições X/Y das entidades no canvas.
   - Persistência do estado de viewport (zoom e pan) entre sessões.
5. `tests/canvas_acceptance_flow.test.js` (1 teste integrado de 12 passos):
   - Fluxo completo do Editor Visual Canvas 2D de ponta a ponta: criação de entidades no canvas -> posicionamento via arrastar-e-soltar -> conexão de relacionamentos visuais -> zoom/pan -> persistência e reabertura.

---

## 10. Funcionalidades Fora do Escopo do MVP (Futuras Extensões)

- Geração e exportação de scripts DDL SQL (`CREATE TABLE`, etc.).
- Notação Crow's foot (pé de galinha) para cardinalidades nos relacionamentos visuais.
- Sincronização em nuvem e autenticação de usuários.
- Compartilhamento e colaboração multiusuário em tempo real.
- Engenharia reversa a partir de bases de dados externas.

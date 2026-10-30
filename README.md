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
O MVP (Produto Mínimo Viável) tem por finalidade disponibilizar uma experiência mobile enxuta, confiável e **100% offline**, focada na **modelagem relacional lógica** de banco de dados:
- Criar e listar projetos de modelagem isolados.
- Abrir e continuar trabalhando em modelos existentes.
- Criar entidades com nomes únicos no contexto do projeto.
- Definir atributos com tipos de dados relacionais (`INTEGER`, `VARCHAR`, `TEXT`, `REAL`, `DECIMAL`, `BOOLEAN`, `DATE`, `DATETIME`), indicação de chave primária (`PK`) e nulidade (`NOT NULL`).
- Estabelecer relacionamentos entre entidades com seleção de cardinalidade (`1:1`, `1:N`, `N:N`), prevenindo autorrelacionamentos e associações entre projetos diferentes.
- Persistir dados localmente no dispositivo via **SQLite**, garantindo integridade referencial com chaves estrangeiras ativas e remoção em cascata (`CASCADE`).
- Excluir projetos com diálogo de confirmação explícita.

> **Nota de Escopo:** O MVP não contempla editor vetorial com posicionamento 2D livre (canvas de desenho), geração automática de SQL/DDL ou backend em nuvem. A interface prioriza formulários e cartões estruturados adaptados para o toque no celular.

---

## 4. Documentação do Projeto
A documentação completa de engenharia de software do BRMM está organizada no diretório [`docs/`](./docs/):

1. 📄 [**01. Project Charter**](./docs/01-project-charter.md) — Visão geral, contexto, objetivos, público-alvo, escopo do MVP, restrições e premissas.
2. 📄 [**02. User Stories**](./docs/02-user-stories.md) — Histórias de usuário com formato ágil, identificadores únicos, personas e benefícios de negócio.
3. 📄 [**03. Requirements Specification**](./docs/03-requirements.md) — Requisitos funcionais (RF) e não funcionais (RNF) com priorização MoSCoW e matriz de rastreabilidade.
4. 📄 [**04. Use Cases**](./docs/04-use-cases.md) — Caso de uso principal detalhado (UC-01), fluxos principal e alternativos, e tratamento de exceções.
5. 📄 [**05. Software Architecture**](./docs/05-architecture.md) — Diagramas conceituais (Mermaid), arquitetura em camadas, schema relacional do SQLite, estratégia de CI/CD e DevSecOps.
6. 📄 [**06. Acceptance Criteria & Definition of Done**](./docs/06-acceptance-criteria.md) — Critérios de aceite objetivos (formato BDD/Gherkin) e checklist de Definition of Done (DoD).

---

## 5. Tecnologias Utilizadas

- **Framework Mobile:** [React Native](https://reactnative.dev/) (0.88.1) com [Expo](https://expo.dev/) (SDK 58)
- **Linguagem:** JavaScript (ES6+) — sem TypeScript no MVP
- **Banco de Dados Local:** SQLite via biblioteca oficial [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/) (~58.0.14)
- **Estilização:** StyleSheet nativo do React Native
- **Controle de Versão:** [Git](https://git-scm.com/) e [GitHub](https://github.com/)
- **Qualidade de Código:** [ESLint](https://eslint.org/)
- **Testes Automatizados:** [Jest](https://jestjs.io/)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) (planejado)

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
    ├── app.json                        # Configuração do Expo
    ├── App.js                          # Componente raiz da aplicação
    ├── assets/                         # Imagens e ícones do aplicativo
    └── src/                            # Código-fonte da aplicação
        ├── components/                 # Componentes visuais reutilizáveis
        ├── screens/                    # Telas da aplicação
        ├── navigation/                 # Navegação entre telas
        ├── database/                   # Inicialização SQLite e migrations DDL
        ├── models/                     # Definições de modelos e esquemas
        ├── services/                   # Regras de negócio e integração de dados
        ├── hooks/                      # Hooks customizados React
        ├── utils/                      # Funções utilitárias e validações
        └── constants/                  # Constantes (tipos de dados, temas)
```

---

## 7. Estado Atual do Desenvolvimento

Para manter a máxima transparência com a evolução do projeto, o status das funcionalidades e artefatos é classificado em:

| Funcionalidade / Artefato | Status | Observação |
| :--- | :---: | :--- |
| **Documentação de Engenharia (`docs/` 01 a 06)** | ✅ **Implementado e Testado** | Todos os 6 documentos concluídos, revisados e consistentes. |
| **Estrutura Base do Repositório e `.gitignore`** | ✅ **Implementado e Testado** | Organização de pastas e regras de versionamento definidas. |
| **Camada de Persistência SQLite (`src/database`)** | ✅ **Implementado e Testado** | Conexão (`index.js`), DDL completo (`schema.js`), migrations e integridade referencial com chaves compostas e `CASCADE`. |
| **Repositórios de Persistência (`src/database/repositories`)** | ✅ **Implementado e Testado** | CRUD parametrizado completo para projetos, entidades, atributos e relacionamentos com modelos tipados em `src/models/`. |
| **Testes Automatizados de Persistência (`tests/`)** | ✅ **Implementado e Testado** | 15 cenários automatizados cobrindo todas as operações, constraints e integridade via `node --test` contra SQLite real. |
| **Interface Inicial de Demonstração (`App.js`)** | ✅ **Implementado e Testado** | Inicialização do banco, verificação de migrações e persistência interativa via Expo. |
| **Telas Finais de Modelagem (`HomeScreen`, `ProjectScreen`, etc.)** | ⏳ **Planejado** | Fluxos completos de telas dedicadas de edição e diagramação. |
| **Configuração de ESLint e Jest para UI** | ⏳ **Planejado** | Análise estática e testes unitários de componentes visuais. |
| **Pipeline de CI/CD (GitHub Actions)** | ⏳ **Planejado** | Automação de lint e testes em `.github/workflows/ci.yml`. |

> **Legenda:**  
> - ✅ **Implementado e testado:** Funcionalidade concluída, verificada e documentada.  
> - 🟡 **Em desenvolvimento:** Trabalho em andamento na etapa corrente.  
> - ⏳ **Planejado:** Escopo definido aguardando o início da implementação.

---

## 8. Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 20+ ou 24+ instalada.
- [npm](https://www.npmjs.com/).
- Dispositivo físico móvel com o aplicativo **Expo Go** instalado (disponível no Google Play ou Apple App Store) **OU** emulador configurado (Android Studio / Xcode).

### Passo a Passo
1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/BRModelo-Mobile.git
   cd BRModelo-Mobile
   ```

2. Acesse a pasta do projeto mobile:
   ```bash
   cd brmodelo-mobile
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npx expo start
   ```

5. Abra o aplicativo:
   - **No celular físico:** Abra a câmera (iOS) ou o aplicativo **Expo Go** (Android) e escaneie o QR Code exibido no terminal.
   - **No emulador Android:** Pressione a tecla `a` no terminal.
   - **No simulador iOS (macOS):** Pressione a tecla `i` no terminal.
   - **No navegador (para testes rápidos de UI):** Pressione a tecla `w` no terminal.

---

## 9. Instruções de Testes Automatizados

A camada de persistência SQLite possui 15 cenários de testes automatizados executando sobre um banco de dados SQLite real em memória:

```bash
cd brmodelo-mobile
npm test
```

Ou execute diretamente via Node.js:
```bash
node --test tests/persistence.test.js
```

Para verificar vulnerabilidades de segurança nas dependências (DevSecOps):
```bash
npm audit
```
npm audit
```

---

## 10. Próximas Etapas

1. Finalizar a configuração dos arquivos essenciais do Expo em `brmodelo-mobile/`.
2. Implementar a camada de inicialização do banco SQLite (`src/database/index.js` e migrations) garantindo suporte a chaves estrangeiras e integridade referencial.
3. Desenvolver os utilitários de validação e regras de negócio com cobertura de testes unitários Jest.
4. Implementar as telas e componentes visuais respeitando os requisitos de usabilidade mobile.
5. Configurar o workflow de CI no GitHub Actions (`.github/workflows/ci.yml`).

# Especificação de Requisitos — BRMM (BRModelo Mobile)

Este documento especifica os **Requisitos Funcionais (RF)** e os **Requisitos Não Funcionais (RNF)** para o MVP do BRMM.
A priorização segue a metodologia **MoSCoW** (*Must Have*, *Should Have*, *Could Have*, *Won't Have* nesta versão).

---

## 1. Requisitos Funcionais (RF)

Os Requisitos Funcionais descrevem o comportamento, as ações e as funcionalidades operacionais que o sistema deve fornecer diretamente ao usuário.

| Identificador | Título | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-01** | Criação de Projetos | O sistema deve permitir que o usuário crie um novo projeto de modelagem relacional, informando obrigatoriamente um nome não vazio. O sistema deve gerar um identificador único, data de criação e data de última atualização. | **Must Have** (Alta) |
| **RF-02** | Listagem de Projetos | O sistema deve exibir na tela inicial a lista de todos os projetos cadastrados localmente, apresentando nome, data de criação e data da última alteração, ordenados pela atividade mais recente. | **Must Have** (Alta) |
| **RF-03** | Abertura e Visualização de Projeto | O sistema deve permitir abrir um projeto selecionado na lista, carregando seu painel de trabalho com as entidades, atributos e relacionamentos associados. | **Must Have** (Alta) |
| **RF-04** | Exclusão de Projeto com Confirmação | O sistema deve permitir a exclusão de um projeto existente. A exclusão deve exigir confirmação explícita do usuário via diálogo/modal de confirmação e remover em cascata todas as entidades, atributos e relacionamentos vinculados. | **Must Have** (Alta) |
| **RF-05** | Criação e Edição de Entidades | O sistema deve permitir criar novas entidades vinculadas ao projeto aberto, exigindo um nome não vazio e único no contexto daquele projeto. Deve permitir também editar o nome e excluir uma entidade (com seus atributos e relacionamentos dependentes). | **Must Have** (Alta) |
| **RF-06** | Gestão de Atributos da Entidade | O sistema deve permitir adicionar, editar e remover atributos em uma entidade. Cada atributo deve conter: nome obrigatório, tipo de dado selecionável (`INTEGER`, `VARCHAR`, `TEXT`, `BOOLEAN`, `DATE`, `DECIMAL`), indicador booleano de Chave Primária (`PK`) e indicador de obrigatoriedade (`NOT NULL`). | **Must Have** (Alta) |
| **RF-07** | Criação e Remoção de Relacionamentos | O sistema deve permitir criar um relacionamento associando duas entidades existentes do mesmo projeto (origem e destino) e definir sua cardinalidade (`1:1`, `1:N` ou `N:N`). O sistema deve permitir remover relacionamentos existentes. | **Must Have** (Alta) |
| **RF-08** | Persistência Local Imediata | O sistema deve gravar no banco de dados local SQLite qualquer criação, atualização ou remoção de projeto, entidade, atributo ou relacionamento no momento em que a ação for confirmada pelo usuário. | **Must Have** (Alta) |

---

## 2. Requisitos Não Funcionais (RNF)

Os Requisitos Não Funcionais definem os atributos de qualidade, desempenho, usabilidade, segurança e restrições arquiteturais da aplicação.

| Identificador | Categoria | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Usabilidade Mobile | A interface gráfica do usuário deve ser otimizada para telas de toque (*touch screens*) em smartphones (telas a partir de 360dp de largura), com áreas de toque mínimas de 44x44dp, tipografia legível e contraste adequado (WCAG AA). Elementos de navegação devem ser acessíveis com uma única mão. | **Must Have** (Alta) |
| **RNF-02** | Persistência e Integridade dos Dados | O sistema deve utilizar SQLite local com integridade referencial ativa (`PRAGMA foreign_keys = ON`). Operações compostas (como exclusão de projetos com múltiplos filhos) devem ser executadas em transações atômicas (`BEGIN TRANSACTION / COMMIT`), evitando dados órfãos ou corrupção de estado. | **Must Have** (Alta) |
| **RNF-03** | Arquitetura e Manutenibilidade | O código-fonte deve ser escrito em JavaScript moderno (ES6+), organizado em arquitetura em camadas clara (`screens`, `components`, `services`, `database`, `models`, `utils`), desacoplando regras de negócio e acesso ao banco da camada de interface. O código deve seguir convenções limpas e estar preparado para análise de linting (ESLint). | **Must Have** (Alta) |
| **RNF-04** | Validação de Entradas e Tratamento de Erros | O sistema deve validar todos os campos de entrada (nomes vazios, caracteres excessivos, seleção de chaves primárias duplicadas indevidas) antes do envio ao banco. Mensagens de erro devem ser claras, orientativas e apresentadas ao usuário sem causar travamento (*crash*) da aplicação. | **Must Have** (Alta) |
| **RNF-05** | Privacidade e Segurança Local (DevSecOps) | Toda a informação gerada pelo usuário deve permanecer estritamente no armazenamento local do dispositivo, sem coleta de telemetria não autorizada e sem tráfego de rede desnecessário. Todas as consultas ao SQLite devem utilizar parâmetros preparados (*prepared statements* com placeholders `?`), prevenindo injeções de SQL. | **Must Have** (Alta) |
| **RNF-06** | Desempenho e Tempo de Resposta | As operações de consulta e persistência local no SQLite devem apresentar tempo de resposta inferior a 300ms para bases de dados típicas do MVP (até 50 projetos e centenas de entidades/atributos), garantindo transições de tela fluidas (60 fps). | **Should Have** (Média) |

---

## 3. Matriz de Rastreabilidade (Histórias de Usuário vs Requisitos)

| História de Usuário | Requisitos Funcionais Relacionados | Requisitos Não Funcionais Aplicáveis |
| :--- | :--- | :--- |
| **US-01** (Criar e organizar projetos) | RF-01, RF-02, RF-03 | RNF-01, RNF-03, RNF-04, RNF-06 |
| **US-02** (Entidades e atributos) | RF-05, RF-06 | RNF-01, RNF-02, RNF-04, RNF-05 |
| **US-03** (Relacionamentos) | RF-07 | RNF-01, RNF-02, RNF-04, RNF-05 |
| **US-04** (Persistência e recuperação) | RF-08, RF-02, RF-03 | RNF-02, RNF-05, RNF-06 |
| **US-05** (Exclusão segura de projetos) | RF-04 | RNF-01, RNF-02, RNF-04 |

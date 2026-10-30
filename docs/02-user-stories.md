# Histórias de Usuário (User Stories) — BRMM

Este documento formaliza as histórias de usuário para o MVP do **BRMM (BRModelo Mobile)**, seguindo a estrutura padrão ágil:
> **"Como [tipo de usuário], quero [ação], para que [benefício]."**

---

## Índice das Histórias
- [US-01: Criação e Organização de Projetos](#us-01-criação-e-organização-de-projetos)
- [US-02: Modelagem de Entidades e Atributos](#us-02-modelagem-de-entidades-e-atributos)
- [US-03: Estabelecimento de Relacionamentos entre Entidades](#us-03-estabelecimento-de-relacionamentos-entre-entidades)
- [US-04: Persistência Local e Recuperação de Projetos](#us-04-persistência-local-e-recuperação-de-projetos)
- [US-05: Exclusão Segura de Projetos](#us-05-exclusão-segura-de-projetos)

---

### US-01: Criação e Organização de Projetos
- **Identificador:** `US-01`
- **Título:** Criar e listar projetos de modelagem
- **Persona:** Estudante de Banco de Dados
- **Declaração:**
  > **Como** estudante de tecnologia,  
  > **quero** criar novos projetos de modelagem relacional informando um nome e visualizá-los em uma lista organizada,  
  > **para que** eu possa separar diferentes exercícios acadêmicos e estudos de caso de maneira prática no meu celular.
- **Benefício:** Permite ao estudante manter seus estudos isolados por disciplina ou trabalho prático, consultando rapidamente a data em que cada modelo foi trabalhado pela última vez.
- **Critérios de Aceite Básicos:**
  1. O usuário visualiza um botão de ação para criar um novo projeto a partir da tela inicial.
  2. O sistema exige a digitação de um nome válido para o projeto.
  3. Ao confirmar, o projeto é salvo e exibido na lista principal com nome e data da última alteração.
  4. Clicar em um item da lista abre o espaço de trabalho daquele projeto.

---

### US-02: Modelagem de Entidades e Atributos
- **Identificador:** `US-02`
- **Título:** Criar entidades e adicionar atributos com tipos e restrições
- **Persona:** Estudante de Modelagem de Dados
- **Declaração:**
  > **Como** modelador de dados em formação,  
  > **quero** cadastrar entidades dentro de um projeto e adicionar a elas atributos com tipo de dado, identificador de chave primária e indicador de obrigatoriedade,  
  > **para que** eu consiga representar formalmente os dados e tabelas do meu minimundo conceitual/lógico.
- **Benefício:** Garante a fidelidade semântica da modelagem relacional, permitindo que o estudante aprenda e aplique conceitos fundamentais (como PK e NOT NULL) diretamente na interface mobile.
- **Critérios de Aceite Básicos:**
  1. Dentro de um projeto aberto, o usuário pode adicionar uma nova entidade com nome obrigatório.
  2. Ao selecionar uma entidade, o usuário pode adicionar múltiplos atributos.
  3. Cada atributo permite definir nome, tipo de dado (ex.: `INTEGER`, `VARCHAR`, etc.), se é chave primária (`PK`) e se é obrigatório (`NOT NULL`).
  4. A lista de atributos da entidade exibe claramente as marcas visuais de `[PK]` e obrigatoriedade.

---

### US-03: Estabelecimento de Relacionamentos entre Entidades
- **Identificador:** `US-03`
- **Título:** Criar relacionamentos entre entidades existentes
- **Persona:** Aluno de Banco de Dados Relacional
- **Declaração:**
  > **Como** aluno de banco de dados,  
  > **quero** definir relacionamentos entre duas entidades existentes no meu projeto escolhendo a cardinalidade adequada,  
  > **para que** eu possa representar as associações e regras de negócio entre as tabelas do meu modelo relacional.
- **Benefício:** Viabiliza o estudo e a validação de regras de integridade referencial e cardinalidades (1:1, 1:N, N:N), essenciais na arquitetura relacional.
- **Critérios de Aceite Básicos:**
  1. A tela de relacionamentos permite selecionar uma entidade de origem e uma entidade de destino a partir das entidades cadastradas no mesmo projeto.
  2. O usuário não pode criar relacionamento referenciando entidades inexistentes.
  3. O usuário seleciona o tipo de cardinalidade (`1:1`, `1:N`, `N:N`).
  4. O relacionamento cadastrado é listado exibindo origem, destino e cardinalidade, com opção de remoção.

---

### US-04: Persistência Local e Recuperação de Projetos
- **Identificador:** `US-04`
- **Título:** Salvar e recuperar projetos localmente sem perda de dados
- **Persona:** Usuário de Smartphone
- **Declaração:**
  > **Como** usuário mobile,  
  > **quero** que todas as entidades, atributos e relacionamentos criados sejam gravados automaticamente no armazenamento local do dispositivo,  
  > **para que** eu possa fechar o aplicativo a qualquer momento e continuar de onde parei sem perder o progresso e sem depender de conexão com a internet.
- **Benefício:** Confiabilidade e robustez, eliminando a frustração de perda de dados acidental em dispositivos móveis que podem descarregar ou fechar apps em segundo plano.
- **Critérios de Aceite Básicos:**
  1. Qualquer alteração (inclusão, alteração ou exclusão) é persistida imediatamente no banco de dados local SQLite.
  2. Ao encerrar o processo do aplicativo e reabri-lo, todos os projetos e seus respectivos elementos permanecem inalterados.
  3. O aplicativo não requer acesso à rede ou autenticação para ler e gravar dados.

---

### US-05: Exclusão Segura de Projetos
- **Identificador:** `US-05`
- **Título:** Excluir projetos mediante confirmação explícita
- **Persona:** Usuário de Smartphone
- **Declaração:**
  > **Como** usuário do aplicativo,  
  > **quero** poder excluir projetos obsoletos ou de teste com um diálogo de confirmação prévio,  
  > **para que** eu mantenha meu espaço de trabalho organizado sem correr o risco de apagar modelos importantes por toque acidental.
- **Benefício:** Proteção contra perda acidental de dados em telas de toque (touch screens), respeitando as boas práticas de usabilidade e prevenção de erros.
- **Critérios de Aceite Básicos:**
  1. A ação de exclusão de um projeto aciona um diálogo de confirmação com opções claras ("Cancelar" e "Excluir").
  2. A exclusão somente é executada após a confirmação explícita do usuário.
  3. Ao ser excluído, todas as entidades, atributos e relacionamentos associados àquele projeto são removidos do banco local de forma atômica (deleção em cascata).

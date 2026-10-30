# Critérios de Aceitação e Definição de Pronto — BRMM

Este documento estabelece critérios de aceitação objetivos, testáveis e verificáveis para as funcionalidades do MVP do **BRMM (BRModelo Mobile)**, além da **Definition of Done (DoD)** geral para o projeto.

---

## 1. Critérios de Aceitação por Funcionalidade

### CA-01: Criação e Listagem de Projetos (RF-01, RF-02)
- **Cenário 1: Criação de projeto com nome válido**
  - **Dado** que o usuário está na tela inicial,
  - **Quando** ele clica no botão "Novo Projeto", insere o nome "Projeto Vendas" e confirma a gravação,
  - **Então** o sistema fecha o modal/formulário, grava o projeto no SQLite com um UUID único e data/hora atual, e exibe "Projeto Vendas" na lista da tela inicial.
- **Cenário 2: Validação de nome obrigatório**
  - **Dado** que o formulário de novo projeto está aberto,
  - **Quando** o usuário clica em salvar com o campo nome vazio ou contendo apenas espaços,
  - **Então** o sistema impede a submissão, mantém o formulário aberto e exibe a mensagem de validação: "O nome do projeto é obrigatório."
- **Cenário 3: Exibição da listagem ordenada**
  - **Dado** que existem múltiplos projetos cadastrados no banco local,
  - **Quando** o usuário acessa a tela inicial,
  - **Então** todos os projetos são listados em ordem decrescente pela data da última atualização (`updated_at DESC`), exibindo nome e data legível.

---

### CA-02: Abertura de Projetos Existentes (RF-03)
- **Cenário 1: Navegação para o painel do projeto**
  - **Dado** que a lista de projetos exibe "Projeto Vendas",
  - **Quando** o usuário toca sobre o cartão de "Projeto Vendas",
  - **Então** o sistema navega para a tela do projeto, exibindo o título correspondente e todas as entidades e relacionamentos pertencentes àquele projeto.
- **Cenário 2: Projeto sem entidades cadastradas**
  - **Dado** que um projeto recém-criado foi aberto,
  - **Quando** a tela do projeto for renderizada,
  - **Então** deve ser exibido um estado vazio amigável informando: "Nenhuma entidade cadastrada neste projeto. Toque em 'Nova Entidade' para começar."

---

### CA-03: Criação e Gestão de Entidades (RF-05)
- **Cenário 1: Adição de entidade com sucesso**
  - **Dado** que o usuário está no painel de um projeto aberto,
  - **Quando** ele clica em "Nova Entidade", informa o nome "Cliente" e confirma,
  - **Então** a entidade "Cliente" é persistida no SQLite vinculada ao `project_id` atual e passa a constar na lista de entidades do projeto.
- **Cenário 2: Validação de nome duplicado no mesmo projeto**
  - **Dado** que já existe uma entidade chamada "Cliente" no projeto atual,
  - **Quando** o usuário tenta cadastrar outra entidade chamada "Cliente",
  - **Então** o sistema bloqueia a criação e exibe o alerta: "Já existe uma entidade com este nome no projeto."
- **Cenário 3: Exclusão de entidade**
  - **Dado** que uma entidade está cadastrada no projeto,
  - **Quando** o usuário aciona a exclusão da entidade e confirma a mensagem de alerta,
  - **Então** a entidade, seus atributos vinculados e relacionamentos que a referenciam são removidos do banco de dados e da tela.

---

### CA-04: Gestão de Atributos de Entidade (RF-06)
- **Cenário 1: Adição de atributo com campos completos**
  - **Dado** que o usuário está visualizando a entidade "Cliente",
  - **Quando** adiciona um atributo com nome "cpf", tipo "VARCHAR", `is_primary_key = 0` e `is_required = 1`,
  - **Então** o atributo é gravado e listado exibindo "cpf : VARCHAR [NOT NULL]".
- **Cenário 2: Adição de chave primária**
  - **Dado** que o usuário cadastra o atributo "id" com `is_primary_key = 1`,
  - **Quando** a operação é concluída com sucesso,
  - **Então** o atributo é exibido na lista com um indicador visual explícito `[PK]`.
- **Cenário 3: Validação de campos obrigatórios de atributo**
  - **Dado** que o formulário de atributo está aberto,
  - **Quando** o usuário deixa o nome do atributo em branco ou não seleciona o tipo de dado,
  - **Então** o sistema impede a inclusão e destaca o campo com erro.

---

### CA-05: Criação e Remoção de Relacionamentos (RF-07)
- **Cenário 1: Criação de relacionamento entre entidades existentes**
  - **Dado** que o projeto possui as entidades "Cliente" e "Pedido",
  - **Quando** o usuário cria um relacionamento selecionando Origem: "Cliente", Destino: "Pedido" e Cardinalidade: "1:N",
  - **Então** o registro é salvo na tabela `relationships` e renderizado na seção de relacionamentos como "Cliente (1) ── (N) Pedido".
- **Cenário 2: Bloqueio quando não há entidades suficientes**
  - **Dado** que o projeto possui menos de 2 entidades cadastradas,
  - **Quando** o usuário tenta criar um relacionamento,
  - **Então** o sistema exibe um aviso informando que são necessárias pelo menos duas entidades cadastradas para compor um relacionamento.
- **Cenário 3: Remoção de relacionamento**
  - **Dado** que existe um relacionamento listado,
  - **Quando** o usuário clica no botão de remover e confirma,
  - **Então** o relacionamento é removido do SQLite e da interface sem afetar as entidades de origem e destino.

---

### CA-06: Persistência e Recuperação de Dados Após Reinício (RF-08)
- **Cenário 1: Continuidade de estado após fechamento do app**
  - **Dado** que o usuário criou um projeto com 2 entidades, 4 atributos e 1 relacionamento,
  - **Quando** o aplicativo é totalmente finalizado (processo encerrado no sistema operacional) e reaberto,
  - **Então** o projeto continua listado na tela inicial e, ao ser aberto, apresenta exatamente as mesmas 2 entidades, 4 atributos e 1 relacionamento intactos.

---

### CA-07: Exclusão de Projetos com Confirmação Explícita (RF-04)
- **Cenário 1: Cancelamento da exclusão**
  - **Dado** que o diálogo de confirmação "Deseja realmente excluir este projeto?" está aberto para o projeto "Loja Virtual",
  - **Quando** o usuário toca em "Cancelar",
  - **Então** o diálogo é fechado, nenhum dado é excluído e o projeto continua listado normalmente.
- **Cenário 2: Confirmação da exclusão**
  - **Dado** que o diálogo de confirmação está aberto,
  - **Quando** o usuário toca em "Excluir",
  - **Então** o projeto e todos os registros dependentes nas tabelas `entities`, `attributes` e `relationships` são deletados permanentemente do SQLite via transação com cascata, e o projeto deixa de constar na lista.

---

## 2. Definition of Done (DoD)

Para que qualquer funcionalidade, tarefa ou história de usuário seja considerada **Concluída (Done)** no projeto BRMM, os seguintes requisitos devem ser obrigatoriamente atendidos:

1. **Implementação do Código:** O código deve atender integralmente aos critérios de aceitação da funcionalidade, sem inclusão de escopo não solicitado.
2. **Padrão e Limpeza de Código:**
   - Código escrito em JavaScript (ES6+) legível e formatado.
   - Variáveis, funções e componentes com nomes claros e descritivos em português ou inglês consistente.
   - Nenhuma variável ou dependência órfã/não utilizada.
   - Código analisado via ESLint sem erros críticos.
3. **Persistência Segura e Tratamento de Exceções:**
   - Todas as operações no SQLite utilizam queries parametrizadas com placeholders (`?`).
   - Blocos `try/catch` implementados para tratar falhas de I/O e persistência, apresentando feedback visual ao usuário sem travar o aplicativo.
4. **Testes Automatizados:**
   - Regras de negócio e validações cobertas por testes unitários com Jest.
   - 100% dos testes da suíte executando com sucesso (`npm test`).
5. **Usabilidade Mobile:**
   - Elementos testados com área de toque confortável em telas de smartphones.
   - Feedback visual implementado para estados de carregamento, listas vazias e confirmações de ações destrutivas.
6. **Controle de Versão e Documentação:**
   - Commit semântico associado à funcionalidade.
   - Documentação de requisitos ou arquitetura atualizada se houver alterações de contrato ou schema.

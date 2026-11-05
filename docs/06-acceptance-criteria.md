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
- **Cenário 1: Navegação para o editor visual do projeto**
  - **Dado** que a lista de projetos exibe "Projeto Vendas",
  - **Quando** o usuário toca sobre o cartão de "Projeto Vendas",
  - **Então** o sistema navega para a tela do projeto no modo Canvas 2D, exibindo a área de trabalho interativa com todas as entidades em suas respectivas posições e relacionamentos conectados.
- **Cenário 2: Projeto sem entidades cadastradas**
  - **Dado** que um projeto recém-criado foi aberto,
  - **Quando** a tela do projeto for renderizada,
  - **Então** o canvas exibe a grade de referência visual e permite criar a primeira entidade pelo botão "+ Entidade" na barra inferior ou toque duplo no fundo.

---

### CA-03: Criação e Gestão de Entidades (RF-05)
- **Cenário 1: Adição de entidade com sucesso**
  - **Dado** que o usuário está no painel de um projeto aberto,
  - **Quando** ele clica em "Nova Entidade", informa o nome "Cliente" e confirma,
  - **Então** a entidade "Cliente" é persistida no SQLite vinculada ao `project_id` atual com coordenadas de posição válidas e renderizada como cartão visual no canvas.
- **Cenário 2: Validação de nome duplicado no mesmo projeto**
  - **Dado** que já existe uma entidade chamada "Cliente" no projeto atual,
  - **Quando** o usuário tenta cadastrar outra entidade chamada "Cliente",
  - **Então** o sistema bloqueia a criação e exibe o alerta: "Já existe uma entidade com este nome no projeto."
- **Cenário 3: Exclusão de entidade**
  - **Dado** que uma entidade está cadastrada no projeto,
  - **Quando** o usuário aciona a exclusão da entidade e confirma a mensagem de alerta,
  - **Então** a entidade, seus atributos vinculados e relacionamentos que a referenciam são removidos do banco de dados e do diagrama visual.

---

### CA-04: Gestão de Atributos de Entidade (RF-06)
- **Cenário 1: Adição de atributo com campos completos**
  - **Dado** que o usuário está visualizando a entidade "Cliente",
  - **Quando** adiciona um atributo com nome "cpf", tipo "VARCHAR", `is_primary_key = 0` e `is_not_null = 1`,
  - **Então** o atributo é gravado e listado no cartão da entidade exibindo "cpf : VARCHAR [NN]".
- **Cenário 2: Adição de chave primária**
  - **Dado** que o usuário cadastra o atributo "id" com `is_primary_key = 1`,
  - **Quando** a operação é concluída com sucesso,
  - **Então** o atributo é exibido no nó visual com badge dourado `[PK]`.
- **Cenário 3: Validação de campos obrigatórios de atributo**
  - **Dado** que o formulário de atributo está aberto,
  - **Quando** o usuário deixa o nome do atributo em branco ou não seleciona o tipo de dado,
  - **Então** o sistema impede a inclusão e destaca o campo com erro.

---

### CA-05: Criação e Remoção de Relacionamentos (RF-07)
- **Cenário 1: Criação de relacionamento entre entidades existentes**
  - **Dado** que o projeto possui as entidades "Cliente" e "Pedido",
  - **Quando** o usuário cria um relacionamento selecionando Origem: "Cliente", Destino: "Pedido" e Cardinalidade: "1:N",
  - **Então** o registro é salvo na tabela `relationships` e renderizado como uma linha visível conectando os dois cartões no canvas com badge central "1:N".
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
  - **Então** o projeto continua listado na tela inicial e, ao ser aberto, apresenta exatamente as mesmas 2 entidades, 4 atributos e 1 relacionamento intactos nas posições salvas.

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

### CA-08: Editor Visual Canvas 2D e Posicionamento (RF-09)
- **Cenário 1: Arrastar entidade com o toque**
  - **Dado** que uma entidade está posicionada nas coordenadas (100, 100),
  - **Quando** o usuário toca e arrasta o cartão da entidade para uma nova posição (320, 240) e solta o dedo,
  - **Então** a entidade é movida em tempo real na tela e suas novas coordenadas são persistidas no SQLite.
- **Cenário 2: Navegação com Pan e Zoom**
  - **Dado** que o usuário está no canvas,
  - **Quando** ele arrasta com um dedo pelo fundo (pan) ou usa o gesto de pinça com dois dedos (pinch-to-zoom) / botões de zoom,
  - **Então** a área de trabalho se desloca ou altera a escala proporcionalmente mantendo as posições relativas dos elementos intactas.
- **Cenário 3: Enquadramento do diagrama (Fit-to-View)**
  - **Dado** que o projeto possui entidades espalhadas no espaço 2D,
  - **Quando** o usuário clica no botão "Enquadrar" na barra de ferramentas,
  - **Então** o sistema recalcula o zoom e pan ideais para exibir todas as entidades centralizadas na tela.

---

### CA-09: Conexão Visual de Relacionamentos e Viewport (RF-10)
- **Cenário 1: Fluxo de ligação visual direto no canvas**
  - **Dado** que o usuário ativa a ferramenta "Relacionar" na barra inferior,
  - **Quando** toca na entidade "Cliente" (origem) e depois na entidade "Pedido" (destino),
  - **Então** o seletor de cardinalidade é aberto com as entidades pré-selecionadas e, ao confirmar, uma linha conectora é traçada entre os nós.
- **Cenário 2: Linhas conectoras acompanham nós em movimento**
  - **Dado** que existe uma linha de relacionamento entre as entidades A e B,
  - **Quando** o usuário arrasta a entidade A para outro ponto do canvas,
  - **Então** a linha se estica/rotaciona dinamicamente mantendo as pontas fixadas nos centros das duas entidades.
- **Cenário 3: Persistência do viewport do projeto**
  - **Dado** que o usuário ajustou o zoom para 140% e deslocou a área de trabalho para (150, 80),
  - **Quando** sai do projeto ou fecha o app e depois reabre,
  - **Então** o zoom e as coordenadas de navegação são restaurados exatamente como foram deixados.

---

## 2. Definition of Done (DoD)

Para que qualquer funcionalidade, tarefa ou história de usuário seja considerada **Concluída (Done)** no projeto BRMM, os seguintes requisitos devem ser obrigatoriamente atendidos:

1. **Implementação do Código:** O código deve atender integralmente aos critérios de aceitação da funcionalidade, sem inclusão de escopo não solicitado.
2. **Padrão e Limpeza de Código:**
   - Código escrito em JavaScript (ES6+) legível e formatado.
   - Variáveis, funções e componentes com nomes claros e descritivos em português ou inglês consistente.
   - Nenhuma variável ou dependência órfã/não utilizada.
3. **Persistência Segura e Tratamento de Exceções:**
   - Todas as operações no SQLite utilizam queries parametrizadas com placeholders (`?`).
   - Blocos `try/catch` implementados para tratar falhas de I/O e persistência, apresentando feedback visual ao usuário sem travar o aplicativo.
4. **Testes Automatizados:**
   - Regras de negócio, persistência, regras de integridade e fluxo visual do canvas cobertos por testes automatizados com o test runner nativo do Node.js (`node:test`).
   - 100% dos testes da suíte executando com sucesso (`npm test`).
5. **Usabilidade Mobile:**
   - Elementos testados com área de toque confortável em telas de smartphones.
   - Feedback visual implementado para estados de carregamento, listas vazias e confirmações de ações destrutivas.
   - Suporte a gestos touch nativos (arrastar, pan, pinch-to-zoom, duplo toque).
6. **Controle de Versão e Documentação:**
   - Commit semântico associado à funcionalidade.
   - Documentação de requisitos, arquitetura e critérios de aceitação atualizada.

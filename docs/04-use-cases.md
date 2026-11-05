# Especificação de Casos de Uso — BRMM (BRModelo Mobile)

Este documento detalha o caso de uso central do MVP do **BRMM**: a modelagem completa de um banco de dados relacional pelo aplicativo móvel com experiência de **Editor Visual Canvas 2D**.

---

## Caso de Uso Principal: UC-01 — Criar e Estruturar Modelo Relacional Completo no Canvas 2D

### 1. Metadados
- **Identificador:** `UC-01`
- **Nome:** Criar e Estruturar Modelo Relacional Completo no Canvas 2D
- **Ator Principal:** Usuário do Aplicativo (Estudante/Modelador de Dados)
- **Objetivo:** Permitir ao usuário criar um novo projeto de modelagem, definir entidades com seus respectivos atributos (com chaves primárias e tipos) e estabelecer relacionamentos com cardinalidades, manipulando e organizando os elementos visualmente em um Canvas 2D interativo com persistência SQLite.
- **Pré-condições:**
  1. O aplicativo BRMM deve estar instalado e inicializado no dispositivo do usuário.
  2. O banco de dados local SQLite deve ter sido inicializado com as migrações versionadas aplicadas.
- **Pós-condições:**
  1. O novo projeto e todas as entidades, atributos, relacionamentos, coordenadas de nós e estado de viewport estão salvos no banco SQLite.
  2. O projeto aparece atualizado na lista de projetos com carimbo de data/hora atual.
  3. O modelo pode ser reaberto e visualizado nas mesmas posições espaciais a qualquer momento.

---

### 2. Fluxo Principal (Cenário Feliz no Canvas 2D)

1. O usuário abre o BRMM e visualiza a tela inicial contendo a lista de projetos existentes e um botão de ação para criar um novo projeto.
2. O usuário toca no botão **"Novo Projeto"**.
3. O sistema exibe um formulário solicitando o nome do projeto.
4. O usuário digita o nome do projeto (ex.: *"E-commerce Acadêmico"*) e toca em **"Salvar"**.
5. O sistema valida que o nome não está em branco, insere o projeto no SQLite e abre diretamente a tela do **Editor Visual Canvas 2D**.
6. No canvas, o usuário toca no botão **"+ Entidade"** na barra inferior de ferramentas (ou dá um toque duplo no fundo da área de trabalho).
7. O sistema abre o modal de criação de entidade.
8. O usuário informa o nome da entidade (ex.: *"Cliente"*) e confirma.
9. O sistema calcula a posição no viewport, persiste a entidade no SQLite e renderiza o cartão visual no canvas.
10. O usuário toca no cartão *"Cliente"* no canvas para selecioná-lo; a gaveta contextual inferior exibe ações para a entidade.
11. O usuário toca em **"+ Atributo"** na gaveta contextual.
12. O sistema abre o formulário de cadastro de atributo.
13. O usuário preenche o nome do atributo (*"id"*), seleciona o tipo de dado (*"INTEGER"*), marca as opções de Chave Primária (`PK`) e Obrigatório (`NOT NULL`), e confirma.
14. O sistema persiste o atributo e atualiza o cartão da entidade no canvas, exibindo o badge dourado `[PK]` e `[NN]`.
15. O usuário adiciona um segundo atributo (*"nome"*, *"VARCHAR"*, `NOT NULL`) pelo mesmo fluxo.
16. O usuário cria uma segunda entidade (ex.: *"Pedido"*) com seus atributos (*"id"*, *"INTEGER"*, `PK`; *"data_pedido"*, *"DATE"*, `NOT NULL`).
17. O usuário arrasta o cartão *"Pedido"* para o lado direito da tela para organizar visualmente o diagrama.
18. O usuário toca na ferramenta **"Relacionar"** na barra inferior (modo de conexão visual).
19. O sistema exibe banner instrucional: *"Etapa 1: Toque na entidade de origem no canvas"*. O usuário toca em *"Cliente"*.
20. O sistema atualiza o banner: *"Etapa 2: Toque na entidade de destino para ligar com 'Cliente'"*. O usuário toca em *"Pedido"*.
21. O sistema abre o modal de relacionamento com as entidades pré-selecionadas; o usuário escolhe a cardinalidade (*"1:N"*), insere opcionalmente um nome de relacionamento e confirma.
22. O sistema grava o relacionamento no SQLite e renderiza imediatamente uma linha conectora com o chip central *"1:N"*.
23. O usuário experimenta arrastar *"Cliente"* para outra posição; a linha conectora acompanha o movimento em tempo real a 60 fps.
24. O usuário toca em **"Enquadrar"** na barra de ferramentas; o canvas ajusta suavemente o zoom e o deslocamento para centralizar todo o diagrama.
25. O usuário retorna à tela inicial; o projeto *"E-commerce Acadêmico"* agora é exibido no topo da lista.

---

### 3. Fluxos Alternativos

#### 3.1. FA-01: Abertura e Continuação de Projeto Existente
- No **Passo 1** do fluxo principal, o usuário clica sobre um projeto já listado.
- O sistema recupera todas as entidades com suas coordenadas (X, Y), atributos, relacionamentos e viewport (zoom, panX, panY).
- O sistema abre o canvas exatamente na mesma posição e escala onde o usuário havia deixado.

#### 3.2. FA-02: Alternância para Visão Auxiliar em Lista
- Em qualquer momento no canvas, o usuário clica em **"Ver Lista"** na barra de ferramentas.
- O sistema alterna para a visualização em abas tabulares (Entidades / Relacionamentos).
- O usuário pode gerenciar dados via listas tradicionais e clicar em **"Voltar ao Canvas"** para retornar à experiência visual.

#### 3.3. FA-03: Edição ou Remoção de Relacionamento no Canvas
- O usuário toca sobre o chip de cardinalidade de uma linha conectora no canvas.
- A gaveta contextual inferior exibe as opções: **"Cardinalidade"** e **"Excluir"**.
- Ao tocar em **"Cardinalidade"**, altera o tipo (ex.: de `1:N` para `N:N`).
- Ao tocar em **"Excluir"**, confirma a exclusão e a linha é removida do diagrama sem afetar as entidades.

#### 3.4. FA-04: Exclusão de Entidade com Dependências
- Na gaveta contextual de uma entidade selecionada, o usuário toca em **"Excluir"**.
- O sistema exibe alerta informando que os atributos e relacionamentos associados também serão excluídos.
- Após confirmação explícita do usuário, o sistema executa a exclusão em cascata dentro de uma transação SQLite.

#### 3.5. FA-05: Exclusão de Projeto
- Na tela inicial, o usuário aciona a opção de exclusão em um cartão de projeto.
- O sistema abre um diálogo modal: *"Tem certeza que deseja excluir o projeto '[Nome]'? Esta ação é irreversível."*
- Ao tocar em **"Excluir"**, o sistema remove em cascata o projeto e todos os seus vínculos do banco de dados local.

---

### 4. Exceções e Tratamento de Erros

#### 4.1. EX-01: Nome Obrigatório Vazio ou Apenas com Espaços
- **Condição:** No **Passo 4** ou **Passo 8**, o usuário tenta submeter o formulário sem preencher o nome ou contendo apenas espaços em branco.
- **Tratamento:** O sistema intercepta a validação antes da chamada ao banco, mantém o formulário aberto e exibe uma mensagem de validação destacada: *"O nome é obrigatório e não pode conter apenas espaços."* Nenhum registro é gravado.

#### 4.2. EX-02: Tentativa de Criar Relacionamento com Menos de Duas Entidades ou Autorrelacionamento
- **Condição:** No **Passo 18**, o projeto possui menos de 2 entidades cadastradas, ou o usuário tenta selecionar a mesma entidade como origem e destino.
- **Tratamento:** O sistema bloqueia a ação e exibe mensagem orientadora clara sem abrir formulários inválidos.

#### 4.3. EX-03: Dados Inválidos de Atributo (Ausência de Nome ou Tipo)
- **Condição:** No **Passo 13**, o usuário tenta salvar um atributo sem informar o nome ou sem selecionar um tipo de dado válido.
- **Tratamento:** O sistema sinaliza o campo com erro visual e impede a submissão até que os campos mínimos estejam preenchidos.

#### 4.4. EX-04: Falha na Leitura ou Escrita no Banco SQLite
- **Condição:** Ocorre um erro de I/O, corrupção de arquivo ou falha de transação ao tentar gravar ou consultar dados no dispositivo.
- **Tratamento:**
  1. A transação em andamento é abortada via `ROLLBACK`.
  2. O erro é capturado e tratado no bloco `try...catch` da camada de serviço.
  3. O usuário recebe um alerta compreensível: *"Não foi possível salvar os dados no momento. Verifique o espaço do dispositivo e tente novamente."*
  4. O aplicativo não trava (*não sofre crash*).

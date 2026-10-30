# Especificação de Casos de Uso — BRMM (BRModelo Mobile)

Este documento detalha o caso de uso central do MVP do **BRMM**: a modelagem completa de um banco de dados relacional pelo aplicativo móvel.

---

## Caso de Uso Principal: UC-01 — Criar e Estruturar Modelo Relacional Completo

### 1. Metadados
- **Identificador:** `UC-01`
- **Nome:** Criar e Estruturar Modelo Relacional Completo
- **Ator Principal:** Usuário do Aplicativo (Estudante/Modelador de Dados)
- **Objetivo:** Permitir ao usuário criar um novo projeto de modelagem, definir entidades com seus respectivos atributos (com chaves primárias e tipos) e estabelecer relacionamentos com cardinalidades, persistindo todas as informações de forma confiável no banco de dados local.
- **Pré-condições:**
  1. O aplicativo BRMM deve estar instalado e inicializado no dispositivo do usuário.
  2. O banco de dados local SQLite deve ter sido inicializado com as tabelas do sistema criadas.
- **Pós-condições:**
  1. O novo projeto e todas as entidades, atributos e relacionamentos criados estão salvos no banco SQLite.
  2. O projeto aparece atualizado na lista de projetos com carimbo de data/hora atual.
  3. O modelo pode ser reaberto e modificado a qualquer momento, mesmo após o encerramento completo do app.

---

### 2. Fluxo Principal (Cenário Feliz)

1. O usuário abre o BRMM e visualiza a tela inicial contendo a lista de projetos existentes e um botão de ação para criar um novo projeto.
2. O usuário toca no botão **"Novo Projeto"**.
3. O sistema exibe um formulário solicitando o nome do projeto.
4. O usuário digita o nome do projeto (ex.: *"E-commerce Acadêmico"*) e toca em **"Salvar"**.
5. O sistema valida que o nome não está em branco, insere o projeto no SQLite e redireciona o usuário para o painel do projeto recém-criado.
6. No painel do projeto, o usuário toca em **"Nova Entidade"**.
7. O sistema exibe o formulário de criação de entidade.
8. O usuário informa o nome da entidade (ex.: *"Cliente"*) e confirma.
9. O sistema valida e persiste a entidade no SQLite, exibindo-a na lista de entidades do projeto.
10. O usuário seleciona a entidade *"Cliente"* e toca em **"Adicionar Atributo"**.
11. O sistema abre o formulário de cadastro de atributo.
12. O usuário preenche o nome do atributo (*"id"*), seleciona o tipo de dado (*"INTEGER"*), marca as opções de Chave Primária (`PK`) e Obrigatório (`NOT NULL`), e confirma.
13. O sistema valida e insere o atributo associado à entidade *"Cliente"*.
14. O usuário adiciona um segundo atributo (*"nome"*, *"VARCHAR"*, `NOT NULL`) seguindo o mesmo fluxo.
15. O usuário retorna ao painel do projeto e cria uma segunda entidade (ex.: *"Pedido"*) com seus atributos (*"id"*, *"INTEGER"*, `PK`; *"data_pedido"*, *"DATE"*, `NOT NULL`).
16. O usuário acessa a seção **"Relacionamentos"** do projeto e toca em **"Novo Relacionamento"**.
17. O sistema apresenta seletores com a lista de entidades disponíveis no projeto.
18. O usuário seleciona a entidade de origem (*"Cliente"*), a entidade de destino (*"Pedido"*) e a cardinalidade (*"1:N"*).
19. O usuário toca em **"Confirmar Relacionamento"**.
20. O sistema valida a integridade referencial, grava o relacionamento no SQLite e o exibe no resumo do modelo.
21. O usuário retorna à tela inicial; o projeto *"E-commerce Acadêmico"* agora é exibido no topo da lista com o total de entidades e data da última alteração.

---

### 3. Fluxos Alternativos

#### 3.1. FA-01: Abertura e Continuação de Projeto Existente
- No **Passo 1** do fluxo principal, o usuário clica sobre um projeto já listado.
- O sistema recupera todas as entidades, atributos e relacionamentos associados àquele projeto a partir do SQLite.
- O sistema exibe o painel do projeto com todos os dados carregados, permitindo continuar a edição a partir do **Passo 6**.

#### 3.2. FA-02: Edição ou Remoção de Atributo Existente
- No **Passo 13**, em vez de adicionar novo atributo, o usuário toca em um atributo existente.
- O sistema abre o formulário pré-preenchido com os dados atuais.
- O usuário altera os dados e confirma, ou opta pelo botão de remoção.
- O sistema atualiza ou remove o registro correspondente no SQLite e atualiza a interface.

#### 3.3. FA-03: Exclusão de Entidade com Dependências
- No **Passo 9**, o usuário opta por excluir uma entidade.
- O sistema verifica se existem relacionamentos associados à entidade.
- O sistema exibe alerta informando que os atributos e relacionamentos associados também serão excluídos.
- Após confirmação explícita do usuário, o sistema executa a exclusão em cascata dentro de uma transação SQLite.

#### 3.4. FA-04: Exclusão de Projeto
- Na tela inicial, o usuário aciona a opção de exclusão em um cartão de projeto.
- O sistema abre um diálogo modal: *"Tem certeza que deseja excluir o projeto '[Nome]'? Esta ação é irreversível."*
- Ao tocar em **"Excluir"**, o sistema remove em cascata o projeto e todos os seus vínculos do banco de dados local e atualiza a listagem.

---

### 4. Exceções e Tratamento de Erros

#### 4.1. EX-01: Nome Obrigatório Vazio ou Apenas com Espaços
- **Condição:** No **Passo 4** ou **Passo 8**, o usuário tenta submeter o formulário sem preencher o nome ou contendo apenas espaços em branco.
- **Tratamento:** O sistema intercepta a validação antes da chamada ao banco, mantém o formulário aberto e exibe uma mensagem de validação destacada: *"O nome é obrigatório e não pode conter apenas espaços."* Nenhum registro é gravado.

#### 4.2. EX-02: Tentativa de Criar Relacionamento com Entidade Inexistente ou Menos de Duas Entidades
- **Condição:** No **Passo 16**, o projeto possui menos de 2 entidades cadastradas, ou uma entidade selecionada foi invalidada.
- **Tratamento:** O sistema desabilita o botão de novo relacionamento ou exibe mensagem orientadora: *"É necessário ter ao menos duas entidades cadastradas para criar um relacionamento."*

#### 4.3. EX-03: Dados Inválidos de Atributo (Ausência de Nome ou Tipo)
- **Condição:** No **Passo 12**, o usuário tenta salvar um atributo sem informar o nome ou sem selecionar um tipo de dado válido.
- **Tratamento:** O sistema sinaliza o campo com erro visual e impede a submissão até que os campos mínimos estejam preenchidos.

#### 4.4. EX-04: Falha na Leitura ou Escrita no Banco SQLite
- **Condição:** Ocorre um erro de I/O, corrupção de arquivo ou falha de transação ao tentar gravar ou consultar dados no dispositivo.
- **Tratamento:**
  1. A transação em andamento é abortada via `ROLLBACK`.
  2. O erro é capturado e tratado no bloco `try...catch` da camada de serviço.
  3. O usuário recebe um alerta compreensível: *"Não foi possível salvar os dados no momento. Verifique o espaço do dispositivo e tente novamente."*
  4. O aplicativo não trava (*não sofre crash*).

# Project Charter — BRMM (BRModelo Mobile)

## 1. Informações do Projeto
- **Título do Projeto:** BRMM — BRModelo Mobile
- **Versão:** 1.0 (MVP)
- **Status:** Em Desenvolvimento / MVP Funcional
- **Autor/Responsável:** Equipe de Desenvolvimento BRMM
- **Repositório:** `BRModelo-Mobile`

---

## 2. Descrição e Contexto
O **BRMM (BRModelo Mobile)** é um aplicativo móvel concebido para permitir a criação, edição e visualização de modelos relacionais de bancos de dados diretamente em smartphones e tablets. Inspirado no consagrado software desktop **BRModelo**, ferramenta amplamente adotada em cursos técnicos, graduações e por profissionais no Brasil para o ensino de modelagem conceitual e lógica, o BRMM adapta essa experiência para o ecossistema móvel com um **Editor Visual Canvas 2D interativo**.

Historicamente, o aprendizado e a prática de modelagem de dados estiveram restritos a computadores de mesa ou notebooks devido à dependência de softwares legados para desktop. O BRMM surge para quebrar essa barreira, proporcionando uma experiência ágil, acessível, visual e produtiva na ponta dos dedos.

---

## 3. Problema a Ser Resolvido
1. **Dependência de Desktops/Laptops:** Estudantes em deslocamento, salas de aula sem laboratórios de informática disponíveis ou profissionais precisando esboçar rapidamente um esquema relacional encontram barreiras no acesso a ferramentas especializadas.
2. **Incompatibilidade Mobile dos Softwares Tradicionais:** Softwares clássicos como BRModelo (Java/Desktop), MySQL Workbench ou pgAdmin não possuem versões para dispositivos móveis ou apresentam interfaces inadequadas para telas touch screen.
3. **Complexidade Excessiva de Ferramentas Existentes:** Aplicativos de diagramação genéricos (ex.: Draw.io, Lucidchart) não aplicam regras de modelagem relacional (validação de chaves primárias, tipos de dados e cardinalidades), exigindo desenho puramente vetorial sem semântica de banco de dados.

---

## 4. Público-Alvo
- **Estudantes de Computação e Tecnologia:** Cursos técnicos, graduações em Ciência da Computação, Sistemas de Informação, Análise e Desenvolvimento de Sistemas (ADS) e áreas afins.
- **Professores e Instrutores:** Para demonstrações rápidas em aula e acompanhamento de exercícios de modelagem.
- **Entusiastas e Desenvolvedores de Software:** Profissionais que desejam rascunhar ou validar a estrutura de entidades e relacionamentos em qualquer lugar sem abrir uma IDE pesada de banco de dados.

---

## 5. Objetivo Principal
Desenvolver um Produto Mínimo Viável (MVP) mobile, local e autônomo, que permita ao usuário criar projetos de modelagem relacional, estruturar entidades com seus respectivos atributos (incluindo chaves primárias e tipos) e definir relacionamentos entre entidades através de um **Editor Visual Canvas 2D interativo**, armazenando tudo com persistência local confiável no dispositivo via SQLite.

---

## 6. Proposta de Valor
- **Acessibilidade e Portabilidade:** Crie e consulte modelos de dados onde você estiver, sem necessidade de computador.
- **Experiência Visual Interativa (Canvas 2D):** Construa diagramas relacionais diretamente no canvas com arrastar-e-soltar, zoom/pan e conexões visuais por linhas, similar a ferramentas modernas como Figma e Obsidian.
- **Foco Semântico em Bancos de Dados:** Diferente de ferramentas genéricas de desenho, os formulários e visualizações compreendem conceitos como chaves primárias (`PK`), obrigatoriedade (`NOT NULL`), tipos de dados e cardinalidades.
- **Simplicidade e Agilidade:** Interface móvel otimizada para inserções rápidas, listas intuitivas e confirmações claras.
- **Privacidade Total e Funcionamento Offline:** Nenhum dado sai do dispositivo; não requer conexão com a internet, login ou servidores externos.

---

## 7. Escopo Incluído no MVP
O escopo do MVP contempla as seguintes capacidades fundamentais:
1. **Gestão de Projetos:**
   - Criação de novo projeto de modelagem com nome obrigatório.
   - Listagem ordenada dos projetos existentes com data de criação e última atualização.
   - Abertura de projeto existente no editor visual.
   - Exclusão de projeto com modal de confirmação explícita.
2. **Editor Visual Canvas 2D (Experiência Principal):**
   - Área de trabalho interativa 2D com grade de referência visual estilo Figma.
   - Arrastar entidades livremente com o toque (drag-and-drop a 60 fps).
   - Navegação por deslocamento (pan) com 1 dedo pelo fundo da área de trabalho.
   - Aproximação e afastamento (zoom via botões e pinch-to-zoom multi-toque).
   - Criação de entidades diretamente no canvas (botão na barra ou duplo toque no fundo).
   - Enquadramento automático do diagrama na tela (*fit-to-view*).
   - Alternância rápida para visão auxiliar em lista/tabelas.
3. **Modelagem de Entidades:**
   - Cartões visuais no canvas apresentando nome, contagem de campos, atributos, tipos e badges de PK e NOT NULL.
   - Criação e edição do nome da entidade com unicidade por projeto.
   - Exclusão de entidade com confirmação e remoção em cascata de atributos e ligações.
4. **Modelagem de Atributos:**
   - Adição, edição e remoção de atributos a partir do canvas ou da tela de detalhes da entidade.
   - Suporte a tipos relacionais (`INTEGER`, `VARCHAR`, `TEXT`, `REAL`, `DECIMAL`, `BOOLEAN`, `DATE`, `DATETIME`).
   - Indicador de Chave Primária (`[PK]`) e obrigatoriedade (`[NOT NULL] / [NN]`).
5. **Modelagem de Relacionamentos:**
   - Conexão visual guiada no canvas: Ativar modo -> Toque na Origem -> Toque no Destino -> Seleção de Cardinalidade.
   - Representação por linhas visíveis interativas com chips centrais indicando a cardinalidade (`1:1`, `1:N`, `N:N`).
   - Linhas que acompanham o movimento das entidades em tempo real.
   - Validações: proibição de autorrelacionamento no MVP e impedimento de ligações entre projetos diferentes.
   - Edição de cardinalidade e exclusão com confirmação.
6. **Persistência Local e Resiliência:**
   - Armazenamento em banco de dados local SQLite (`expo-sqlite`) com migrações versionadas.
   - Persistência das coordenadas de posição (X, Y) de cada entidade e do estado de viewport (zoom, panX, panY).
   - Recuperação íntegra dos dados após fechar e reabrir o aplicativo.

---

## 8. Escopo Explicitamente Excluído do MVP
Para manter a viabilidade, estabilidade e foco nas boas práticas de engenharia de software nesta fase inicial, **NÃO** fazem parte do MVP:
- Cadastro de usuários, perfis, senhas ou qualquer mecanismo de autenticação.
- Backend remoto, APIs REST/GraphQL e comunicação de rede.
- Sincronização em nuvem (Cloud Sync / Google Drive / Dropbox).
- Colaboração em tempo real ou compartilhamento entre usuários.
- Exportação direta para SGBDs específicos (PostgreSQL, MySQL, Oracle, etc.).
- Geração automática de scripts DDL (`CREATE TABLE`, etc.).
- Notação Crow's foot (pé de galinha) para cardinalidades nos relacionamentos visuais.
- Painéis administrativos ou telemetria em nuvem.

---

## 9. Restrições e Premissas

### 9.1. Restrições Técnicas
- **Plataforma Mobile:** Aplicação construída utilizando React Native com ecossistema Expo (SDK 58).
- **Linguagem:** JavaScript (ES6+), mantendo compatibilidade simples sem compilação TypeScript no MVP.
- **Banco de Dados Local:** SQLite via biblioteca oficial (`expo-sqlite`), executando estritamente no dispositivo.
- **Sem Backend Remoto:** O aplicativo deve operar 100% offline.
- **Controle de Versão:** Git com repositório remoto no GitHub.

### 9.2. Premissas
- O usuário possui um dispositivo móvel Android ou iOS compatível com o Expo Go ou build nativa do Expo.
- O dispositivo possui espaço de armazenamento local suficiente para o banco SQLite do app.
- As regras de integridade referencial (como integridade composta e cascade) são aplicadas no SQLite e validadas nos serviços.

---

## 10. Resultado Esperado
Ao término do desenvolvimento do MVP, o BRMM fornecerá uma aplicação móvel estável, modular, testada com suíte automatizada e com experiência de Editor Visual Canvas 2D interativo, pronta para ser demonstrada como produto funcional e peça de portfólio de engenharia de software.

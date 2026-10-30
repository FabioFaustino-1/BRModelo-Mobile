# Project Charter — BRMM (BRModelo Mobile)

## 1. Informações do Projeto
- **Título do Projeto:** BRMM — BRModelo Mobile
- **Versão:** 1.0 (MVP)
- **Status:** Planejamento e Estruturação Inicial
- **Autor/Responsável:** Equipe de Desenvolvimento BRMM
- **Repositório:** `BRModelo-Mobile`

---

## 2. Descrição e Contexto
O **BRMM (BRModelo Mobile)** é um aplicativo móvel concebido para permitir a criação, edição e visualização de modelos relacionais de bancos de dados diretamente em smartphones e tablets. Inspirado no consagrado software desktop **BRModelo**, ferramenta amplamente adotada em cursos técnicos, graduações e por profissionais no Brasil para o ensino de modelagem conceitual e lógica, o BRMM adapta essa experiência para o ecossistema móvel.

Historicamente, o aprendizado e a prática de modelagem de dados estiveram restritos a computadores de mesa ou notebooks devido à dependência de softwares legados para desktop. O BRMM surge para quebrar essa barreira, proporcionando uma experiência ágil, acessível e produtiva na ponta dos dedos.

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
Desenvolver um Produto Mínimo Viável (MVP) mobile, local e autônomo, que permita ao usuário criar projetos de modelagem relacional, estruturar entidades com seus respectivos atributos (incluindo chaves primárias e tipos) e definir relacionamentos entre entidades, armazenando tudo com persistência local confiável no dispositivo.

---

## 6. Proposta de Valor
- **Acessibilidade e Portabilidade:** Crie e consulte modelos de dados onde você estiver, sem necessidade de computador.
- **Foco Semântico em Bancos de Dados:** Diferente de ferramentas genéricas de desenho, os formulários e visualizações compreendem conceitos como chaves primárias (`PK`), obrigatoriedade (`NOT NULL`), tipos de dados e cardinalidades.
- **Simplicidade e Agilidade:** Interface móvel otimizada para inserções rápidas, listas intuitivas e confirmações claras.
- **Privacidade Total e Funcionamento Offline:** Nenhum dado sai do dispositivo; não requer conexão com a internet, login ou servidores externos.

---

## 7. Escopo Incluído no MVP
O escopo do MVP está focado estritamente nas seguintes capacidades fundamentais:
1. **Gestão de Projetos:**
   - Criação de novo projeto de modelagem com nome obrigatório.
   - Listagem ordenada dos projetos existentes com data de criação e última atualização.
   - Abertura de projeto existente para consulta e edição.
   - Exclusão de projeto com modal de confirmação explícita.
2. **Modelagem de Entidades:**
   - Criação e listagem de entidades vinculadas ao projeto ativo.
   - Edição do nome da entidade e exclusão com confirmação.
3. **Modelagem de Atributos:**
   - Adição de atributos a uma entidade selecionada.
   - Configuração do nome do atributo, tipo de dado (ex.: `INTEGER`, `VARCHAR`, `TEXT`, `BOOLEAN`, `DATE`, `DECIMAL`), indicador de Chave Primária (`PK`) e indicador de obrigatoriedade (`NOT NULL`).
   - Edição e remoção de atributos.
4. **Modelagem de Relacionamentos:**
   - Definição de relacionamento entre duas entidades existentes do mesmo projeto (origem e destino).
   - Definição do tipo de cardinalidade (ex.: `1:1`, `1:N`, `N:N`).
   - Listagem e remoção de relacionamentos existentes.
5. **Persistência Local e Resiliência:**
   - Armazenamento em banco de dados local SQLite.
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
- Editor visual gráfico livre com canvas 2D infinito e arrastar-e-soltar (*drag-and-drop* livre). A visualização do MVP será estruturada via cartões, listas e fluxos adaptados ao toque.
- Painéis administrativos ou telemetria em nuvem.

---

## 9. Restrições e Premissas

### 9.1. Restrições Técnicas
- **Plataforma Mobile:** Aplicação construída utilizando React Native com ecossistema Expo.
- **Linguagem:** JavaScript (ES6+), mantendo compatibilidade simples sem compilação TypeScript no MVP.
- **Banco de Dados Local:** SQLite via biblioteca oficial (`expo-sqlite`), executando estritamente no dispositivo.
- **Sem Backend Remoto:** O aplicativo deve operar 100% offline.
- **Controle de Versão:** Git com repositório remoto no GitHub.

### 9.2. Premissas
- O usuário possui um dispositivo móvel Android ou iOS compatível com o Expo Go ou build nativa do Expo.
- O dispositivo possui espaço de armazenamento local suficiente para o banco SQLite do app (requisito insignificante para modelos relacionais típicos).
- As regras de integridade referencial (como não permitir relacionamento com entidade inexistente) serão aplicadas na camada de serviço/banco local.

---

## 10. Resultado Esperado
Ao término do desenvolvimento do MVP, o BRMM fornecerá uma aplicação móvel estável, modular, testada unitariamente e pronta para ser demonstrada como produto funcional e peça de portfólio de engenharia de software. O repositório conterá documentação técnica completa, pipeline de CI/CD automatizado via GitHub Actions e base de código limpa para extensões futuras.

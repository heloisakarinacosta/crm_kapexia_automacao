# Guia de Teste Local do MVP1 KapexiaCore CRM (Sem Docker)

Este guia detalha os passos para configurar e testar o backend e o frontend do MVP1 do KapexiaCore CRM no seu ambiente local, sem utilizar Docker. O objetivo é validar a tecnologia base, a interface inicial e a interação com o banco de dados.

## Pré-requisitos Essenciais:

1.  **Node.js e npm/yarn**: Instalado no seu sistema (versão 18.x ou superior para Node.js é recomendada).
2.  **MariaDB**: Uma instância do MariaDB deve estar instalada e em execução localmente ou acessível pela sua máquina.
3.  **Git** (Opcional): Se preferir clonar o repositório em vez de usar o ficheiro zip.
4.  **Ficheiro Zip do Projeto**: O ficheiro `crm_kapexia_mvp1.zip` que contém o código-fonte.
5.  **Cliente de API (Opcional)**: Ferramenta como Postman ou Insomnia para testar diretamente os endpoints do backend.

## Passos Detalhados:

### Parte 1: Configuração do Banco de Dados MariaDB

1.  **Aceder ao MariaDB**:
    *   Utilize o cliente de linha de comando do MariaDB ou uma ferramenta gráfica (DBeaver, HeidiSQL, phpMyAdmin) para se conectar à sua instância MariaDB.

2.  **Criar a Base de Dados**:
    *   Execute o seguinte comando SQL para criar a base de dados para a aplicação:
        ```sql
        CREATE DATABASE kapexia_crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```

3.  **Criar um Utilizador Dedicado (Recomendado)**:
    *   Crie um utilizador específico para a aplicação aceder à base de dados. Substitua `sua_senha_segura` por uma senha forte.
        ```sql
        CREATE USER 'kapexia_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
        GRANT ALL PRIVILEGES ON kapexia_crm_db.* TO 'kapexia_user'@'localhost';
        FLUSH PRIVILEGES;
        ```

4.  **Executar o Script de Inicialização do Banco de Dados**:
    *   Extraia o ficheiro `crm_kapexia_mvp1.zip`.
    *   Localize o script SQL em `crm_kapexia/config/mariadb/init.sql`.
    *   Execute o conteúdo deste script na base de dados `kapexia_crm_db` que acabou de criar. Este script criará a tabela `admins` e inserirá o utilizador administrador padrão (`admin`/`admin`, com a senha já hasheada).

### Parte 2: Configuração e Execução do Backend (Node.js/Express)

1.  **Navegar para o Diretório do Backend**:
    *   Abra o seu terminal e navegue até ao diretório do backend dentro da pasta extraída:
        ```bash
        cd caminho/para/crm_kapexia/backend
        ```

2.  **Criar o Ficheiro de Ambiente (`.env`)**:
    *   No diretório `crm_kapexia/backend`, crie um ficheiro chamado `.env`.
    *   Copie e cole o seguinte conteúdo, ajustando os valores de `DB_USER`, `DB_PASSWORD` e `DB_NAME` conforme a sua configuração do MariaDB. Para `JWT_SECRET`, insira uma string aleatória e segura.
        ```env
        DB_HOST=localhost
        DB_USER=kapexia_user
        DB_PASSWORD=sua_senha_segura
        DB_NAME=kapexia_crm_db
        DB_PORT=3306

        # Para testes locais sem SSL configurado no MariaDB, pode deixar os campos DB_SSL vazios.
        # Se o seu MariaDB local estiver configurado com SSL, precisará de fornecer os caminhos para os certificados.
        DB_SSL_CA=
        DB_SSL_KEY=
        DB_SSL_CERT=

        JWT_SECRET=seu_super_segredo_jwt_aqui_altere_isto
        PORT=3001
        ```

3.  **Instalar Dependências do Backend**:
    *   No terminal, ainda no diretório `crm_kapexia/backend`, execute:
        ```bash
        npm install
        ```
        (Ou `yarn install` se utilizar Yarn.)

4.  **Iniciar o Servidor Backend**:
    *   Execute o comando para iniciar o servidor:
        ```bash
        npm start
        ```
        (Ou `yarn start`.)
    *   Deverá ver uma mensagem a confirmar que o servidor backend está em execução na porta 3001 (ou na porta que configurou no `.env`).

### Parte 3: Configuração e Execução do Frontend (Next.js)

1.  **Navegar para o Diretório do Frontend**:
    *   Abra um novo terminal (ou use o mesmo) e navegue para o diretório do frontend:
        ```bash
        cd caminho/para/crm_kapexia/frontend
        ```

2.  **Verificar/Criar `package.json` e Instalar Dependências**:
    *   **Importante**: O projeto frontend (`crm_kapexia/frontend`) deve ser um projeto Next.js funcional. Verifique se existe um ficheiro `package.json` na raiz deste diretório.
    *   Se não existir, ou se o projeto não estiver completo, poderá precisar de inicializar um novo projeto Next.js e copiar os componentes e páginas do MVP1 para ele.
        ```bash
        # Se precisar de criar um projeto Next.js base (exemplo):
        # npx create-next-app@latest meu-crm-frontend --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
        # Depois copie as pastas src/app, src/components, public do zip para dentro de meu-crm-frontend
        ```
    *   Assumindo que a estrutura do projeto Next.js está correta e o `package.json` está presente, instale as dependências:
        ```bash
        npm install
        ```
        (Ou `yarn install`.)

3.  **Criar o Ficheiro de Ambiente Local (`.env.local`)**:
    *   No diretório `crm_kapexia/frontend`, crie um ficheiro chamado `.env.local`.
    *   Adicione a seguinte linha para que o frontend saiba onde encontrar o backend API:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:3001/api
        ```

4.  **Iniciar o Servidor de Desenvolvimento do Frontend**:
    *   Execute:
        ```bash
        npm run dev
        ```
        (Ou `yarn dev`.)
    *   O servidor de desenvolvimento Next.js deverá iniciar, geralmente na porta 3000.

### Parte 4: Testar a Aplicação

1.  **Aceder à Página de Login**:
    *   Abra o seu navegador e navegue para: `http://localhost:3000/login/admin/login`

2.  **Testar o Login do Administrador**:
    *   Utilize as seguintes credenciais:
        *   **Utilizador**: `admin`
        *   **Senha**: `admin`
    *   Se o login for bem-sucedido, deverá ser redirecionado para o painel de administração (`/admin/dashboard`).

3.  **Explorar o Painel de Administração (MVP1)**:
    *   Verifique a estrutura básica do painel.
    *   As funcionalidades listadas (gestão de planos, IA, templates de e-mail, integrações) podem ser placeholders visuais ou formulários muito simples nesta fase. O objetivo é validar a navegação e a estrutura da interface.

## O que Validar neste MVP1:

*   **Conexão Backend-Banco de Dados**: O backend consegue conectar-se ao MariaDB e autenticar o utilizador.
*   **Autenticação**: O fluxo de login do administrador funciona corretamente (frontend e backend).
*   **Interface de Login**: A página de login é apresentada corretamente.
*   **Estrutura do Painel Admin**: O layout básico do painel de administração é carregado após o login.
*   **Tecnologias Base**: Confirmação de que Node.js/Express para o backend e Next.js para o frontend estão a funcionar no seu ambiente.

## Troubleshooting Básico:

*   **Erros de CORS no Frontend**: Se o backend estiver a correr e o frontend não conseguir comunicar, verifique a consola do navegador por erros de CORS. O backend Express já deve ter uma configuração básica de CORS, mas pode precisar de ajustes.
*   **Falhas ao Iniciar Servidores**: Verifique os logs no terminal para mensagens de erro específicas (portas em uso, variáveis de ambiente em falta, erros de código).
*   **Problemas com o Banco de Dados**: Certifique-se de que o serviço MariaDB está em execução e que as credenciais e nome da base de dados no ficheiro `.env` do backend estão corretos.

Se encontrar problemas ou tiver dúvidas, por favor, anote os passos para reproduzir o erro e quaisquer mensagens de erro detalhadas.


# ChronoRun - Backend

###### (Front-End do projeto: https://github.com/miquelven/games_in_a_game)

&nbsp;

Bem-vindo ao repositório do backend do projeto ChronoRun! Aqui, nos dedicamos a fornecer a infraestrutura robusta e eficiente que sustenta nossa emocionante plataforma de desafios de jogos. Se você é um entusiasta de backend que busca contribuir para uma experiência de jogo inovadora, você está no lugar certo.

&nbsp;

## Sobre o Projeto

O backend do ChronoRun é a espinha dorsal que suporta a competição e a diversão em nossa plataforma. Desenvolvido para oferecer desempenho excepcional e confiabilidade, nosso backend permite a realização de desafios cronometrados e a gestão eficaz de rankings.

&nbsp;

## Tecnologias Utilizadas

Utilizamos uma variedade de tecnologias de ponta para garantir um backend eficiente, seguro e escalável:

- **Runtime:** ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
- **Framework:** ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)
- **Banco de Dados:** ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)
- **Autenticação:** JWT (JsonWebToken), Google Auth
- **Segurança:** Helmet, BCrypt
- **Utilitários:** Nodemailer (Envio de e-mails), Dotenv

&nbsp;

## Instalação e Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v24.x recomendado)
- [MySQL](https://www.mysql.com/)

### Passo a passo

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/game_in_game_api.git
    cd game_in_game_api
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:

    ```bash
    cp .env.example .env
    ```

    Edite o arquivo `.env` com suas configurações locais:

    ```env
    PORT=3000
    SECRET_HOST=localhost
    SECRET_USER=root
    SECRET_DBPASSWORD=sua_senha_mysql
    SECRET_DB=nome_do_banco
    SECRET_EMAIL=seu_email@exemplo.com
    SECRET_PASSWORD=senha_app_email
    JWT_SECRET=seu_segredo_jwt
    ```

4.  **Banco de Dados:**

    Certifique-se de que o serviço MySQL esteja rodando e que o banco de dados especificado em `SECRET_DB` exista. As tabelas serão gerenciadas conforme a implementação do código (verifique `src/config/database.js` ou scripts de migração se houver).

&nbsp;

## Executando o Projeto

Para iniciar o servidor em modo de desenvolvimento (com hot-reload via nodemon):

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000` (ou na porta definida no `.env`).

&nbsp;

## Rotas da API

### Autenticação (`/`)

| Método | Rota              | Descrição                          |
| :----- | :---------------- | :--------------------------------- |
| POST   | `/register`       | Registrar um novo usuário          |
| POST   | `/login`          | Login de usuário (retorna JWT)     |
| POST   | `/login/google`   | Login via Google                   |
| POST   | `/reset-password` | Redefinição de senha               |
| POST   | `/togglepassword` | Alternar visibilidade de senha (?) |
| POST   | `/logout`         | Logout do usuário                  |

### Pontuação (`/` e `/api`)

| Método | Rota              | Descrição                                 |
| :----- | :---------------- | :---------------------------------------- |
| POST   | `/update-score`   | Atualizar pontuação do usuário            |
| GET    | `/api/scores`     | Listar pontuações (histórico do usuário?) |
| GET    | `/api/top-scores` | Listar ranking (top scores)               |

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const temporaryTokens = {};

// Configuração do banco de dados
const db = mysql.createConnection({
  host: process.env.SECRET_HOST,
  user: process.env.SECRET_USER,
  password: process.env.SECRET_DBPASSWORD,
  database: process.env.SECRET_DB,
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conexão bem-sucedida ao banco de dados MySQL");
  }
});

// Rotas
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Hash da senha usando bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // SQL para inserir usuário no banco de dados
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  const values = [username, email, hashedPassword];

  // Executa a query usando a variável 'db' ao invés de 'connection'
  db.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Erro ao registrar usuário." });
    } else {
      const token = jwt.sign(
        { id: results.insertId, email },
        "jsdfnkjouittms",
        { expiresIn: "1h" }
      );
      const name = username;

      res.status(200).json({
        success: true,
        message: "Usuário registrado com sucesso.",
        name,
        token,
      });
    }
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário no banco de dados
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Erro ao fazer login:", err);
          res.status(500).json({ success: false, message: "Erro interno" });
        } else if (results.length > 0) {
          const user = results[0];
          const match = await bcrypt.compare(password, user.password);

          if (match) {
            // Gerar token de autenticação
            const token = jwt.sign(
              { id: user.id, email: user.email },
              "jsdfnkjouittms",
              {
                expiresIn: "1h",
              }
            );

            res.status(200).json({ success: true, token });
          } else {
            res
              .status(401)
              .json({ success: false, message: "Credenciais inválidas" });
          }
        } else {
          res
            .status(404)
            .json({ success: false, message: "Usuário não encontrado" });
        }
      }
    );
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Geração do token de redefinição de senha
    const token = jwt.sign({ email }, "asdfnlsklpo", { expiresIn: "1h" });

    temporaryTokens[email] = token;

    // Lógica para enviar e-mail com o link contendo o token
    const resetLink = `http://localhost:5173/resetpassword/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SECRET_EMAIL,
        pass: process.env.SECRET_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SECRET_EMAIL,
      to: email,
      subject: "Recuperação de Senha",
      text: `Clique no link para redefinir sua senha: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar e-mail:", error);
        res
          .status(500)
          .json({ success: false, message: "Erro ao enviar e-mail" });
      } else {
        console.log("E-mail enviado:", info.response);
        res
          .status(200)
          .json({ success: true, message: "E-mail enviado com sucesso" });
      }
    });
  } catch (error) {
    console.error("Erro na recuperação de senha:", error);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

app.post("/togglepassword", async (req, res) => {
  try {
    const { token, password } = req.body;
    const email = Object.keys(temporaryTokens)[0];
    const tokenValue = Object.values(temporaryTokens)[0];
    if (!token) {
      console.log("Token ausente:", token);
      return res.status(400).json({ status: 400, message: "Token ausente" });
    }
    console.log("password: " + password);
    // Lógica para atualizar a senha no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);
    // SQL para atualizar a senha do usuário
    const updateSql = "UPDATE users SET password = ? WHERE email = ?";
    const updateValues = [hashedPassword, email];
    db.query(updateSql, updateValues, (error, results, fields) => {
      if (error) {
        console.error("Erro ao atualizar a senha:", error);
        return res.status(500).json({ status: 500, message: "Erro interno" });
      }
      if (results) {
        console.log("Result: " + JSON.stringify(results));
      }
      // Remova o token temporário após a atualização da senha
      delete temporaryTokens[0];
      res
        .status(200)
        .json({ status: 200, message: "Senha alterada com sucesso" });
    });
  } catch (error) {
    console.error("Erro durante a alteração da senha:", error);
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

const tokenBlacklist = new Set();

// Rota de Logout
app.post("/logout", (req, res) => {
  try {
    const { session_token } = req.body;

    // Verifica se o token está na lista negra
    if (tokenBlacklist.has(session_token)) {
      res.status(401).json({ success: false, message: "Token inválido." });
    } else {
      // Adiciona o token à lista negra (revoga o token)
      tokenBlacklist.add(session_token);
      res.status(200).json({ success: true, message: "Logout bem-sucedido." });
    }
  } catch (error) {
    console.error("Erro durante o logout:", error);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ... Código anterior do backend ...
app.post("/update-score", async (req, res) => {
  try {
    const { email, newScore } = req.body;

    // Busque o ID do usuário usando o email
    const getUserIdSql = "SELECT id FROM users WHERE email = ?";
    const getUserIdValues = [email];

    db.query(getUserIdSql, getUserIdValues, (getIdError, getIdResults) => {
      if (getIdError) {
        console.error("Erro ao obter o ID do usuário:", getIdError);
        return res.status(500).json({ status: 500, message: "Erro interno" });
      }

      const userId = getIdResults[0].id;

      // Verifique se há scores existentes para o usuário
      const getTopScoresSql =
        "SELECT score FROM user_scores WHERE user_id = ? ORDER BY score DESC LIMIT 10";
      const getTopScoresValues = [userId];

      db.query(
        getTopScoresSql,
        getTopScoresValues,
        (getScoresError, getScoresResults) => {
          if (getScoresError) {
            console.error("Erro ao obter os melhores scores:", getScoresError);
            return res
              .status(500)
              .json({ status: 500, message: "Erro interno" });
          }

          const topScores = getScoresResults.map((row) => row.score);

          // Verifique se o novo score está entre os 10 melhores
          if (newScore >= Math.min(...topScores) || topScores.length === 0) {
            // Adicione o novo score à tabela
            const addScoreSql =
              "INSERT INTO user_scores (user_id, score) VALUES (?, ?)";
            const addScoreValues = [userId, newScore];

            db.query(addScoreSql, addScoreValues, (addError, addResults) => {
              if (addError) {
                console.error("Erro ao adicionar o novo score:", addError);
                return res
                  .status(500)
                  .json({ status: 500, message: "Erro interno" });
              }

              res
                .status(200)
                .json({ status: 200, message: "Score atualizado com sucesso" });
            });
          } else {
            res
              .status(200)
              .json({ status: 200, message: "Score não é um dos 10 melhores" });
          }
        }
      );
    });
  } catch (error) {
    console.error("Erro durante a atualização do score:", error);
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

// ... Outros imports e configurações ...

app.get("/api/scores", async (req, res) => {
  try {
    const { email } = req.query;

    // Busque o ID do usuário usando o email
    const getUserIdSql = "SELECT id FROM users WHERE email = ?";
    const getUserIdValues = [email];

    db.query(getUserIdSql, getUserIdValues, (getIdError, getIdResults) => {
      if (getIdError) {
        console.error("Erro ao obter o ID do usuário:", getIdError);
        return res.status(500).json({ status: 500, message: "Erro interno" });
      }

      const userId = getIdResults[0].id;

      // Busque os scores do usuário
      const getUserScoresSql =
        "SELECT score FROM user_scores WHERE user_id = ?";
      const getUserScoresValues = [userId];

      db.query(
        getUserScoresSql,
        getUserScoresValues,
        (getScoresError, getScoresResults) => {
          if (getScoresError) {
            console.error(
              "Erro ao obter os scores do usuário:",
              getScoresError
            );
            return res
              .status(500)
              .json({ status: 500, message: "Erro interno" });
          }

          const userScores = getScoresResults.map((row) => row.score);

          res.status(200).json({ status: 200, userScores });
        }
      );
    });
  } catch (error) {
    console.error("Erro ao obter scores do usuário:", error);
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

// Rota para obter os melhores scores de todos os usuários
app.get("/api/top-scores", async (req, res) => {
  try {
    // Consulta os 10 melhores scores de todos os usuários
    const getTopScoresSql =
      "SELECT u.username, us.score FROM users u JOIN user_scores us ON u.id = us.user_id ORDER BY us.score DESC LIMIT 10";

    db.query(getTopScoresSql, (getTopScoresError, getTopScoresResults) => {
      if (getTopScoresError) {
        console.error("Erro ao obter os melhores scores:", getTopScoresError);
        return res.status(500).json({ status: 500, message: "Erro interno" });
      }

      const topScores = getTopScoresResults.map((row) => ({
        name: row.username,
        score: row.score,
      }));

      res.status(200).json({ status: 200, topScores });
    });
  } catch (error) {
    console.error("Erro ao obter os melhores scores:", error);
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

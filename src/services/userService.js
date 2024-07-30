import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getConnection, releaseConnection } from "../utils/dbHelper.js";

const TEMPORARY_TOKENS = {};

export const registerUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  const values = [username, email, hashedPassword];

  try {
    const connection = await getConnection();
    try {
      return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results) => {
          releaseConnection(connection);
          if (error)
            return reject({
              status: 500,
              message: "Erro ao registrar usuário.",
            });

          const token = jwt.sign(
            { id: results.insertId, email },
            "jsdfnkjouittms",
            { expiresIn: "1h" }
          );
          resolve({
            success: true,
            message: "Usuário registrado com sucesso.",
            name: username,
            token,
          });
        });
      });
    } finally {
      releaseConnection(connection);
    }
  } catch (err) {
    console.error("Erro ao obter conexão:", err);
    throw { status: 500, message: "Erro interno" };
  }
};

export const authenticateUser = async (email, password) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  const values = [email];

  try {
    const connection = await getConnection();
    try {
      return new Promise(async (resolve, reject) => {
        connection.query(sql, values, async (queryError, results) => {
          releaseConnection(connection);
          if (queryError)
            return reject({ status: 500, message: "Erro interno" });
          if (results.length === 0)
            return reject({ status: 404, message: "Usuário não encontrado" });

          const user = results[0];
          const match = await bcrypt.compare(password, user.password);
          if (!match)
            return reject({ status: 401, message: "Credenciais inválidas" });

          const token = jwt.sign(
            { id: user.id, email: user.email },
            "jsdfnkjouittms",
            { expiresIn: "1h" }
          );
          resolve({ success: true, token });
        });
      });
    } finally {
      releaseConnection(connection);
    }
  } catch (err) {
    console.error("Erro ao obter conexão:", err);
    throw { status: 500, message: "Erro interno" };
  }
};

export const sendResetPasswordEmail = async (email) => {
  const token = jwt.sign({ email }, "asdfnlsklpo", { expiresIn: "1h" });
  TEMPORARY_TOKENS[email] = token;

  const resetLink = `https://gametest.com.br/resetpassword/${token}`;
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

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (mailError, info) => {
      if (mailError)
        return reject({ status: 500, message: "Erro ao enviar e-mail" });
      resolve({ success: true, message: "E-mail enviado com sucesso" });
    });
  });
};

export const updatePassword = async (token, password) => {
  const email = Object.keys(TEMPORARY_TOKENS)[0];
  const tokenValue = Object.values(TEMPORARY_TOKENS)[0];

  if (!token || token !== tokenValue)
    return { status: 400, message: "Token inválido" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "UPDATE users SET password = ? WHERE email = ?";
  const updateValues = [hashedPassword, email];

  try {
    const connection = await getConnection();
    try {
      return new Promise((resolve, reject) => {
        connection.query(sql, updateValues, (error) => {
          releaseConnection(connection);
          if (error) return reject({ status: 500, message: "Erro interno" });

          delete TEMPORARY_TOKENS[email];
          resolve({ status: 200, message: "Senha alterada com sucesso" });
        });
      });
    } finally {
      releaseConnection(connection);
    }
  } catch (err) {
    console.error("Erro ao obter conexão:", err);
    throw { status: 500, message: "Erro interno" };
  }
};

export const logout = (sessionToken) => {
  const tokenBlacklist = new Set();

  if (tokenBlacklist.has(sessionToken)) {
    return { status: 401, message: "Token inválido." };
  } else {
    tokenBlacklist.add(sessionToken);
    return { status: 200, message: "Logout bem-sucedido." };
  }
};

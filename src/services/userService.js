import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getConnection, releaseConnection } from "../utils/dbHelper.js";

// Em memória (Ideal seria Redis ou Banco de Dados)
const TEMPORARY_TOKENS = {};
const TOKEN_BLACKLIST = new Set();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change";

export const registerUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  const values = [username, email, hashedPassword];

  const connection = await getConnection();
  try {
    const [result] = await connection.promise().query(sql, values);

    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      success: true,
      message: "Usuário registrado com sucesso.",
      name: username,
      token,
    };
  } catch (error) {
    console.error("Erro no registro:", error);
    throw { status: 500, message: "Erro ao registrar usuário." };
  } finally {
    releaseConnection(connection);
  }
};

export const authenticateUser = async (email, password) => {
  const sql = "SELECT * FROM users WHERE email = ?";

  const connection = await getConnection();
  try {
    const [results] = await connection.promise().query(sql, [email]);

    if (results.length === 0) {
      throw { status: 404, message: "Usuário não encontrado" };
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw { status: 401, message: "Credenciais inválidas" };
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return { success: true, token, username: user.username };
  } catch (error) {
    if (error.status) throw error;
    console.error("Erro na autenticação:", error);
    throw { status: 500, message: "Erro interno" };
  } finally {
    releaseConnection(connection);
  }
};

export const sendResetPasswordEmail = async (email) => {
  // Gera token para reset
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

  // Armazena token associado ao email
  // Nota: Isso sobrescreve tokens anteriores para o mesmo email
  TEMPORARY_TOKENS[token] = email;

  // Limpeza básica (opcional): remover tokens expirados poderia ser feito aqui,
  // mas para simplicidade manteremos assim.

  const resetLink = `https://gametest.com.br/resetpassword/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SECRET_EMAIL,
      pass: process.env.SECRET_PASSWORD,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>
      <p style="color: #555; font-size: 16px;">Olá,</p>
      <p style="color: #555; font-size: 16px;">Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez essa solicitação, pode ignorar este e-mail.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Redefinir Senha</a>
      </div>
      <p style="color: #555; font-size: 14px;">Ou copie e cole o link abaixo no seu navegador:</p>
      <p style="color: #007bff; font-size: 14px; word-break: break-all;">${resetLink}</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">Este link expira em 1 hora.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SECRET_EMAIL,
    to: email,
    subject: "Recuperação de Senha",
    text: `Clique no link para redefinir sua senha: ${resetLink}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "E-mail enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw { status: 500, message: "Erro ao enviar e-mail" };
  }
};

export const updatePassword = async (token, password) => {
  // Verifica se o token existe na memória
  const email = TEMPORARY_TOKENS[token];

  if (!email) {
    throw { status: 400, message: "Token inválido ou expirado" };
  }

  // Verifica validade do token JWT
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    delete TEMPORARY_TOKENS[token];
    throw { status: 400, message: "Token inválido ou expirado" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "UPDATE users SET password = ? WHERE email = ?";

  const connection = await getConnection();
  try {
    await connection.promise().query(sql, [hashedPassword, email]);

    // Remove o token usado
    delete TEMPORARY_TOKENS[token];

    return { status: 200, message: "Senha alterada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    throw { status: 500, message: "Erro interno" };
  } finally {
    releaseConnection(connection);
  }
};

export const logout = (sessionToken) => {
  if (TOKEN_BLACKLIST.has(sessionToken)) {
    throw { status: 401, message: "Token já invalidado." };
  } else {
    TOKEN_BLACKLIST.add(sessionToken);
    // Em um sistema real, precisaríamos limpar tokens antigos do Set periodicamente
    return { status: 200, message: "Logout bem-sucedido." };
  }
};

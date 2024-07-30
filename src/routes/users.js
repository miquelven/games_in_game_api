import { Router } from "express";
import {
  registerUser,
  authenticateUser,
  sendResetPasswordEmail,
  updatePassword,
  logout,
} from "../services/userService.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser(username, email, password);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro no registro:", error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "Erro interno" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authenticateUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro no login:", error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "Erro interno" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendResetPasswordEmail(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro na recuperação de senha:", error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "Erro interno" });
  }
});

router.post("/togglepassword", async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await updatePassword(token, password);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Erro durante a alteração da senha:", error);
    res
      .status(error.status || 500)
      .json({
        status: error.status || 500,
        message: error.message || "Erro interno",
      });
  }
});

router.post("/logout", (req, res) => {
  try {
    const { session_token } = req.body;
    const result = logout(session_token);
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Erro durante o logout:", error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "Erro interno" });
  }
});

export default router;

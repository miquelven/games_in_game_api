import {
  registerUser,
  authenticateUser,
  sendResetPasswordEmail,
  updatePassword,
  logout,
} from "../services/userService.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authenticateUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await sendResetPasswordEmail(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const togglePassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await updatePassword(token, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const userLogout = (req, res, next) => {
  try {
    const { session_token } = req.body;
    const result = logout(session_token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

import { Router } from "express";
import {
  register,
  login,
  googleLogin,
  resetPassword,
  togglePassword,
  userLogout,
} from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login/google", googleLogin);
router.post("/reset-password", resetPassword);
router.post("/togglepassword", togglePassword);
router.post("/logout", userLogout);

export default router;

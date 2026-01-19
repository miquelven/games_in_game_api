import { Router } from "express";
import {
  register,
  login,
  resetPassword,
  togglePassword,
  userLogout,
} from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/togglepassword", togglePassword);
router.post("/logout", userLogout);

export default router;

import { Router } from "express";
import usersRouter from "./users.js";
import scoreRouter from "./score.js";

const router = Router();

router.use(scoreRouter);
router.use(usersRouter);

export default router;

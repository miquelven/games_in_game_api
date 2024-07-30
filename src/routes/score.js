import { Router } from "express";
import {
  updateScore,
  getUserScores,
  getTopScores,
} from "../services/scoreService.js";

const router = Router();

router.post("/update-score", async (req, res) => {
  try {
    const { email, newScore } = req.body;
    const result = await updateScore(email, newScore);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

router.get("/api/scores", async (req, res) => {
  try {
    const { email } = req.query;
    const result = await getUserScores(email);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

router.get("/api/top-scores", async (req, res) => {
  try {
    const result = await getTopScores();
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Erro interno" });
  }
});

export default router;

import { Router } from "express";
import {
  updateUserScore,
  listUserScores,
  listTopScores,
} from "../controllers/scoreController.js";

const router = Router();

router.post("/update-score", updateUserScore);
router.get("/api/scores", listUserScores);
router.get("/api/top-scores", listTopScores);

export default router;

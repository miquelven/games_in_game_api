import {
  updateScore,
  getUserScores,
  getTopScores,
} from "../services/scoreService.js";

export const updateUserScore = async (req, res, next) => {
  try {
    const { email, newScore } = req.body;
    const result = await updateScore(email, newScore);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listUserScores = async (req, res, next) => {
  try {
    const { email } = req.query;
    const result = await getUserScores(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listTopScores = async (req, res, next) => {
  try {
    const result = await getTopScores();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

import { getConnection, releaseConnection } from "../utils/dbHelper.js";

const getUserIdByEmail = async (email) => {
  const connection = await getConnection();
  try {
    const getUserIdSql = "SELECT id FROM users WHERE email = ?";
    const [results] = await connection.promise().query(getUserIdSql, [email]);

    if (results.length === 0) {
      throw { status: 404, message: "Usuário não encontrado" };
    }

    return results[0].id;
  } finally {
    releaseConnection(connection);
  }
};

const getTopScoresForUser = async (userId) => {
  const connection = await getConnection();
  try {
    const getTopScoresSql =
      "SELECT score FROM user_scores WHERE user_id = ? ORDER BY score DESC LIMIT 10";
    const [results] = await connection
      .promise()
      .query(getTopScoresSql, [userId]);

    return results.map((row) => row.score);
  } finally {
    releaseConnection(connection);
  }
};

const addScore = async (userId, newScore) => {
  const connection = await getConnection();
  try {
    const addScoreSql =
      "INSERT INTO user_scores (user_id, score) VALUES (?, ?)";
    await connection.promise().query(addScoreSql, [userId, newScore]);
  } finally {
    releaseConnection(connection);
  }
};

export const updateScore = async (email, newScore) => {
  try {
    const userId = await getUserIdByEmail(email);
    const topScores = await getTopScoresForUser(userId);

    if (newScore >= Math.min(...topScores) || topScores.length === 0) {
      await addScore(userId, newScore);
      return { status: 200, message: "Score atualizado com sucesso" };
    } else {
      return { status: 200, message: "Score não é um dos 10 melhores" };
    }
  } catch (error) {
    console.error("Erro durante a atualização do score:", error);
    throw error;
  }
};

export const getUserScores = async (email) => {
  try {
    const userId = await getUserIdByEmail(email);

    const connection = await getConnection();
    try {
      const getUserScoresSql =
        "SELECT score FROM user_scores WHERE user_id = ?";
      const [results] = await connection
        .promise()
        .query(getUserScoresSql, [userId]);

      return { status: 200, userScores: results.map((row) => row.score) };
    } finally {
      releaseConnection(connection);
    }
  } catch (error) {
    console.error("Erro ao obter pontuações do usuário:", error);
    throw error;
  }
};

export const getTopScores = async () => {
  try {
    const connection = await getConnection();
    try {
      const getTopScoresSql = `
        SELECT u.username, us.score
        FROM users u
        JOIN user_scores us ON u.id = us.user_id
        ORDER BY us.score DESC
        LIMIT 10
      `;
      const [results] = await connection.promise().query(getTopScoresSql);

      return {
        status: 200,
        topScores: results.map((row) => ({
          name: row.username,
          score: row.score,
        })),
      };
    } finally {
      releaseConnection(connection);
    }
  } catch (error) {
    console.error("Erro ao obter os melhores scores:", error);
    throw error;
  }
};

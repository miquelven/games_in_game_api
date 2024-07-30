import pool from "../config/database.js";

export const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Erro ao obter conexão do pool:", err);
        return reject(err);
      }
      resolve(connection);
    });
  });
};

export const releaseConnection = (connection) => {
  connection.release();
};

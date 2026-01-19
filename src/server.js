import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 3000;

app.use("/", router);

// Middleware de tratamento de erros deve vir por último
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

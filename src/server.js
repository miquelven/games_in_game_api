import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import router from "./routes/index.js";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", router);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

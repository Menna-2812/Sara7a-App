import express from "express";
import bootstrap from "./src/app.controller.js";
import { PORT } from "./config/config.service.js";
import chalk from "chalk";

const app = express();

await bootstrap(app, express);
app.listen(PORT, () => {
    console.log(chalk.bgGreen(`Connect to Server at Port: ${PORT}`));
});
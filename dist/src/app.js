"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const config_1 = __importDefault(require("./config"));
const auth_1 = __importDefault(require("./routers/auth"));
const api_1 = __importDefault(require("./routers/api"));
const logger_1 = __importDefault(require("./middlewares/logger"));
const db_1 = require("../db");
const app = express();
const port = config_1.default.port;
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// connect to database
db_1.pool.connect().then(() => {
    console.log(`Connected to PostgreSQL ${config_1.default.env} database`);
})
    .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
});
//configure middleware
app.use(logger_1.default);
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
}));
//Routes
app.use('/auth', auth_1.default);
app.use('/api', api_1.default);
app.get('/', (req, res) => {
    res.status(200).send("Welcome to my HNG task 2");
});
app.listen(port, () => {
    console.log(`${config_1.default.server_msg}: ${port}`);
});
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const env = process.env.NODE_ENV || 'development';
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, `../.${env}.env`)
});
exports.default = {
    env,
    port: process.env.PORT || 1999,
    server_msg: process.env.SERVER_LOG,
    hostname: process.env.HOSTNAME,
    db: {
        username: process.env.USERNAME,
        hostname: process.env.HOSTNAME,
        database: process.env.DATABASE_NAME,
        password: process.env.PASSWORD,
        port: process.env.DB_PORT,
    },
};
//# sourceMappingURL=config.js.map
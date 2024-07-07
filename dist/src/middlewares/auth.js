"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Handle admin authentication
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session) {
        return res.status(404).json({
            msg: "Unauthorized request. Access denied..."
        });
    }
    try {
        const user = req.session.userId;
        if (!user) {
            return res.status(401).json({
                error: {
                    msg: "Unauthorized request. Access denied..."
                }
            });
        }
        next();
    }
    catch (err) {
        res.status(500).json({
            error: {
                msg: "Access denied..."
            }
        });
    }
});
exports.default = userAuth;
//# sourceMappingURL=auth.js.map
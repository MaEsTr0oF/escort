"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController = __importStar(require("../controllers/profileController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Публичные маршруты
router.get('/', async (req, res) => {
    await profileController.getProfiles(req, res);
});
router.get('/:id', async (req, res) => {
    if (req.body && req.body.photos && Array.isArray(req.body.photos)) {
        req.body.photos = JSON.stringify(req.body.photos);
        console.log('Photos converted to JSON string:', req.body.photos);
    }
    // Также преобразуем services в JSON строку, если они приходят как массив
    if (req.body && req.body.services && Array.isArray(req.body.services)) {
        req.body.services = JSON.stringify(req.body.services);
        console.log('Services converted to JSON string:', req.body.services);
    }
    await profileController.getProfileById(req, res);
});
// Маршруты администратора (требуют аутентификации)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    await profileController.createProfile(req, res);
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    await profileController.updateProfile(req, res);
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    await profileController.deleteProfile(req, res);
});
router.patch('/:id/toggle-active', auth_1.authMiddleware, async (req, res) => {
    await profileController.toggleProfileActive(req, res);
});
router.patch('/:id/verify', auth_1.authMiddleware, async (req, res) => {
    await profileController.verifyProfile(req, res);
});
exports.default = router;

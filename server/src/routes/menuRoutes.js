import { Router } from "express";
import {getMenuOptions} from "../controllers/menuControllers.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

// Ruta para obtener datos del menú
router.get("/menu", authRequired, getMenuOptions);

export default router;
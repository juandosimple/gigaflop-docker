import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import usuariosRoutes from './routes/usuariosRoutes.js';
import menuRoutes from "./routes/menuRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import productosRoutes from './routes/productosRoutes.js'; // Importa las rutas de productos
import cotizacionRoutes from './routes/cotizacionRoutes.js';
import contactosRoutes from './routes/contactosRoutes.js';
import estadosRoutes from './routes/estadosRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import configuracionRoutes from './routes/configuracionRoutes.js';  



dotenv.config(); //Carga las variables antes de que se usen en cualquier parte del servidor

const app = express();

// Configurar CORS para permitir múltiples orígenes en desarrollo y lectura de env var
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3004,http://localhost:3001,http://localhost:8080')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);



// Use static array for allowed origins (cors library handles matching/set)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

//esto es para que el servidor pueda recibir cookies
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Security Middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet()); // Set secure HTTP headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api', limiter); // Apply rate limiting to API routes

app.use('/images', express.static('public/images'));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api", menuRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api", productosRoutes); // Usa las rutas de productos
app.use("/api/cotizaciones", cotizacionRoutes);
app.use("/api", contactosRoutes);
app.use('/api/estados', estadosRoutes);
app.use('/api', emailRoutes);
app.use("/api/configuracion", configuracionRoutes);


// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(' Error no capturado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
export default app;
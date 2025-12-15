
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_ONLINE_HOST || 'db',
  user: process.env.DB_ONLINE_USER || 'user',
  password: process.env.DB_ONLINE_PASSWORD || 'userpassword',
  database: process.env.DB_ONLINE_NAME || 'gigaflop_db',
  port: process.env.DB_ONLINE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function setup() {
  try {
    console.log('Creating table usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(255),
        apellido VARCHAR(255),
        rol VARCHAR(50) DEFAULT 'usuario',
        estado BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table usuarios created or already exists.');

    const adminUser = {
      usuario: 'gigaMasterMind',
      email: 'admin@gigaflop.com', // Added dummy email to satisfy UNIQUE constraint if needed, though user didn't specify one. I'll use a placeholder.
      password: 'AChocaLopantoSomela@212',
      nombre: 'Admin',
      apellido: 'System',
      rol: 'administrador'
    };

    // Check if user exists
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [adminUser.usuario]);
    
    if (rows.length === 0) {
        console.log('Creating admin user...');
        const hashedPassword = await bcrypt.hash('P@ssw0rd_Super_Segur@_2025!', 10);
        await pool.query(
            'INSERT INTO usuarios (usuario, email, password, nombre, apellido, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [adminUser.usuario, adminUser.email, hashedPassword, adminUser.nombre, adminUser.apellido, adminUser.rol, true]
        );
        console.log('Admin user created successfully.');
    } else {
        console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setup();

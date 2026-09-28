const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Carrega o .env da pasta principal do projeto
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool;
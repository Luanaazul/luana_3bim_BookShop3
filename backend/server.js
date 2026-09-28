const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

const livroRoutes = require('./routes/livroRoutes');
const lancamentoRoutes = require('./routes/lancamentoRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const generoRoutes = require('./routes/generoRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// Caminho absoluto da pasta de imagens
const PASTA_IMAGENS = path.resolve(__dirname, '../imagens');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibiliza as imagens
app.use('/imagens', express.static(PASTA_IMAGENS));

// Rotas
app.use('/livros', livroRoutes);
app.use('/lancamentos', lancamentoRoutes);
app.use('/generos', generoRoutes);
app.use('/cargos', cargoRoutes);
app.use('/pessoas', pessoaRoutes);
app.use('/clientes', clienteRoutes);
app.use('/funcionarios', funcionarioRoutes);

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        message: 'Servidor BookShop iniciado.',
        porta: PORT
    });
});

// Rota para páginas inexistentes
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor BookShop rodando na porta ${PORT}`);
});
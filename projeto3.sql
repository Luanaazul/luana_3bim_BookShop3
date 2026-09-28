-- ============================================================
-- BOOKSHOP - DW1 3º BIMESTRE 2026
-- BANCO DE DADOS
-- ============================================================


-- ============================================================
-- 1. LIMPEZA DO BANCO ANTIGO
-- ============================================================

DROP TABLE IF EXISTS lancamentos CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS livros CASCADE;
DROP TABLE IF EXISTS cargos CASCADE;
DROP TABLE IF EXISTS generos CASCADE;
DROP TABLE IF EXISTS pessoas CASCADE;


-- ============================================================
-- 2. TABELA DE GÊNEROS
-- RELACIONAMENTO: GENEROS 1:N LIVROS
-- ============================================================

CREATE TABLE generos (
    id_genero SERIAL PRIMARY KEY,
    nome_genero VARCHAR(50) NOT NULL UNIQUE
);


-- ============================================================
-- 3. TABELA DE PESSOAS
-- ============================================================

CREATE TABLE pessoas (
    cpf_pessoa VARCHAR(14) PRIMARY KEY,
    nome_pessoa VARCHAR(100) NOT NULL,
    data_nascimento_pessoa DATE NOT NULL,
    endereco_pessoa VARCHAR(200) NOT NULL,
    senha_pessoa VARCHAR(100) NOT NULL,
    email_pessoa VARCHAR(150) NOT NULL UNIQUE
);


-- ============================================================
-- 4. TABELA DE CARGOS
-- ============================================================

CREATE TABLE cargos (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(100) NOT NULL UNIQUE
);


-- ============================================================
-- 5. TABELA DE CLIENTES
-- RELACIONAMENTO: PESSOAS 1:1 CLIENTES
-- ============================================================

CREATE TABLE clientes (
    pessoa_cpf_pessoa VARCHAR(14) PRIMARY KEY,
    renda_cliente DECIMAL(10,2) NOT NULL
        CHECK (renda_cliente >= 0),
    data_cadastro_cliente DATE NOT NULL,

    FOREIGN KEY (pessoa_cpf_pessoa)
        REFERENCES pessoas(cpf_pessoa)
);


-- ============================================================
-- 6. TABELA DE FUNCIONÁRIOS
-- RELACIONAMENTOS:
-- PESSOAS 1:1 FUNCIONARIOS
-- CARGOS 1:N FUNCIONARIOS
-- ============================================================

CREATE TABLE funcionarios (
    pessoa_cpf_pessoa VARCHAR(14) PRIMARY KEY,

    salario_funcionario DECIMAL(10,2) NOT NULL
        CHECK (salario_funcionario >= 0),

    cargo_id_cargo INTEGER NOT NULL,

    porcentagem_comissao_funcionario DECIMAL(5,2) NOT NULL
        CHECK (
            porcentagem_comissao_funcionario >= 0
            AND porcentagem_comissao_funcionario <= 100
        ),

    FOREIGN KEY (pessoa_cpf_pessoa)
        REFERENCES pessoas(cpf_pessoa),

    FOREIGN KEY (cargo_id_cargo)
        REFERENCES cargos(id_cargo)
);


-- ============================================================
-- 7. TABELA DE LIVROS
-- RELACIONAMENTO: GENEROS 1:N LIVROS
--
-- As imagens serão tratadas posteriormente no frontend.
-- ============================================================

CREATE TABLE livros (
    id_livro SERIAL PRIMARY KEY,

    titulo VARCHAR(200) NOT NULL,

    autor VARCHAR(150) NOT NULL,

    isbn VARCHAR(20) UNIQUE,

    editora VARCHAR(100),

    paginas INTEGER NOT NULL
        CHECK (paginas > 0),

    ano INTEGER,

    sinopse TEXT,

    preco DECIMAL(10,2) NOT NULL
        CHECK (preco >= 0),

    estoque INTEGER NOT NULL
        CHECK (estoque >= 0),

    genero_id INTEGER NOT NULL,

    FOREIGN KEY (genero_id)
        REFERENCES generos(id_genero)
);


-- ============================================================
-- 8. TABELA DE LANÇAMENTOS
-- RELACIONAMENTO: LIVROS 1:1 LANÇAMENTOS
--
-- O UNIQUE em livro_id_livro garante que:
-- UM LIVRO = NO MÁXIMO UM LANÇAMENTO
-- ============================================================

CREATE TABLE lancamentos (
    id_lancamento SERIAL PRIMARY KEY,

    livro_id_livro INTEGER NOT NULL UNIQUE,

    pais_lancamento VARCHAR(100) NOT NULL,

    data_lancamento DATE NOT NULL,

    FOREIGN KEY (livro_id_livro)
        REFERENCES livros(id_livro)
);


-- ============================================================
-- 9. INSERTS - GÊNEROS
-- ============================================================

INSERT INTO generos (nome_genero) VALUES
('Fantasia'),
('Romance'),
('Terror'),
('Clássico'),
('Ficção Científica'),
('Suspense'),
('Policial'),
('Distopia'),
('Poema'),
('Biografia');


-- ============================================================
-- 10. INSERTS - CARGOS
-- ============================================================

INSERT INTO cargos (nome_cargo) VALUES
('Gerente'),
('Vendedor'),
('Caixa'),
('Bibliotecário'),
('Estoquista'),
('Atendente'),
('Supervisor'),
('Assistente Administrativo'),
('Auxiliar de Estoque'),
('Administrador');


-- ============================================================
-- 11. INSERTS - PESSOAS
-- ============================================================

INSERT INTO pessoas
(cpf_pessoa, nome_pessoa, data_nascimento_pessoa,
 endereco_pessoa, senha_pessoa, email_pessoa)
VALUES

('111.111.111-01', 'Ana Clara Souza', '1995-03-12',
 'Rua das Flores, 100', 'senha123', 'ana@email.com'),

('111.111.111-02', 'Bruno Henrique Lima', '1992-07-25',
 'Rua Central, 200', 'senha123', 'bruno@email.com'),

('111.111.111-03', 'Camila Oliveira', '1998-01-18',
 'Rua das Palmeiras, 300', 'senha123', 'camila@email.com'),

('111.111.111-04', 'Daniel Martins', '1990-11-09',
 'Rua do Comércio, 400', 'senha123', 'daniel@email.com'),

('111.111.111-05', 'Eduarda Santos', '1997-05-22',
 'Rua Primavera, 500', 'senha123', 'eduarda@email.com'),

('111.111.111-06', 'Felipe Almeida', '1993-09-14',
 'Rua Azul, 600', 'senha123', 'felipe@email.com'),

('111.111.111-07', 'Gabriela Costa', '1999-02-28',
 'Rua Verde, 700', 'senha123', 'gabriela@email.com'),

('111.111.111-08', 'Henrique Rocha', '1991-06-17',
 'Rua do Sol, 800', 'senha123', 'henrique@email.com'),

('111.111.111-09', 'Isabela Ferreira', '1996-12-03',
 'Rua da Lua, 900', 'senha123', 'isabela@email.com'),

('111.111.111-10', 'João Pedro Silva', '1994-08-30',
 'Rua das Acácias, 1000', 'senha123', 'joao@email.com'),

('111.111.111-11', 'Karina Mendes', '2000-04-11',
 'Rua Bela Vista, 1100', 'senha123', 'karina@email.com'),

('111.111.111-12', 'Lucas Barbosa', '1995-10-19',
 'Rua Horizonte, 1200', 'senha123', 'lucas@email.com'),

('111.111.111-13', 'Mariana Alves', '1998-03-07',
 'Rua do Bosque, 1300', 'senha123', 'mariana@email.com'),

('111.111.111-14', 'Nicolas Ribeiro', '1992-01-26',
 'Rua do Lago, 1400', 'senha123', 'nicolas@email.com'),

('111.111.111-15', 'Olivia Cardoso', '1997-07-13',
 'Rua das Estrelas, 1500', 'senha123', 'olivia@email.com'),

('111.111.111-16', 'Paulo Mendes', '1990-05-05',
 'Rua das Árvores, 1600', 'senha123', 'paulo@email.com'),

('111.111.111-17', 'Rafaela Martins', '1999-09-21',
 'Rua das Flores, 1700', 'senha123', 'rafaela@email.com'),

('111.111.111-18', 'Samuel Costa', '1993-02-15',
 'Rua Principal, 1800', 'senha123', 'samuel@email.com'),

('111.111.111-19', 'Tatiane Souza', '1996-06-29',
 'Rua da Biblioteca, 1900', 'senha123', 'tatiane@email.com'),

('111.111.111-20', 'Victor Hugo Lima', '1991-12-10',
 'Rua do Mercado, 2000', 'senha123', 'victor@email.com');


-- ============================================================
-- 12. INSERTS - CLIENTES
-- ============================================================

INSERT INTO clientes
(pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente)
VALUES

('111.111.111-01', 2500.00, '2026-01-10'),
('111.111.111-02', 3200.00, '2026-01-15'),
('111.111.111-03', 2800.00, '2026-01-20'),
('111.111.111-04', 4100.00, '2026-02-01'),
('111.111.111-05', 3500.00, '2026-02-05'),
('111.111.111-06', 2200.00, '2026-02-10'),
('111.111.111-07', 3900.00, '2026-02-15'),
('111.111.111-08', 3000.00, '2026-02-20'),
('111.111.111-09', 4500.00, '2026-03-01'),
('111.111.111-10', 2700.00, '2026-03-05');


-- ============================================================
-- 13. INSERTS - FUNCIONÁRIOS
-- ============================================================

INSERT INTO funcionarios
(pessoa_cpf_pessoa, salario_funcionario,
 cargo_id_cargo, porcentagem_comissao_funcionario)
VALUES

('111.111.111-11', 4500.00, 1, 5.00),
('111.111.111-12', 2800.00, 2, 3.00),
('111.111.111-13', 2500.00, 3, 2.00),
('111.111.111-14', 3000.00, 4, 0.00),
('111.111.111-15', 2400.00, 5, 0.00),
('111.111.111-16', 2600.00, 6, 2.00),
('111.111.111-17', 3800.00, 7, 4.00),
('111.111.111-18', 2900.00, 8, 0.00),
('111.111.111-19', 2300.00, 9, 0.00),
('111.111.111-20', 5000.00, 10, 5.00);


-- ============================================================
-- 14. INSERTS - LIVROS
-- ============================================================

INSERT INTO livros
(titulo, autor, isbn, editora, paginas, ano,
 sinopse, preco, estoque, genero_id)
VALUES

(
'Império do Vampiro',
'Jay Kristoff',
'9781250245713',
'St. Martin''s Press',
976,
2021,
'Uma fantasia sombria sobre vampiros, sobrevivência e vingança.',
59.90,
8,
1
),

(
'Mil Vezes Amor',
'Lynn Painter',
'9780593334836',
'Simon & Schuster',
368,
2022,
'Uma história romântica envolvendo encontros, escolhas e novas oportunidades.',
39.90,
12,
2
),

(
'It: A Coisa',
'Stephen King',
'9781501142970',
'Scribner',
1104,
1986,
'Um grupo de amigos enfrenta uma presença assustadora que retorna à cidade.',
69.90,
6,
3
),

(
'Divinos Rivais',
'Rebecca Ross',
'9781250857435',
'Wednesday Books',
368,
2023,
'Uma história de fantasia, cartas e rivalidade entre jovens escritores.',
49.90,
10,
1
),

(
'Neuromancer',
'William Gibson',
'9780441569595',
'Ace',
271,
1984,
'Um clássico da ficção científica sobre tecnologia, inteligência artificial e hackers.',
34.90,
9,
5
),

(
'O Corvo',
'Edgar Allan Poe',
'9780486270550',
'Dover Publications',
56,
1845,
'Poema clássico marcado por mistério, luto e atmosfera sombria.',
19.90,
15,
9
),

(
'Mulherzinhas',
'Louisa May Alcott',
'9780140391331',
'Penguin Classics',
759,
1868,
'A história de quatro irmãs e suas experiências durante o crescimento.',
44.90,
7,
4
),

(
'O Mundo Assombrado pelos Demônios',
'Carl Sagan',
'9780345409461',
'Random House',
442,
1995,
'Reflexões sobre ciência, pensamento crítico e crenças.',
42.90,
8,
5
),

(
'Orgulho e Preconceito',
'Jane Austen',
'9780141439518',
'Penguin Classics',
432,
1813,
'Romance clássico sobre relações sociais, família e primeiras impressões.',
29.90,
11,
4
),

(
'Dungeons and Drama',
'Kristy Boyce',
'9781250787120',
'Wednesday Books',
352,
2024,
'Uma aventura envolvendo teatro, jogos e novas amizades.',
38.90,
10,
2
),

(
'Jantar Secreto',
'Raphael Montes',
'9788535928359',
'Companhia das Letras',
389,
2016,
'Um suspense envolvendo quatro amigos e um negócio secreto.',
41.90,
7,
6
),

(
'E Não Sobrou Nenhum',
'Agatha Christie',
'9780062073488',
'HarperCollins',
400,
1939,
'Dez pessoas são reunidas em uma ilha onde acontecimentos misteriosos começam.',
35.90,
9,
7
),

(
'1984',
'George Orwell',
'9780451524935',
'Plume',
336,
1949,
'Uma sociedade controlada por vigilância e manipulação da informação.',
27.90,
14,
8
),

(
'Eu Tenho Sérios Poemas Mentais',
'Pedro Salomão',
'9788551004232',
'Outro Planeta',
192,
2018,
'Coletânea de poemas sobre sentimentos, pensamentos e experiências.',
32.90,
10,
9
),

(
'Rita Lee: Uma Autobiografia',
'Rita Lee',
'9788535927826',
'Companhia das Letras',
296,
2016,
'Autobiografia contando momentos da vida e carreira da artista.',
39.90,
8,
10
);


-- ============================================================
-- 15. INSERTS - LANÇAMENTOS
-- ============================================================

INSERT INTO lancamentos
(livro_id_livro, pais_lancamento, data_lancamento)
VALUES

(1, 'Estados Unidos', '2021-09-14'),
(2, 'Estados Unidos', '2022-06-14'),
(3, 'Estados Unidos', '1986-09-15'),
(4, 'Estados Unidos', '2023-04-04'),
(5, 'Estados Unidos', '1984-07-01'),
(6, 'Estados Unidos', '1845-01-29'),
(7, 'Estados Unidos', '1868-09-30'),
(8, 'Estados Unidos', '1995-05-01'),
(9, 'Reino Unido', '1813-01-28'),
(10, 'Estados Unidos', '2024-02-13'),
(11, 'Brasil', '2016-09-01'),
(12, 'Reino Unido', '1939-11-06'),
(13, 'Reino Unido', '1949-06-08'),
(14, 'Brasil', '2018-01-01'),
(15, 'Brasil', '2016-11-16');


-- ============================================================
-- 16. TESTES DO BANCO
-- ============================================================


-- Quantidade de registros

SELECT 'generos' AS tabela, COUNT(*) AS quantidade
FROM generos

UNION ALL

SELECT 'cargos', COUNT(*)
FROM cargos

UNION ALL

SELECT 'pessoas', COUNT(*)
FROM pessoas

UNION ALL

SELECT 'clientes', COUNT(*)
FROM clientes

UNION ALL

SELECT 'funcionarios', COUNT(*)
FROM funcionarios

UNION ALL

SELECT 'livros', COUNT(*)
FROM livros

UNION ALL

SELECT 'lancamentos', COUNT(*)
FROM lancamentos;


-- ============================================================
-- TESTE 1:N
-- GENEROS → LIVROS
-- ============================================================

SELECT
    g.nome_genero,
    l.titulo
FROM generos g
JOIN livros l
    ON g.id_genero = l.genero_id
ORDER BY g.nome_genero, l.titulo;


-- ============================================================
-- TESTE 1:N
-- CARGOS → FUNCIONARIOS
-- ============================================================

SELECT
    c.nome_cargo,
    p.nome_pessoa
FROM cargos c
JOIN funcionarios f
    ON c.id_cargo = f.cargo_id_cargo
JOIN pessoas p
    ON f.pessoa_cpf_pessoa = p.cpf_pessoa
ORDER BY c.nome_cargo;


-- ============================================================
-- TESTE 1:1
-- LIVROS → LANÇAMENTOS
-- ============================================================

SELECT
    l.id_livro,
    l.titulo,
    la.pais_lancamento,
    la.data_lancamento
FROM livros l
JOIN lancamentos la
    ON l.id_livro = la.livro_id_livro
ORDER BY l.id_livro;


-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
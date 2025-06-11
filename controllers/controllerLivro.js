// controllers/livroController.js
const db = require('../config/db_sequelize');

module.exports = {
  async getCreate(req, res) {
    try {
      const categorias = await db.Categoria.findAll();
      res.render('livro/livroCreate', { categorias: categorias.map(cat => cat.toJSON()) });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar categorias.");
    }
  },

  async postCreate(req, res) {
    try {
      // Validação simples
      if (!req.body.titulo || !req.body.ano || !req.body.id_categoria) {
        const categorias = await db.Categoria.findAll();
        return res.status(400).render('livro/livroCreate', {
        categorias: categorias.map(cat => cat.toJSON()),
        error: "Todos os campos são obrigatórios."
        });
      }
      // Verifica se o ano é um número válido}
  
      if (isNaN(req.body.ano) || req.body.ano < 0) {
      const categorias = await db.Categoria.findAll();
      return res.status(400).render('livro/livroCreate', {
      categorias: categorias.map(cat => cat.toJSON()),
      error: "Ano inválido."
        });
      }
    
      // Criação do livro

      await db.Livro.create({
        titulo: req.body.titulo,
        ano: req.body.ano, // Se houver esse campo no form
        id_categoria: req.body.id_categoria
      });
      res.redirect('/livroList'); 
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao cadastrar livro.");
    }
  },
    async getList(req, res) {
        try {
        const livros = await db.Livro.findAll({
            include: [{
            model: db.Categoria,
            attributes: ['id_categoria', 'nome', 'tipo'] 
            }]
        });
        res.render('livro/livroList', {
            livros: livros.map(livro => livro.toJSON())
        });
        } catch (err) {
        console.log(err);
        res.status(500).send("Erro ao listar livros.");
        }
    },
  async getUpdate(req, res) {
    try {
      const livro = await db.Livro.findByPk(req.params.id, {
        include: [{
          model: db.Categoria,
          attributes: ['id_categoria', 'nome', 'tipo']
        }]
      });
      if (!livro) {
        return res.status(404).send("Livro não encontrado.");
      }
      const categorias = await db.Categoria.findAll();
      res.render('livro/livroUpdate', {
        livro: livro.toJSON(),
        categorias: categorias.map(cat => cat.toJSON())
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar livro para atualização.");
    }
  }

};
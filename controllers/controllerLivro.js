// controllers/livroController.js
const db = require('../config/db_sequelize');
const { where } = require('../models/noSql/comentario');
const usuario = require('../models/relational/usuario');

module.exports = {
  async getCreate(req, res) {
    try {
      if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
        return res.status(403).send('Acesso negado.');
      }
      const categorias = await db.Categoria.findAll();
      const autores = await db.Autor.findAll(); 
      res.render('livro/livroCreate', { 
        categorias: categorias.map(cat => cat.toJSON()), 
        autores: autores.map(autor => autor.toJSON()),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar categorias.");
    }
  },

  async postCreate(req, res) {
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send('Acesso negado.');
    }
    try {
      // Validação simples
      if (!req.body.titulo || !req.body.ano || !req.body.id_categoria || !req.body.id_autores) {
        const categorias = await db.Categoria.findAll();
        const autores = await db.Autor.findAll();
        return res.status(400).render('livro/livroCreate', {
        categorias: categorias.map(cat => cat.toJSON()),
        autores: autores.map(autor => autor.toJSON()),
        error: "Todos os campos são obrigatórios.",
        usuario: req.session.usuario
        });
      }
      
      // Verifica se o ano é um número válido}
  
    if (isNaN(req.body.ano) || req.body.ano < 0) {
      const categorias = await db.Categoria.findAll();
      const autores = await db.Autor.findAll();
      return res.status(400).render('livro/livroCreate', {
      categorias: categorias.map(cat => cat.toJSON()),
      autores: autores.map(autor => autor.toJSON()),
      error: "Ano inválido.",
      usuario: req.session.usuario
      });
    }


        // Criação do livro (sem id_autor)
      const livro = await db.Livro.create({
      titulo: req.body.titulo,
      ano: req.body.ano,
      id_categoria: req.body.id_categoria
      });

       // Associa autores (id_autores pode ser um array ou string)
      let idsAutores = req.body.id_autores;
      if (!Array.isArray(idsAutores)) {
      idsAutores = [idsAutores];
      }
      await livro.setAutores(idsAutores);
      res.redirect('/livroList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao cadastrar livro.");
    }
  },

    async getList(req, res) {
        try {
        const livros = await db.Livro.findAll({
            include: [
              {model: db.Categoria, as: 'Categoria', attributes: ['id_categoria', 'nome', 'tipo']},
              {model: db.Autor, as: 'Autores', attributes: ['id_autor', 'nome']}
            ]
        });
        res.render('livro/livroList', {
            livros: livros.map(livro => livro.toJSON()),
            usuario: req.session.usuario
        });
        } catch (err) {
        console.log(err);
        res.status(500).send("Erro ao listar livros.");
        }
    },
  async getUpdate(req, res) {
    if (!req.session.usuario || req.session.usuario.tipo === 'LEITOR') {
        return res.status(403).send("Acesso negado. Você não tem permissão para editar livros.");
    }
    try {
      const livro = await db.Livro.findByPk(req.params.id, {
        include: [
          { model: db.Categoria, as: 'Categoria', attributes: ['id_categoria', 'nome', 'tipo'] },
          { model: db.Autor, as: 'Autores', attributes: ['id_autor', 'nome'] }
        ]
      });
      if (!livro) {
        return res.status(404).send("Livro não encontrado.");
      }
      const categorias = await db.Categoria.findAll();
      const autores = await db.Autor.findAll();
      res.render('livro/livroUpdate', {
        livro: livro.toJSON(),
        categorias: categorias.map(cat => cat.toJSON()),
        autores: autores.map(autor => autor.toJSON()),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar livro para atualização.");
    }
  },
  async postUpdate(req, res) {
    if (!req.session.usuario || req.session.usuario.tipo === 'LEITOR') {
      return res.status(403).send("Acesso negado.");
    }
    try {
      // Validação simples
      if (!req.body.titulo || !req.body.ano || !req.body.id_categoria || !req.body.id_autores) {
        const categorias = await db.Categoria.findAll();
        const autores = await db.Autor.findAll();

        return res.status(400).render('livro/livroUpdate', {
          livro: req.body,
          categorias: categorias.map(cat => cat.toJSON()),
          autores: autores.map(autor => autor.toJSON()),
          error: "Todos os campos são obrigatórios.",
          usuario: req.session.usuario
        });
      }
      // Verifica se o ano é um número válido
      if (isNaN(req.body.ano) || req.body.ano < 0) {
        const categorias = await db.Categoria.findAll();
        const autores = await db.Autor.findAll();
        return res.status(400).render('livro/livroUpdate', {
          livro: req.body,
          categorias: categorias.map(cat => cat.toJSON()),
          error: "Ano inválido.",
          usuario: req.session.usuario
        });
      }

      const livro = await db.Livro.findByPk(req.body.id_livro);
      await db.Livro.update(
        { 
          titulo: req.body.titulo, 
          ano: req.body.ano, 
          id_categoria: req.body.id_categoria
        },
      { where: { id_livro: req.body.id_livro } }
      );
      let idsAutores = req.body.id_autores;
      if (!Array.isArray(idsAutores)) {
      idsAutores = [idsAutores];
      }
      await livro.setAutores(idsAutores);

      res.redirect('/livroList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao atualizar livro.");
  }
},

  async getDelete(req, res) {
    if (!req.session.usuario || req.session.usuario.tipo === 'LEITOR') {
    return res.status(403).send("Acesso negado.");
  }
    try {
      const livro = await db.Livro.findByPk(req.params.id);
      if (!livro) {
        return res.status(404).send("Livro não encontrado.");
      }
      await livro.destroy();
      res.redirect('/livroList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao deletar livro.");
    }
  }


};
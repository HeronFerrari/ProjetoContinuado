const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
  async getCreate(req, res) {
    res.render('categoria/categoriaCreate');
  },

  async postCreate(req, res) {
    try {
      if (!req.body.nome || !req.body.tipo) {
        return res.status(400).send('Nome e tipo são obrigatórios');
      }
      await db.Categoria.create({
        nome: req.body.nome,
        tipo: req.body.tipo
      });
      res.redirect('/categoriaCreate');
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao criar categoria');
    }
  },

  async getList(req, res) {
    try {
      const categorias = await db.Categoria.findAll();
      res.render('categoria/categoriaList', {
        categorias: categorias.map(catg => catg.toJSON())
      });
    } catch (err) {
      console.log(err);
    }
  },

  async getUpdate(req, res) {
    try {
      const categoria = await db.Categoria.findByPk(req.params.id_categoria);
      if (!categoria) {
        return res.status(404).send('Categoria não encontrada');
      }
      res.render('categoria/categoriaList', { categoria: categoria.dataValues });
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao buscar categoria para atualização');
    }
  },

  async postUpdate(req, res) {
    try {
      await db.Categoria.update(req.body, { where: { id_categoria: req.body.id_categoria } });
      res.redirect('/categoriaList');
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao atualizar categoria');
    }
  },

  async getDelete(req, res) {
    try {
      await db.Categoria.destroy({ where: { id_categoria: req.params.id_categoria } });
      res.redirect('/categoriaList');
    } catch (err) {
      console.log(err);
      //notifica usuario
      let errorMessage = 'Não é possível excluir a categoria, pois ela está associada a livros ou comentários.';
      res.render('categoria/categoriaList',{
        categorias: (await db.Categoria.findAll()).map(catg => catg.toJSON()),
        error: errorMessage
      });
    }
  }

}
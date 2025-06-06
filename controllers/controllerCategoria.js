const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
  async getCreate(req, res) {
    res.render('categoria/categoriaCreate');
  },

  async postCreate(req, res) {
    try {
      await db.Categoria.create(req.body);
      res.redirect('/home');
    } catch (err) {
      console.log(err);
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
      res.render('categoria/categoriaUpdate', { categoria: categoria.dataValues });
    } catch (err) {
      console.log(err);
    }
  },

  async postUpdate(req, res) {
    try {
      await db.Categoria.update(req.body, { where: { id_categoria: req.body.id_categoria } });
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  },

  async getDelete(req, res) {
    try {
      await db.Categoria.destroy({ where: { id_categoria: req.params.id_categoria } });
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  }
};
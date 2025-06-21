const db = require('../config/db_sequelize');

module.exports = {
  async getList(req, res) {
    try {
      const autores = await db.Autor.findAll();
      res.render('autor/autorList', { autores: autores.map(a => a.toJSON()) });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao listar autores.");
    }
  },

  async getCreate(req, res) {
    res.render('autor/autorCreate');
  },

  async postCreate(req, res) {
    try {
      await db.Autor.create({
        nome: req.body.nome
      });
      res.redirect('/livroCreate');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao cadastrar autor.");
    }
  },

  async getUpdate(req, res){
    try {
        const autor = await db.Autor.findByPk(req.params.id_autor);
        if (!autor) {
            return res.status(404).send("Autor não encontrado.");
        }
        res.render('autor/autorUpdate', { autor: autor.toJSON() });
    } catch (err) {
        console.log(err);
        res.status(500).send("Erro ao buscar autor para atualização.");
    }
  },
    async postUpdate(req, res) {
        try {
        await db.Autor.update(
            { nome: req.body.nome },
            { where: { id_autor: req.params.id_autor } }
        );
        res.redirect('/autorList');
        } catch (err) {
        console.log(err);
        res.status(500).send("Erro ao atualizar autor.");
        }
    },
    async getDelete(req, res) {
        try {
            await db.Autor.destroy({ where: { id_autor: req.params.id_autor } });
            res.redirect('/autorList');
        } catch (err) {
            console.log(err);
            res.status(500).send("Erro ao excluir autor.");
        }
    }

};

const db = require ('../config/db_sequelize');
const path = require ('path');

module.exports = {

async getLogin (req, res ) {
res.render ('usuario/login' ,{ layout: 'noMenu.handlebars'});
},

  async postLogin(req, res) {
    db.Usuario.findAll({
      where: {
        login: req.body.login,
        senha: req.body.senha
      }
    }).then(usuarios => {
      if (usuarios.length > 0)
        res.render('home');
      else
        res.redirect('/');
    }).catch((err) => {
      console.log(err);
    });
  },
 
  async getCreate(req, res) {
    res.render('usuario/usuarioCreate');
  },

  async postCreate(req, res) {
    db.Usuario.create({
      login: req.body.login,
      senha: req.body.senha,
      tipo: req.body.tipo
    }).then(() => {
      res.redirect('/home');
    }).catch((err) => {
      console.log(err);
    });
  },

  async getList(req, res) {
    db.Usuario.findAll().then(usuarios => {
      res.render('usuario/usuarioList',
        { usuarios: usuarios.map(user => user.toJSON()) });
    }).catch((err) => {
      console.log(err);
    });
  },

  async getUpdate(req, res) {
    try {
      const usuario = await db.Usuario.findByPk(req.params.id);
      res.render('usuario/usuarioUpdate', { usuario: usuario.dataValues });
    } catch (err) {
      console.log(err);
    }
  },

  async postUpdate(req, res) {
    try {
      await db.Usuario.update(req.body, { where: { id: req.body.id } });
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  },

  async getDelete(req, res) {
    try {
      await db.Usuario.destroy({ where: { id: req.params.id } });
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  }

}

const db = require ('../config/db_sequelize');
const path = require ('path');
const usuario = require('../models/relational/usuario');

module.exports = {

  async getLogin (req, res ) {
  res.render ('usuario/login' ,{ layout: 'noMenu.handlebars'});
  },

  async getLogout(req, res) {
    try {
     req.session.destroy(() => {
      res.redirect('/login');
     });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao tentar deslogar.");
    }
  },

  async postLogin(req, res) {
   try {
    const usuario = await db.Usuario.findOne({
      where: {
        login: req.body.login,
        senha: req.body.senha
      }
    });
    if (usuario) {
      req.session.usuario = usuario.toJSON(); // Salva usuário na sessão
      res.redirect('/home');
    } else {
      res.render('usuario/login', {
        layout: 'noMenu.handlebars',
        error: "Usuário ou senha inválidos."
      });
    }
  }  catch (err) {
    console.log(err);
    res.status(500).send("Erro ao tentar logar.");
  }
  },
 
  async getCreate(req, res) {
    res.render('usuario/usuarioCreate', {
      usuario: req.session.usuario
    });
  },

  async postCreate(req, res) {
    db.Usuario.create({
      login: req.body.login,
      senha: req.body.senha,
      tipo: req.body.tipo
    }).then(() => {
      res.redirect('/usuarioList');
    }).catch((err) => {
      console.log(err);
    });
  },

  async getList(req, res) {
    db.Usuario.findAll().then(usuarios => {
      res.render('usuario/usuarioList',{ 
        usuarios: usuarios.map(user => user.toJSON()),
        usuario: req.session.usuario
      });
    }).catch((err) => {
      console.log(err);
    });
  },

  async getUpdate(req, res) {
    try {
      const usuario = await db.Usuario.findByPk(req.params.id);
      res.render('usuario/usuarioUpdate', { 
        usuario: usuario.dataValues,
        usuarioLogado: req.session.usuario
        });
    } catch (err) {
      console.log(err);
    }
  },

  async postUpdate(req, res) {
    try {
      await db.Usuario.update(req.body, { where: { id: req.body.id } });
      res.redirect('/usuarioList');
    } catch (err) {
      console.log(err);
    }
  },

  async getDelete(req, res) {
    try {
      await db.Usuario.destroy({ where: { id: req.params.id } });
      res.redirect('/usuarioList');
    } catch (err) {
      console.log(err);
    }
  }

}
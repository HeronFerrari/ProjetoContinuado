
const db = require ('../config/db_sequelize');
const path = require ('path');
const usuario = require('../models/relational/usuario');

module.exports = {

  async getLogin (req, res ) {
  res.render ('usuario/login', { 
    hideMenu: true,
    layout: 'noMenu.handlebars'});
  },

  async getLogout(req, res) {
    try {
     req.session.destroy(() => {
      res.cookie('logoutMsg', 'Usuário deslogado com sucesso!', { maxAge: 5000, httpOnly: true });
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
      usuario: req.session.usuario, // Passa o usuário logado para o template
      hideMenu: true, // Esconde o menu na tela de cadastro
    });
  },

  async postCreate(req, res) {
   
    try {
      console.log('Dados recebidos no login:', req.body);
      const { login, senha, nome, sobrenome, email, idade, sexo, cidade, estado, nacionalidade, superior_login, superior_senha } = req.body;
      const tipo = Number(req.body.tipo);
    
       // Se for cadastrar bibliotecário ou admin, exige validação do superior
      if (tipo == 2 || tipo == 1) {
        const superior = await db.Usuario.findOne({
        where: {
          login: superior_login,
          senha: superior_senha    
        }
      });
      if (!superior || superior.tipo > tipo || superior.tipo === 3) {
        return res.render('usuario/usuarioCreate', {
          error: "Credenciais do superior inválidas ou sem permissão.",
          usuario: req.session.usuario
        });
      }
    }

    await db.Usuario.create({ login, senha, nome, sobrenome, email, idade, sexo, cidade, estado, nacionalidade, tipo });
     // Exibe mensagem de sucesso na tela de cadastro
    return res.render('usuario/usuarioCreate', {
      usuario: req.session.usuario,
      message: "Usuário cadastrado com sucesso!"
    });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao tentar criar usuário.");
    }
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
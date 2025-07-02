
const jwt = require('jsonwebtoken');
const db = require ('../config/db_sequelize');
const path = require ('path');
const usuario = require('../models/relational/usuario');


const JWT_SECRET = 'sEnHaSeCrEtA'; // Substitua pela sua chave secreta real

module.exports = {

   // --- NOVA FUNÇÃO DE LOGIN PARA A API ---
  async apiLogin(req, res) {
    try {
      const { login, senha } = req.body;

      // Busca o usuário no banco (usando a lógica de texto puro)
      const usuario = await db.Usuario.findOne({ where: { login, senha } });

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Se o usuário for válido, crie o token JWT
      const payload = {
        id: usuario.id,
        tipo: usuario.tipo
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora

      // Retorna o token para o cliente
      res.json({
        message: 'Login bem-sucedido!',
        token: token
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

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
      req.session.save(err => {
        if (err) { 
          console.error('Erro ao salvar a sessão:', err);
          return res.status(500).send("Erro ao tentar logar.");
        }
        res.redirect('/home');
    });
    } else {
      res.render('usuario/login', {
        layout: 'noMenu.handlebars',
        error: "Usuário ou senha inválidos."
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao tentar logar.");
  }
  },
 
  async getCreate(req, res) {
    if (!req.session.usuario || req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BILBIOTECARIO') {
      return res.redirect('/home'); // Redireciona se não tiver permissão
    }
    res.render('usuario/usuarioCreate', {
      usuario: req.session.usuario, // Passa o usuário logado para o template
      hideMenu: true, // Esconde o menu na tela de cadastro
    });
  },

  async postCreate(req, res) {
    try {
    const dadosNovosUsuario = req.body;
    const usuarioLogado = req.session.usuario;
    const tipoNovoUsuario = dadosNovosUsuario.tipo;

     if (usuarioLogado.tipo === 'BIBLIOTECARIO') {
      // ...ele SÓ pode criar LEITORES.
      if (tipoNovoUsuario !== 'LEITOR') {
        return res.render('usuario/usuarioCreate', {
          error: "Acesso negado. Bibliotecários só podem cadastrar usuários do tipo Leitor.",
          usuario: usuarioLogado
        });
      }
      // Se for um leitor, não precisa de validação de superior, a criação pode prosseguir.
    }

    // REGRA 2: Se um ADMIN está logado...
    if (usuarioLogado.tipo === 'ADMIN') {
      // ...e está tentando criar outro ADMIN ou um BIBLIOTECÁRIO...
      if (tipoNovoUsuario === 'ADMIN' || tipoNovoUsuario === 'BIBLIOTECARIO') {
        // ...ele precisa confirmar suas próprias credenciais como 'superior'.
        const superior = await db.Usuario.findOne({
          where: {
            login: dadosNovosUsuario.superior_login,
            senha: dadosNovosUsuario.superior_senha
          }
        });
        // O 'superior' deve ser o próprio admin logado.
        if (!superior || superior.id !== usuarioLogado.id || superior.tipo !== 'ADMIN') {
          return res.render('usuario/usuarioCreate', {
            error: "Credenciais de Administrador inválidas para autorizar esta criação.",
            usuario: usuarioLogado
          });
        }
      }
    }
    


    if (dadosNovosUsuario.estado) {
      dadosNovosUsuario.estado = dadosNovosUsuario.estado.toUpperCase();
    }

    await db.Usuario.create(dadosNovosUsuario);
     // Exibe mensagem de sucesso na tela de cadastro
    return res.render('usuario/usuarioCreate', {
      usuario: usuarioLogado,
      message: `Usuário '${dadosNovosUsuario.login}' criado com sucesso!`
    });
  } catch (err) {
      if (err instanceof db.Sequelize.ValidationError) {
        const errorMessages = err.errors.map(e => e.message).join('. ');
        return res.render('usuario/usuarioCreate', {
          error: `Erro de validação: ${errorMessages}`,
          usuario: req.session.usuario
        });
      }
    console.log(err);
    // Erro genérico para outras falhas (como login/email duplicado)
    res.render('usuario/usuarioCreate', {
      error: "Ocorreu um erro ao criar o usuário. O login ou e-mail podem já estar em uso.",
      usuario: req.session.usuario
    });
  }
},

  async getList(req, res) {
     if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
        return res.redirect('/home');
    }
    try {
      const usuarios = await db.Usuario.findAll();
      res.render('usuario/usuarioList', { 
        usuarios: usuarios.map(user => user.toJSON()),
        usuario: req.session.usuario
      });
    } catch(err) {
      console.log(err);
      res.status(500).send("Erro ao tentar listar usuários.");
    }
  },

  async getUpdate(req, res) {
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    try {
      const usuario = await db.Usuario.findByPk(req.params.id);
      res.render('usuario/usuarioUpdate', { 
        usuario: usuario.dataValues,
        usuarioLogado: req.session.usuario
        });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao tentar obter usuário para atualização.");
    }
  },

  async postUpdate(req, res) {
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
     return res.redirect('/home');
  }
  try {
    // 1. Cria um objeto apenas com os campos permitidos
     const dadosParaAtualizar = {
      nome: req.body.nome,
      sobrenome: req.body.sobrenome,
      email: req.body.email,
      idade: req.body.idade,
      sexo: req.body.sexo,
      telefone: req.body.telefone,
      cidade: req.body.cidade,
      estado: req.body.estado,
      nacionalidade: req.body.nacionalidade,
      login: req.body.login,
      tipo: req.body.tipo,
    };

    if (dadosParaAtualizar.estado) {
      dadosParaAtualizar.estado = dadosParaAtualizar.estado.toUpperCase();
    }

    // 2. Verifique se uma nova senha foi enviada e adicione-a ao objeto
    if (req.body.senha && req.body.senha.trim() !== '') {
        dadosParaAtualizar.senha = req.body.senha;
    }
    
    // 3. Faça a atualização usando o objeto seguro
    await db.Usuario.update(dadosParaAtualizar, { 
      where: { id: req.body.id } 
    });

    res.redirect('/usuarioList');

  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao atualizar o usuário.");
    }
  },

  async getDelete(req, res) {
    if (!req.session.usuario || req.session.usuario.tipo !== 'ADMIN') {
      return res.status(403).send("Acesso negado. Você não tem permissão para realizar esta ação.");
    }
    try {
      const idParaDeletar = req.params.id;
      if (Number(idParaDeletar) === Number(req.session.usuario.id)) {
            return res.redirect('/usuarioList?error=Você não pode deletar sua própria conta.');
      }

      await db.Usuario.destroy({ where: { id: idParaDeletar } });
      res.redirect('/usuarioList?sucesso=Usuário deletado com sucesso!');
    } catch (err) {
      console.log(err);
      res.status(500).send("Ocorreu um erro ao tentar deletar o usuário.");
    }
  }

}
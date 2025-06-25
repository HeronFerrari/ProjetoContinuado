
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
      console.log('Dados recebidos no login:', req.body);
      const { login, senha, nome, sobrenome, email, idade, sexo, cidade, estado, nacionalidade, tipo, superior_login, superior_senha } = req.body;
    
       // Se for cadastrar bibliotecário ou admin, exige validação do superior
      if (tipo === 'BIBLIOTECARIO' || tipo === 'ADMIN') {
        const superior = await db.Usuario.findOne({
        where: {
          login: superior_login,
          senha: superior_senha    
        }
      });

      if (!superior || superior.tipo > tipo || superior.tipo === 'LEITOR') {
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
        login: req.body.login,
        tipo: req.body.tipo,
        // Adicione aqui todos os outros campos do formulário de edição
        nome: req.body.nome,
        sobrenome: req.body.sobrenome,
        email: req.body.email,
        idade: req.body.idade,
        sexo: req.body.sexo,
        cidade: req.body.cidade,
        estado: req.body.estado,
        nacionalidade: req.body.nacionalidade
      };

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
    if (!req.session.usuario || req.session.usuario.tipo !== 'ADMIN' || req.session.usuario.tipo !== 'BILBIOTECARIO') {
      return res.status(403).send("Acesso negado.");
    }
    try {
      const idParaDeletar = req.params.id;
      if (Number(idParaDeletar) === Number(req.session.usuario.id)) {
            return res.redirect('/usuarioList?error=autodelete');
      }

      await db.Usuario.destroy({ where: { id: req.params.id } });
      res.redirect('/usuarioList');
    } catch (err) {
      console.log(err);
    }
  }

}
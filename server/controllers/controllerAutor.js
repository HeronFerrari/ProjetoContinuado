const db = require('../config/db_sequelize');

module.exports = {

  // --- MOSTRAR A LISTA DE AUTORES ---
  async getList(req, res) {
    // REGRA: Apenas Admin e Bibliotecário podem ver a lista.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    try {
      const autores = await db.Autor.findAll({ order: [['nome', 'ASC']] });
      res.render('autor/autorList', { 
        autores: autores.map(a => a.toJSON()),
        usuario: req.session.usuario 
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao carregar a lista de autores.");
    }
  },

  // --- MOSTRAR O FORMULÁRIO DE CRIAÇÃO ---
  async getCreate(req, res) {
    // REGRA: Apenas Admin e Bibliotecário podem acessar a página de criação.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    res.render('autor/autorCreate', { usuario: req.session.usuario });
  },

  // --- PROCESSAR A CRIAÇÃO DE UM NOVO AUTOR ---
  async postCreate(req, res) {
    // REGRA: Apenas Admin e Bibliotecário podem criar.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send('Acesso negado.');
    }
    try {
      await db.Autor.create({ nome: req.body.nome });
      res.redirect('/autorList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao cadastrar autor.");
    }
  },

  // --- MOSTRAR O FORMULÁRIO DE EDIÇÃO ---
  async getUpdate(req, res){
    // REGRA: Apenas Admin e Bibliotecário podem editar.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    try {
      const autor = await db.Autor.findByPk(req.params.id_autor);
      if (!autor) {
        return res.status(404).send("Autor não encontrado.");
      }
      res.render('autor/autorUpdate', { 
        autor: autor.toJSON(),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao carregar autor para atualização.");
    }
  },
  
  // --- PROCESSAR A ATUALIZAÇÃO DE UM AUTOR ---
  async postUpdate(req, res) {
    // REGRA: Apenas Admin e Bibliotecário podem atualizar.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send('Acesso negado.');
    }
    try {
      await db.Autor.update(
        { nome: req.body.nome },
        { where: { id_autor: req.body.id_autor } }
      );
      res.redirect('/autorList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao atualizar autor.");
    }
  },
  
  // --- PROCESSAR A EXCLUSÃO DE UM AUTOR ---
  async postDelete(req, res) {
    // REGRA DE SEGURANÇA EXTRA: Apenas ADMIN pode deletar um autor.
    if (!req.session.usuario || req.session.usuario.tipo !== 'ADMIN') {
      return res.status(403).send('Acesso negado. Apenas administradores podem excluir autores.');
    }
    try {
      await db.Autor.destroy({ where: { id_autor: req.body.id_autor } });
      res.redirect('/autorList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao excluir autor.");
    }
  }
};
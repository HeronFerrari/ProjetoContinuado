
const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerComentario = require('../controllers/controllerComentario');
const controllerCategoria = require('../controllers/controllerCategoria');
const controllerLivro = require('../controllers/controllerLivro');
const controllerAutor = require('../controllers/controllerAutor');
const controllerEmprestimo = require('../controllers/controllerEmprestimo');
const controllerReserva = require('../controllers/controllerReserva');
const route = express.Router();

//criando as tabelas e usuarios no banco de dados
/* db.sequelize.sync({ force: true }).then(() => {
  console.log('{ force: true }');
}); */
// db.Usuario.create({ login: 'admin', senha: '1234', tipo: 1 });

module.exports = route;

// Home
route.get('/home', (req, res) => {
  // verifica se o cookie userData existe
  if (req.session.usuario) {
    res.render('home', {
      usuario: req.session.usuario
    });
  } else {
    res.redirect('/login');
  }
});

route.get('/', (req, res) => {
  res.render('home', {
    usuario: req.session.usuario
  });
});

// Controller Usuario
route.get('/login', controllerUsuario.getLogin);
route.post('/login', controllerUsuario.postLogin);
route.get('/logout', controllerUsuario.getLogout);
route.get('/usuarioCreate', controllerUsuario.getCreate);
route.post('/usuarioCreate', controllerUsuario.postCreate);
route.get('/usuarioList', controllerUsuario.getList);
route.get('/usuarioUpdate/:id', controllerUsuario.getUpdate);
route.post('/usuarioUpdate', controllerUsuario.postUpdate);
route.get('/usuarioDelete/:id', controllerUsuario.getDelete);

// Controller Categoria
route.get('/categoriaCreate', controllerCategoria.getCreate);
route.post('/categoriaCreate', controllerCategoria.postCreate);
route.get('/categoriaList', controllerCategoria.getList);
route.get('/categoriaUpdate/:id_categoria', controllerCategoria.getUpdate);
route.post('/categoriaUpdate', controllerCategoria.postUpdate);
route.get('/categoriaDelete/:id_categoria', controllerCategoria.getDelete);

// Controller Comentario
route.get('/comentarioCreate', controllerComentario.getCreate);
route.post('/comentarioCreate', controllerComentario.postCreate);
route.get('/comentarioList', controllerComentario.getList);
route.get('/comentarioUpdate/:id', controllerComentario.getUpdate);
route.post('/comentarioUpdate', controllerComentario.postUpdate);
route.get('/comentarioDelete/:id', controllerComentario.getDelete);

// Controller Livro
route.get('/livroCreate', controllerLivro.getCreate);
route.post('/livroCreate', controllerLivro.postCreate);
route.get('/livroList', controllerLivro.getList);
route.get('/livroUpdate/:id', controllerLivro.getUpdate);
route.post('/livroUpdate', controllerLivro.postUpdate);
route.get('/livroDelete/:id', controllerLivro.getDelete);

//Controller Emprestimo e reserva
route.post('/emprestimoCreate', controllerEmprestimo.postCreate);
route.post('/devolucao', controllerEmprestimo.devolverLivro);
route.post('/reserva', controllerReserva.criarReserva);
route.get('/reservaDelete/:id', controllerReserva.getDelete);
route.get('/reservaList', controllerReserva.getList);

//Controller Autor
route.get('/autorCreate', controllerAutor.getCreate);
route.post('/autorCreate', controllerAutor.postCreate);
route.get('/autorUpdate/:id_autor', controllerAutor.getUpdate);
route.post('/autorUpdate/:id_autor', controllerAutor.postUpdate);
route.get('/autorDelete/:id_autor', controllerAutor.getDelete);
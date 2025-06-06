
const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerComentario = require('../controllers/controllerComentario');
const controllerCategoria = require('../controllers/controllerCategoria');
const route = express.Router();

/* db.sequelize.sync({ force: true }).then(() => {
  console.log('{ force: true }');
}); */
// db.Usuario.create({ login: 'admin', senha: '1234', tipo: 1 });

module.exports = route;

// Home
route.get('/home', (req, res) => res.render('home'));

// Controller Usuario
route.get('/', controllerUsuario.getLogin);
route.post('/login', controllerUsuario.postLogin);
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
route.get('/categoriaUpdate/:id', controllerCategoria.getUpdate);
route.post('/categoriaUpdate', controllerCategoria.postUpdate);
route.get('/categoriaDelete/:id', controllerCategoria.getDelete);

// Controller Comentario
route.get('/comentarioCreate', controllerComentario.getCreate);
route.post('/comentarioCreate', controllerComentario.postCreate);
route.get('/comentarioList', controllerComentario.getList);


/*codigo do professor, não adaptado para o meu código

// Controller Receita
route.get('/receitaCreate', controllerReceita.getCreate);
route.post('/receitaCreate', controllerReceita.postCreate);
route.get('/receitaList', controllerReceita.getList);
route.get('/receitaUpdate/:id', controllerReceita.getUpdate);
route.post('/receitaUpdate', controllerReceita.postUpdate);
route.get('/receitaDelete/:id', controllerReceita.getDelete);

*/
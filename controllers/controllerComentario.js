const mongoose = require ('mongoose');
const db_mongoose = require ('../config/db_mongoose');
const Comentario = require ('../models/noSql/comentario');

mongoose.connect (db_mongoose.connection).then (() => {
console.log ('Conectado com o BD');
}).catch (() => {
console.log ('Erro na conexao com o BD');
});

 module.exports = {
 async getCreate (req, res) {
 res.render ('comentario/comentarioCreate');
 },
 async postCreate (req, res) {
 new Comentario ({
 titulo: req.body.titulo,
 texto: req.body.texto,
 autor: req.body.autor
 }).save().then (() => {
 res.redirect ('/home');
 }).catch ((err) => {
 console.log (err);
 });
 },
 async getList(req, res) {
    await Comentario.find().then(comentarios => {
      res.render('comentario/comentarioList', {
        comentarios: comentarios.map(coment => coment.toJSON())
      }); // Corrigido: fecha corretamente
    }).catch((err) => {
      console.log(err);
    });
  }
}

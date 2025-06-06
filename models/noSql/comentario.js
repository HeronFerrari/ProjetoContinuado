const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  data: { type: Date, default: Date.now },
  id_usuario: { type: Number, required: true }, // id do usuário relacional
  id_livro: { type: Number, required: true }    // id do livro relacional
});

module.exports = mongoose.model('Comentario', ComentarioSchema);
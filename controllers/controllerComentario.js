const mongoose = require ('mongoose');
const db_mongoose = require ('../config/db_mongoose');
const Comentario = require ('../models/noSql/comentario');
const db = require ('../config/db_sequelize'); 

mongoose.connect (db_mongoose.connection)
.then (() => {
  console.log ('Conectado com o BD');
})
.catch (() => {
  console.log ('Erro na conexao com o BD');
});

 module.exports = {

    async getCreate (req, res) {
      try {
        const usuarios = await db.Usuario.findAll();
        const livros = await db.Livro.findAll();
        res.render ('comentario/comentarioCreate',{
        usuarios: usuarios.map(u => u.toJSON()),
        livros: livros.map(l => l.toJSON()),
        usuario: req.session.usuario
      });
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao buscar usuários ou livros.");
 }
},

  async postCreate (req, res) {
    try {
      await new Comentario({
      texto: req.body.texto,
      titulo: req.body.titulo,
      id_usuario: req.session.usuario.id,
      id_livro: req.body.id_livro
    }).save()
    res.redirect ('/home');
  } catch (err) {
    console.log (err);
    res.status(400).send("Erro ao criar comentário: " + err.message);
  }
  },

 async getList(req, res) {
  try{
    const comentarios = await Comentario.find().lean();

     // Busca todos usuários e livros do PostgreSQL
      const usuarios = await db.Usuario.findAll();
      const livros = await db.Livro.findAll();
      const autores = await db.Autor.findAll();
      const livroAutores = await db.LivroAutor.findAll();

      // Cria mapas para acesso rápido por ID
      const usuariosMap = {};
      usuarios.forEach(u => { usuariosMap[u.id] = u; });

      const livrosMap = {};
      livros.forEach(l => { livrosMap[l.id_livro] = l; });

      const autoresMap = {};
      autores.forEach(a => { autoresMap[a.id_autor] = a; });

      // Mapeia autores de cada livro
      const livroAutoresMap = {};
      livroAutores.forEach(la => {
        if (!livroAutoresMap[la.id_livro]) livroAutoresMap[la.id_livro] = [];
          livroAutoresMap[la.id_livro].push(autoresMap[la.id_autor]?.nome);
      });


     // Adiciona nome do usuário e título do livro em cada comentário
      const comentariosComNomes = comentarios.map(coment => ({
        ...coment,
        usuario_nome: usuariosMap[coment.id_usuario]?.login || 'Desconhecido',
        livro_titulo: livrosMap[coment.id_livro]?.titulo || 'Desconhecido',
        autor: (livroAutoresMap[coment.id_livro] || []).join(', ')
      }));

      res.render('comentario/comentarioList', {
        comentarios: comentariosComNomes,
        id_usuario: req.session?.usuario?.id, // ou outro local onde guarda o id do usuário logado
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao listar comentários.");
    }
  }
}

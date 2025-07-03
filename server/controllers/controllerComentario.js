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

   async getCreate(req, res) {
    try {
      // 1. Garante que o usuário está logado
      if (!req.session.usuario) {
        return res.redirect('/login');
      }

      // 2. Busca TODOS os livros no banco de dados para popular o <select>
      const livros = await db.Livro.findAll({
        order: [['titulo', 'ASC']]
      });

      // 3. Renderiza a página, passando a lista de livros e os dados do usuário
      res.render('comentario/comentarioCreate', {
        livros: livros.map(l => l.toJSON()),
        usuario: req.session.usuario
      });

    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao carregar a página de comentários.");
    }
  },


async postCreate(req, res) {
  try {
    const usuarioLogado = req.session.usuario;

    // 1. VERIFICAÇÃO DE SEGURANÇA: Garante que o usuário está logado.
    if (!usuarioLogado) {
      // Poderia redirecionar para o login ou enviar um erro.
      return res.status(401).send("Acesso negado. Você precisa estar logado para comentar.");
    }

    // 2. VALIDAÇÃO DE DADOS: Garante que os campos não estão vazios.
    const { titulo, texto, id_livro } = req.body;
    if (!titulo || !texto || !id_livro) {
      // Idealmente, redirecionar de volta com uma mensagem de erro.
      return res.status(400).send("Título, texto e ID do livro são obrigatórios.");
    }
    
    // 3. CRIAÇÃO SEGURA: Usa o método .create() do Mongoose
    await Comentario.create({
      titulo: titulo,
      texto: texto,
      id_livro: id_livro,
      id_usuario: usuarioLogado.id // Agora temos certeza que usuarioLogado.id existe
    });

    // 4. Redireciona para a lista de comentários ou para a página do livro
    res.redirect('/comentarioList');

  } catch (err) {
    console.log(err);
    res.status(500).send("Erro interno ao tentar criar o comentário.");
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
  },

  async getUpdate(req, res) {
    try {
      const comentario = await Comentario.findById(req.params.id).lean();
      if (!comentario) {
        return res.status(404).send("Comentário não encontrado.");
      }
      const usuarios = await db.Usuario.findAll();
      const livros = await db.Livro.findAll();
      res.render('comentario/comentarioUpdate', {
        comentario,
        usuarios: usuarios.map(u => u.toJSON()),
        livros: livros.map(l => l.toJSON()),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar comentário para atualização.");
    }
  },

async postUpdate(req, res) {
  try {
    const idComentario = req.body.id_comentario;
    const usuarioLogado = req.session.usuario;

    // 1. Verificação inicial: o usuário está logado?
    if (!usuarioLogado) {
      return res.status(401).send("Acesso negado. Você precisa estar logado.");
    }

    // 2. Busque o comentário no banco e ESPERE a resposta com 'await'
    const comentario = await Comentario.findById(idComentario);

    // 3. Verifique se o comentário foi encontrado
    if (!comentario) {
      return res.status(404).send("Comentário não encontrado.");
    }

    // 4. Cheque as permissões DEPOIS de ter o comentário em mãos
    const isDono = comentario.id_usuario.toString() === usuarioLogado.id.toString();

    // Se não for o dono E não for um admin, bloqueie o acesso.
    if (!isDono && !isAdmin) {
      return res.status(403).send("Acesso negado. Você não tem permissão para editar este comentário.");
    }

    // 5. Se passou por todas as verificações, atualize o documento
    await Comentario.findByIdAndUpdate(idComentario, {
      titulo: req.body.titulo,
      texto: req.body.texto,
    });
    
    // 6. Redirecione com sucesso
    res.redirect('/comentarioList');

  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao atualizar o comentário.");
  }
},

  async postDelete(req, res) {
    try {
      const usuarioLogado = req.session.usuario;
      const idComentario = req.body.id_comentario; // Pega o ID do corpo do formulário

      if (!usuarioLogado) {
        return res.status(401).send("Acesso negado. Você precisa estar logado.");
      }

      // 1. Busca o comentário no MongoDB
      const comentario = await Comentario.findById(idComentario);
      if (!comentario) {
        return res.status(404).send("Comentário não encontrado.");
      }

      // 2. REGRA: Apenas o dono do comentário ou um admin podem deletar.
      const isDono = comentario.id_usuario.toString() === usuarioLogado.id.toString();
      const isAdmin = usuarioLogado.tipo === 'ADMIN';

      if (!isDono && !isAdmin) {
        return res.status(403).send("Você não tem permissão para excluir este comentário.");
      }

      // 3. Se passou nas verificações, deleta o comentário
      await Comentario.findByIdAndDelete(idComentario);
      
      // Envia uma mensagem de sucesso e redireciona
      res.redirect('/comentarioList?sucesso=Comentário excluído com sucesso');

    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao excluir o comentário.");
    }
  }

}

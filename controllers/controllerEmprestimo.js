// controllers/emprestimoController.js
const db = require('../config/db_sequelize');

module.exports= {

    async postCreate (req, res) {
      try {
        const { id_usuario, id_livro } = req.body;
        await db.Emprestimo.create({
          id_usuario,
          id_livro,
          data_emprestimo: new Date()
        });
        res.send('Empréstimo registrado!');
      } catch (err) {
        res.status(500).send('Erro ao registrar empréstimo.');
      }
    },

    async devolverLivro(req, res) {
    try {
      const { id_emprestimo } = req.body;
      await db.Emprestimo.update(
        { data_devolucao: new Date() },
        { where: { id: id_emprestimo } }
      );
      res.send('Livro devolvido!');
    } catch (err) {
      res.status(500).send('Erro ao registrar devolução.');
    }
  }

  
};
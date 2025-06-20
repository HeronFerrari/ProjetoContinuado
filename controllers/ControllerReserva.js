const db = require('../config/db_sequelize');

module.exports = {
  async criarReserva(req, res) {
    try {
      const { id_usuario, id_livro } = req.body;
      await db.Reserva.create({
        id_usuario,
        id_livro,
        data_reserva: new Date()
      });
      res.send('Reserva registrada!');
    } catch (err) {
      res.status(500).send('Erro ao registrar reserva.');
    }
  }
};
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
  },
  async getList(req, res) {
    try {
      const reservas = await db.Reserva.findAll({
        include: [
          { model: db.Usuario, as: 'usuario' },
          { model: db.Livro, as: 'livro' }
        ]
      });
      res.render('reserva/reservaList', { reservas: reservas.map(r => r.toJSON()) });
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao listar reservas.');
    }
  },
  async getDelete(req, res) {
    try {
      const { id_reserva } = req.params;
      await db.Reserva.destroy({ where: { id_reserva } });
      res.send('Reserva cancelada!');
    } catch (err) {
      res.status(500).send('Erro ao cancelar reserva.');
    }
  }

};
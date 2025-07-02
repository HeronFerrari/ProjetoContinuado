// models/relational/reserva.js
module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    id_reserva: { 
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    data_reserva: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW // Preenche a data automaticamente
    },
    status: {
      type: DataTypes.ENUM('ATIVA', 'AGUARDANDO_RETIRADA', 'ATENDIDA', 'CANCELADA', 'EXPIRADA'),
      allowNull: false,
      defaultValue: 'ATIVA'
    }
  }, {
    tableName: 'reservas'
  });

  return Reserva;
};
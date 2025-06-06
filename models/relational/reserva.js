module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    id_reserva: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    data_reserva: { type: DataTypes.DATE, allowNull: false }
    // Adicione as chaves estrangeiras depois, via associate ou migration
  });
  return Reserva;
};
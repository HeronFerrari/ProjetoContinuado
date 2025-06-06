module.exports = (sequelize, DataTypes) => {
  const Emprestimo = sequelize.define('Emprestimo', {
    id_emprestimo: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    data_emprestimo: { type: DataTypes.DATE, allowNull: false },
    data_devolucao: { type: DataTypes.DATE, allowNull: true }
    // Adicione as chaves estrangeiras depois, via associate ou migration
  });
  return Emprestimo;
};
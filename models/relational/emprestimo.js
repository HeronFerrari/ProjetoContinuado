module.exports = (sequelize, DataTypes) => {
  const Emprestimo = sequelize.define('Emprestimo', {
    id_emprestimo: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    id_livro: { type: DataTypes.INTEGER, allowNull: false },
    data_emprestimo: { type: DataTypes.DATE, allowNull: false },
    data_devolucao: { type: DataTypes.DATE, allowNull: true }
  });
  return Emprestimo;
};
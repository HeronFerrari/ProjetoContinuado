module.exports = (sequelize, DataTypes) => {
  const Livro = sequelize.define('Livro', {
    id_livro: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    ano: { type: DataTypes.INTEGER },
    id_categoria: { type: DataTypes.INTEGER, allowNull: false }
  });
  return Livro;
};
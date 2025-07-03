module.exports = (sequelize, DataTypes) => {
  const Autor = sequelize.define('Autor', {
    id_autor: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false }
  });
  return Autor;
};
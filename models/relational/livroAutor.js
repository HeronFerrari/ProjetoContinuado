module.exports = (sequelize, DataTypes) => {
  const LivroAutor = sequelize.define('LivroAutor', {
    id_livro_autor: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_livro: { type: DataTypes.INTEGER, allowNull: false },
    id_autor: { type: DataTypes.INTEGER, allowNull: false }
  });
  return LivroAutor;
};
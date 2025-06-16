module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('usuario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.INTEGER, allowNull: false }
    //1 - Administrador
    //2 - Usuário Comum
    //3 - Bibliotecário
  });
  return Usuario;
};
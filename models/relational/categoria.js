module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    id_categoria: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    nome: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    tipo: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }
  });
  return Categoria;
};
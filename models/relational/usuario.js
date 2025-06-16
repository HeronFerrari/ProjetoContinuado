module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('usuario', {
    nome: { type: DataTypes.STRING, allowNull: false },
    sobrenome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    idade: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 120 } },
    sexo: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['Masculino', 'Feminino', 'Outro']] } },
    telefone: { type: DataTypes.STRING, allowNull: true, validate: { is: /^\d{10,11}$/ } }, // 10 ou 11 dígitos
    cidade: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.STRING, allowNull: false, validate: { is: /^[A-Z]{2}$/ } }, // Dois caracteres maiúsculos
    nacionalidade: { type: DataTypes.STRING, allowNull: false },
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.INTEGER, allowNull: false },

    //1 - Administrador
    //2 - Usuário Comum
    //3 - Bibliotecário
  });
  return Usuario;
};
module.exports = (sequelize, DataTypes) => {
  const Emprestimo = sequelize.define('Emprestimo', {
    id_emprestimo: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    data_emprestimo: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW 
    },
    data_devolucao_prevista: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    data_devolucao_efetiva: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    status: { 
      type: DataTypes.ENUM('PENDENTE', 'DEVOLVIDO', 'ATRASADO'), 
      allowNull: false, 
      defaultValue: 'PENDENTE' 
    }

  });
  return Emprestimo;
};
// models/relational/reserva.js
module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    id_reserva: { 
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // As colunas id_usuario e id_livro serão criadas automaticamente pelas associações
    // que você já definiu no seu arquivo de configuração do banco.
    
    data_reserva: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW // Preenche a data automaticamente
    },
    status: {
      type: DataTypes.ENUM('ATIVA', 'ATENDIDA', 'CANCELADA', 'EXPIRADA'),
      allowNull: false,
      defaultValue: 'ATIVA'
    }
  }, {
    tableName: 'reservas'
  });

  return Reserva;
};
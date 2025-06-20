'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Livros', 'id_autor', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Autors', // ou 'Autores', conforme o nome da sua tabela de autores
        key: 'id_autor'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Livros', 'id_autor');
  }
};
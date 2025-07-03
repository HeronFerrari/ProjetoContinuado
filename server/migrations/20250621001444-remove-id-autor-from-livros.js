module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Livros', 'id_autor');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Livros', 'id_autor', {
      type: Sequelize.INTEGER,
      allowNull: false 
    });
  }
};
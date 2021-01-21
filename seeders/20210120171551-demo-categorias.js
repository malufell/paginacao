'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      
    await queryInterface.bulkInsert('Categorias', [{
        nome: 'Lowcarb',
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        nome: 'FIT',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'Vegana',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'Vegetariana',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'Doces',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'Salgados',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'Bebidas',
        createdAt: new Date(),
        updatedAt: new Date() }], {});
    },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Categorias', null, {});
  }
};


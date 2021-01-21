'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      
    await queryInterface.bulkInsert('Cards', [{
        nome: 'card 1',
        descricao: 'descrição do card 1',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'card 2',
        descricao: 'descrição do card 2',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'card 3',
        descricao: 'descrição do card 3',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        nome: 'card 4',
        descricao: 'descrição do card 4',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {      
        nome: 'card 5',
        descricao: 'descrição do card 5',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {      
        nome: 'card 6',
        descricao: 'descrição do card 6',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {      
        nome: 'card 7',
        descricao: 'descrição do card 7',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {     
        nome: 'card 8',
        descricao: 'descrição do card 8',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {     
        nome: 'card 9',
        descricao: 'descrição do card 9',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Cards', null, {});
  }
};

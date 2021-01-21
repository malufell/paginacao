'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categorias extends Model {

    static associate(models) {

         //super muitos para muitos
         Categorias.belongsToMany(models.Cards, { 
          as: 'cards', 
          through: 'CardsCategorias', 
          foreignKey: 'categoriaId'
        });
  
        Categorias.hasMany(models.CardsCategorias, {
          as:'categoriasCards',
          foreignKey: 'categoriaId'
        });
      }
  };
  Categorias.init({
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Categorias',
  });
  return Categorias;
};
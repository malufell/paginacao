'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cards extends Model {

    static associate(models) {

      //super muitos para muitos
      Cards.belongsToMany(models.Categorias, { 
        as: 'NomeCategorias', 
        through:'CardsCategorias',
        foreignKey: 'cardId'
      });

      Cards.hasMany(models.CardsCategorias, {
        as: 'cardsCategorias',
        foreignKey: 'cardId'

      });
    };
  };
  Cards.init({
    nome: DataTypes.STRING,
    descricao: DataTypes.STRING,
    categorias: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cards',
  });
  return Cards;
};
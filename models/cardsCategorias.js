'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CardsCategorias extends Model {

    static associate(models) {

        //super muitos para muitos
        CardsCategorias.belongsTo(models.Categorias, {
            as:'Categorias',
            foreignKey: 'id'
        });

        CardsCategorias.belongsTo(models.Cards, {
            as: 'Cards',
            foreignKey: 'id'
        });
    };
}; CardsCategorias.init({
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
      },
      cardId: {
        type: DataTypes.INTEGER,
      },
      categoriaId: { 
      type: DataTypes.INTEGER,
      allowNull: true
      },
     }, {
      sequelize,
      modelName: 'CardsCategorias',
  });

    return CardsCategorias;
};
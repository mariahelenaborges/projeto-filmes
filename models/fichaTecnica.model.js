const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const FichaTecnica = sequelize.define(
  'FichaTecnica',
  {
    duracaoMinutos: {
      type: DataTypes.STRING
    },
    orcamento: {
      type: DataTypes.STRING
    },
    bilheteria: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'FichasTecnicas',
    timestamps: true
  }
);

module.exports = FichaTecnica;
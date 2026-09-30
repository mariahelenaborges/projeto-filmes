const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Diretor = sequelize.define(
  'Diretor',
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dataNascimento: {
      type: DataTypes.STRING
    },
    nacionalidade: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'Diretores',
    timestamps: true
  }
);

module.exports = Diretor;
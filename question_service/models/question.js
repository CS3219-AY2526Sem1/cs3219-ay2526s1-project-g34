'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(_models) {}
  }

  Question.init(
    {
      title: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: false },
      difficulty: { type: DataTypes.ENUM('easy','medium','hard'), allowNull: false},
      topics: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true, defaultValue: [] }
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'Questions',
      timestamps: true
    }
  );

  return Question;
};

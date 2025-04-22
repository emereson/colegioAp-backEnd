const { DataTypes } = require('sequelize');
const { db } = require('../../database/config');

const StudentFiles = db.define('student_files', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  classroom_student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  name_student_file: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  file_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = StudentFiles;

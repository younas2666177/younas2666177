'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SubscriberProfile extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    SubscriberProfile.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        gender: {
            type: DataTypes.STRING,
            field: 'gender'
        },
        occupation: {
            type: DataTypes.STRING,
            field: 'occupation'
        },
        village: {
            type: DataTypes.STRING,
            field: 'village'
        },
        landSize: {
            type: DataTypes.STRING,
            field: 'land_size'
        },
        landUnit: {
            type: DataTypes.STRING,
            field: 'land_unit'
        },
        comment: {
            type: DataTypes.STRING,
            field: 'comment'
        },
        datetime: {
            type: DataTypes.DATE,
            field: 'dt'
        }
    }, {
        sequelize,
        modelName: 'SubscriberProfile',
        tableName: 'sub_profile',
        timestamps: false
    });
    return SubscriberProfile;
};
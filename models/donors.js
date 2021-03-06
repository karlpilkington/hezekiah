//
// Hezekiah v.0.3.0
// Copyright 2013-2015 Kyle Hotchkiss
// All Rights Reserved
//

module.exports = function( sequelize, type ) {
    var Donor = sequelize.define('Donor', {
        id: { type: type.INTEGER, unique: true, autoIncrement: true },

        email: { type: type.STRING,  primaryKey: true, unique: true },
        name: { type: type.STRING },
        customerID: { type: type.STRING },

        addressCity: { type: type.STRING },
        addressState: { type: type.STRING },
        addressStreet: { type: type.STRING },
        addressPostal: { type: type.STRING },
        addressCountry: { type: type.STRING },

        subscriber: { type: type.BOOLEAN, defaultValue: false },

        reportingKey: { type: type.STRING, unique: true },

        metadata: { type: type.JSONB }
    }, {
        classMethods: {
            associate: function( models ) {
                Donor.hasMany( models.Donation, { foreignKey: "email" } );
            }
        }
    });

    return Donor;
};

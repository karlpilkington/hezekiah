//
// Hezekiah v.0.3.0
// Copyright 2013-2015 Kyle Hotchkiss
// All Rights Reserved
//

var moment = require("moment");
var database = require("../models");

exports.donors = function( req, res ) {
    database.Donor.findAll().then(function( donors ) {
        res.send( JSON.stringify( donors, null, 4 ) );
    });
};


exports.latest = function( req, res ) {
    database.Donation.findAll().then(function( donationsObj ) {
        var campaigns = {};

        res.send( JSON.stringify( donationsObj, null, 4 ) );
    }, function( error ) {

    });
};


exports.monthly = function( req, res ) {
    database.DonorModel.find({ subscriber: true }).exec(function( error, donors ) {
        res.send( JSON.stringify( donors, null, 4 ) );
    });
};


exports.campaigns = function( req, res ) {
    database.Donation.findAll().then(function( donations ) {
        var campaigns = {};

        for ( var i in donations ) {
            var donation = donations[i];

            if ( campaigns[ donation.campaign ] ) {
                campaigns[ donation.campaign ].quantity++;
                campaigns[ donation.campaign ].amount += donation.amount;
            } else {
                campaigns[ donation.campaign ] = {
                    quantity: 1,
                    amount: donation.amount
                };
            }
        }

        res.send( JSON.stringify( campaigns, null, 4 ) );
    });
};

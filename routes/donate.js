//
// Illuminate Nations - Hezekiah v.0.3.0
// Copyright 2013-2014 Illuminate Nations
// Released under the General Public Licence
// Maintained by Kyle Hotchkiss <kyle@illuminatenations.org>
//

var hooks = require("../library/hooks.js");
var stripe = require("../library/stripe.js");
var database = require("../library/database.js");



exports.one = function( req, res ) {
    req.checkBody("token").notEmpty().len(28);
    req.checkBody("name").notEmpty();
    req.checkBody("email").notEmpty().isEmail();
    req.checkBody("amount").notEmpty().isInt();
    req.checkBody("campaignSlug").notEmpty();
    req.checkBody("campaignName").notEmpty();
    req.checkBody("addressCity").notEmpty();
    req.checkBody("addressState").notEmpty();
    req.checkBody("addressPostal").notEmpty();
    req.checkBody("addressStreet").notEmpty();
    req.checkBody("addressCountry").notEmpty();

    var donation = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        date: Date.now(),
        token: req.body.token,
        name: req.body.name,
        email: req.body.email,
        amount: req.body.amount, // Amounts are handled by their value in cents
        campaignSlug: req.body.campaignSlug,
        campaignName: req.body.campaignName,
        addressCity: req.body.addressCity,
        addressState: req.body.addressState,
        addressPostal: req.body.addressPostal,
        addressStreet: req.body.addressStreet,
        addressCountry: req.body.addressCountry,
    };

    var errors = req.validationErrors();

    if ( errors ) {
        res.send('There have been validation errors: ' + JSON.stringify( errors ), 400);
    } else {
        stripe.single(donation, function( error, charge ) {
            if ( error ) {
                res.json({ status: "error", error: error.code, message: error.message });
            } else {
                res.json({ status: "success" });

                donation.stripeID = charge.id;
                donation.customerID = charge.customer;

                hooks.postDonate( donation );
            }
        });
    }
};

exports.monthly = function( req, res ) {
    req.checkBody("token").notEmpty().len(28);
    req.checkBody("name").notEmpty();
    req.checkBody("email").notEmpty().isEmail();
    req.checkBody("amount").notEmpty().isInt();
    req.checkBody("campaignSlug").notEmpty();
    req.checkBody("campaignName").notEmpty();
    req.checkBody("addressCity").notEmpty();
    req.checkBody("addressState").notEmpty();
    req.checkBody("addressPostal").notEmpty();
    req.checkBody("addressStreet").notEmpty();
    req.checkBody("addressCountry").notEmpty();

    var donation = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        recurring: true,
        date: Date.now(),
        token: req.body.token,
        name: req.body.name,
        email: req.body.email,
        amount: req.body.amount, // Amounts are handled by their value in cents
        campaignSlug: req.body.campaignSlug,
        campaignName: req.body.campaignName,
        addressCity: req.body.addressCity,
        addressState: req.body.addressState,
        addressPostal: req.body.addressPostal,
        addressStreet: req.body.addressStreet,
        addressCountry: req.body.addressCountry
    };

    var errors = req.validationErrors();

    if ( errors ) {
        res.send('There have been validation errors: ' + JSON.stringify( errors ), 400);
    } else {
        stripe.monthly(donation, function( error, subscription ) {
            if ( error ) {
                // TODO: this is proper error json
                res.json({ status: "error", error: error.slug, message: error.message });
            } else {
                res.json({ status: "success" });

                // TODO: our webhooks will provide a better interface to this than
                // we can right here (ie we only get subscribtion id and not the
                // transaction id) so remove this db call.

                donation.recurring = true;
                donation.stripeID = subscription.id;
                donation.customerID = subscription.customer;

                donationData = new database.DonationModel( donation );

                donationData.save(function( error ) {
                    if ( error ) {
                        console.log( error );
                    }
                });
            }
        });
    }
};

exports.retrieve = function( req, res ) {
    var email = req.param("email");
    var postal = req.param("postal");

    if ( email && postal ) { // TODO FILTER
        stripe.retrieve(email, postal, function( error, total ) {
            if ( error ) {
                res.json({ status: "error", error: error });
            } else {
                res.json({ status: "success", total: total });
            }
        });
    } else {
        res.json({ status: "error", error: "validation", message: "You must provide your email and postal code" });
    }
};

exports.cancel = function( req, res ) {
    var email = req.param("email");
    var postal = req.param("postal");

    if ( email && postal ) {
        stripe.cancel(email, postal, function( error, total ) {
            if ( error ) {
                res.json({ status: "error", error: error });
            } else {
                res.json({ status: "success", total: total });
            }
        });
    } else {
        res.json({ status: "error", error: "validation", message: "You must provide your email and postal code" });
    }
};

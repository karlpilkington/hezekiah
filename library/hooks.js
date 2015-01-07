//
// Illuminate Nations - Hezekiah v.0.3.0
// Copyright 2013-2014 Illuminate Nations
// Released under the General Public Licence
// Maintained by Kyle Hotchkiss <kyle@illuminatenations.org>
//

var request = require('request');
var mandrill = require("../library/mandrill.js");
var database = require("../library/database.js");
var mailchimp = require("../library/mailchimp.js");

/*donation
    send to quickbooks

refund
    send to db
    send to quickbooks (?) */

//
// Helper/Wrapper functions around our various interfaces
//
var save = function( donation, callback ) {
    database.DonationModel.findOneAndUpdate({ "_id": donation._id }, donation,
    { upsert: true }, function( error, record ) {

        if ( typeof callback === "function" ) {
            if ( error ) {
                callback( error );
            } else {
                callback( false );
            }
        }
    });
};

var receipt = function( data, subject, template, callback ) {
    mandrill.send( data.email, subject, data, template, function() {
        if ( typeof callback === "function" ) {
            callback();
        }
    });
};

var notification = function( data, subject, template, callback ) {
    // todo: set donation amount to dollars, not cents

    mandrill.send( "kyle@kylehotchkiss.com", subject, data, template, function() {
        if ( typeof callback === "function" ) {
            callback();
        }
    });
};

var subscribe = function( donation, callback ) {
     mailchimp.subscribeEmail( donation.name, donation.email, [ donation.campaign, "donor" ], donation.ip, function() {
        if ( typeof callback === "function" ) {
            callback();
        }
     });
};

var slack = function( message, callback ) {
    request({
        json: true,
        body: { text: message },
        url: process.env.HEZ_SLACK_URL
    });
};

exports.postDonate = function( donation, callback ) {
    save( donation );

    donation.amount = ( donation.amount / 100 ).toFixed(2);

    slack("[donation] A $" + donation.amount + " donation for " + donation.campaignName + " was successfully processed" );
    receipt( donation, "Thank you for your donation!", "donation-receipt" );
    notification( donation, "[donation] A donation has been processed", "donation-notification" );
    subscribe( donation );

    // quickbooks
};

exports.postRefund = function( donation, callback ) {
    donation.refunded = true;

    save( donation );

    donation.amount = ( donation.amount / 100 ).toFixed(2);

    slack("[refund] A $" + donation.amount + " donation for " + donation.campaignName + " was successfully refunded" );
    receipt( donation, "Your donation has been refunded", "refund-receipt" );
    notification( donation, "[refund] A donation has been refunded", "refund-notification" );
};

exports.postSubscribe = function( subscription, callback ) {
    slack("[subscriptions] A $" + donation.amount + " subscription for " + donation.campaignName + " was successfully started" );
    receipt( subscription, "You now make monthly donations!", "subscription-receipt" );
    notification( subscription, "[subscriptions] A donor has enabled automatic donations", "subscription-notification" );
};

exports.postUnsubscribe = function( subscription, callback ) {
    slack("[subscriptions] A $" + donation.amount + " subscription for " + donation.campaignName + " was canceled" );
    receipt( subscription, "You have disabled monthly donations", "unsubscription-receipt" );
    notification( subscription, "[subscriptions] A donor has disabled automatic donations", "unsubscription-notification" );
};

//
// Illuminate Nations - Hezekiah v.0.3.0
// Copyright 2013-2014 Illuminate Nations
// Released under the General Public Licence
// Maintained by Kyle Hotchkiss <kyle@illuminatenations.org>
//

var hooks = require("../library/hooks.js");
var stripe = require("../library/stripe.js");

exports.dispatcher = function( req, res ) {
	var stripeEvent = req.body;

	if ( stripeEvent.type === "charge.refunded" || stripeEvent.type === "charge.dispute.funds_withdrawn" ) {
        console.log( stripeEvent );

        // Set transactions to "refunded"
    } else if ( stripeEvent.type === "invoice.payment_succeeded" ) {
		var transaction = stripeEvent.data;
		var customer = transaction.customer;
		var subscription = transaction.subscription;

        var donation = {
			recurring: true,
			customerID: customer,
			subscription: subscription,
			stripeID: transaction.charge,
			amount: transaction.amount_due,
			date: new Date(transaction.date).getTime(),
		};

		stripe.customers.retrieveSubscription( subscription, customer, function( error, subscription ) {
			donation.ip = subscription.metadata.ip;
			donation.name = subscription.metadata.name;
			donation.email = subscription.metadata.email;
			donation.postal = subscription.metadata.postal;
			donation.campaign = subscription.metadata.campaign;
			donation.campaignName = ssubscription.metadata.campaignName;

			hook.postDonate( donation );
		});
    } else if ( stripeEvent.type === "customer.subscription.deleted" ) {
        console.log( stripeEvent );

        // Delete subscription
    }

	// plan changed, deleted,
	// customer deleted
	// throw Blunder issues

	res.send(200);
};

exports.backup = function( req, res ) {

};

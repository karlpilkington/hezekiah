//
// Illuminate Nations - Hezekiah v.0.3.0
// Copyright 2013-2014 Illuminate Nations
// Released under the General Public Licence
// Maintained by Kyle Hotchkiss <kyle@illuminatenations.org>
//

var mongoose = require("mongoose");
var validate = require("validator");

mongoose.connect( process.env.MONGO_URL );


//
// This is the schema for all indivdual donations. It keeps track of everything
// we need to legally track. However, it is most efficent to use these in
// combination with indivdual donors to grab lists of donations per donor.
//
var DonationSchema = mongoose.Schema({
    /* All Donations */
    id: {
        type: mongoose.Schema.Types.ObjectId
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    campaign: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validator: function( val ) {
            return validate.isEmail( val );
        }
    },
    stripeID: {
        type: String,
        required: true,
        validator: function( val ) {
            return ( validate.contains(val, "ch_") && validate.isLength(27) );
        }
    },
    refunded: {
        type: Boolean,
        default: false
    },


    /* Singular Donations */
    ip: {
        type: String,
        validator: function( val ) {
            return validate.isIP( val );
        }
    },
    source: {
        type: String
    },
    addressCity: {
        type: String
    },
    addressState: {
        type: String
    },
    addressStreet: {
        type: String
    },
    addressPostal: {
        type: String
    },
    addressCountry: {
        type: String
    },


    /* Monthly Donations */
    customerID: {
        type: String,
        validator: function( val ) {
            return ( validate.contains(val, "cus_") && validate.isLength(18) );
        }
    },
    recurring: {
        type: Boolean,
        default: false
    },


    /* Unused */
    // subcampaign: String
    // quickbooksID: String
});


//
// This are simple entites for indivdual donors, linking us with their prior
// donation history for reporting, simple donor counts, linking donations
// internally within Stripe, and allowing us to easily connect emails to Stripe
// customer IDs for future donations and recurring donation cancelations.
//
// Emails alone will be used to connect a new donation to a Customer. Email and
// postal shall be used to cancel a monthly donation.
//
var DonorSchema = mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validator: function( val ) {
            return validate.isEmail( val );
        }
    },
    customerID: {
        type: String,
        required: true,
        validator: function( val ) {
            return ( validate.contains(val, "cus_") && validate.isLength(18) );
        }
    },
    
    addressCity: {
        type: String
    },
    addressState: {
        type: String
    },
    addressStreet: {
        type: String
    },
    addressPostal: {
        type: String
    },
    addressCountry: {
        type: String
    },

    active: {
        type: Boolean
    }
});

exports.DonationModel = mongoose.model("Donation", DonationSchema);
exports.DonorModel = mongoose.model("Donor", DonorSchema);

import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({

    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required'],

    },
    phash: {
        type: String
    },
    salt: {
        type: String
    },
    alias: {
        type: String,
    },
    provider: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
    all_saved_scrapers : {
        type: Array,
    },
    api: {
        type: Object,
        api_keys: {
            type: Array
        },
        rate_limit: {
            type: Number
        },
    },
    subscription: {
        type: Object,
        subscribed: {
            type: Number
        },
        tier: {
            type: Number
        },
        scraper_storage: {
            type: Number
        },
        max_runtime: {
            type: Number
        },
        max_loop_iterations: {
            type: Number
        },
        subscription_end: {
        },
        subscribed_months: {
            type: Number
        },
    }


});

const User = models.User || model("User", UserSchema);

export default User;
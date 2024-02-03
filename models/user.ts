import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({

    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required'],

    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        match: [/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._ñÑ]+(?<![_.])$/, "Username invalid, it should contain 8-20 alphanumeric letters and be unique!"]


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
    api_options : {

        data_cleanup: {
            type: Boolean,
            required: [true, 'data_cleanup option is required']
        },
        multithreading: {
            type: Boolean,
            required: [true, 'multithreading option is required'],
        },
        multiprocessing: {
            type: Boolean,
            required: [true, 'multiprocess option is required'],
        },
        max_scrapes: {
            type: String,
            required: [true, 'max number of scrapes required'],
        }
    },
    api_interaction: {

        api_keys: {
            type: Array,
        },
        blocked: {
            type: Boolean,
        },
        price_per_request: {
        },
        sub_runtime: {
        },
        sub_id: {
        },
    },

    all_saved_scrapes : {
        type: Array,
    },


});

const User = models.User || model("User", UserSchema);

export default User;
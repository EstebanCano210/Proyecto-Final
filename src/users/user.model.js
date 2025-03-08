import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'CLIENT'],
        default: 'CLIENT',
    },
    estado: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    versionKey: false,
});

UserSchema.methods.toJSON = function () {
    const { __v, password, _id, ...user } = this.toObject();
    user.uid = _id;
    return user;
};

export default model('User', UserSchema);

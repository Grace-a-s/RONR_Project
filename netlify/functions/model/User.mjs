import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  pronouns: {
    type: String,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
}, {
  timestamps: true
});

userSchema.index({ username: 1 }, { unique: true, sparse: true });

const User = model('User', userSchema);

export default User;
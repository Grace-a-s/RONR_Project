import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  auth0Id: String,
  username: String,
  email: String,
  firstName: String,
  lastName: String,
}, {
  timestamps: true
});

const User = model('User', userSchema);

export default User;
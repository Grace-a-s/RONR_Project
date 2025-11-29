import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const membershipSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  committeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Committee',
    required: true
  },
  role: {
    type: String,
    enum: ["MEMBER", "CHAIR", "OWNER"],
  }
}, {
  timestamps: true
});

const Membership = model('Membership', membershipSchema);

export default Membership;
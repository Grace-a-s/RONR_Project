import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const motionSchema = new Schema({
  committeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Committee',
    required: true
  },
  authorId: {
    type: String,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["PROPOSED", "SECONDED", "VETOED", "DEBATE", "VOTING", "PASSED", "REJECTED"],
    default: "PROPOSED"
  }
}, {
  timestamps: true
});

const Motion = model('Motion', motionSchema);

export default Motion;
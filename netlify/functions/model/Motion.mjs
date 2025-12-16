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
    enum: ["PROPOSED", "SECONDED", "VETOED", "CHALLENGING_VETO", "DEBATE", "VOTING", "PASSED", "REJECTED", "VETO_CONFIRMED"],
    default: "PROPOSED"
  },
  vetoChallengeConducted: {
    type: Boolean,
    default: false
  },
  originalMotionId: {
    type: Schema.Types.ObjectId,
    ref: 'Motion',
    required: false,
    default: null
  }
}, {
  timestamps: true
});

const Motion = model('Motion', motionSchema);

export default Motion;
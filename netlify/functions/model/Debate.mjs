import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const debateSchema = new Schema({
  motionId: {
    type: Schema.Types.ObjectId,
    ref: 'Motion',
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: String,
    enum: ["SUPPORT", "OPPOSE", "NEUTRAL"],
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Debate = model('Debate', debateSchema);

export default Debate;
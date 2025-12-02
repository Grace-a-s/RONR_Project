import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const voteSchema = new Schema({
  motionId: {
    type: Schema.Types.ObjectId,
    ref: 'Motion',
    required: true
  },
  authorId: {
    type: String,
    ref: 'User',
    required: true
  },
  position: {
    type: String,
    enum: ["SUPPORT", "OPPOSE"],
    required: true
  }
}, {
  timestamps: true
});

const Vote = model('Vote', voteSchema);

export default Vote;
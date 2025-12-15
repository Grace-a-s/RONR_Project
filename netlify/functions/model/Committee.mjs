import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const committeeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  votingThreshold: {
    type: String,
    enum: ["MAJORITY", "SUPERMAJORITY"],
    default: "MAJORITY",
    required: true
  }
}, {
  timestamps: true
});

const Committee = model('Committee', committeeSchema);

export default Committee;
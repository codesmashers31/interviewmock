import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  expertId: { type: String, required: true },
  candidateId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  topics: [{ type: String }],
  price: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'Upcoming'],
    default: 'confirmed'
  },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;

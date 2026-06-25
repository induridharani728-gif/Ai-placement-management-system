import mongoose from 'mongoose';

const interviewExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published'
  },
  questions: [
    {
      type: {
        type: String,
        enum: ['mcq', 'coding', 'short-answer', 'descriptive'],
        default: 'mcq'
      },
      category: {
        type: String,
        default: 'coding'
      },
      question: {
        type: String,
        required: true
      },
      options: [String],
      correctAnswer: mongoose.Schema.Types.Mixed,
      allowedProgrammingLanguages: [String],
      starterCode: String,
      sampleInput: String,
      sampleOutput: String,
      explanation: String,
      maxMarks: {
        type: Number,
        default: 10
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('InterviewExam', interviewExamSchema);

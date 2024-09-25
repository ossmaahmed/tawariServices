const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      enum: ["fire", "help", "ambulance"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    dispatcher: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    longitude: {
      type: String,
      trim: true,
    },
    latitude: {
      type: String,
      trim: true,
    },
    media: {
      type: String,
      trim: true,
    },
    mediaType: {
      type: String,
      trim: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function imageUrl(doc) {
  if (doc.media) {
    doc.media = `${process.env.BASE_URL}/media/${doc.media}`;
  }
}

emergencySchema.post("init", imageUrl);
emergencySchema.post("save", imageUrl);

module.exports = new mongoose.model("Emergency", emergencySchema);

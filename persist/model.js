const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: { type: String, required: true },
  password: { type: String, required: true },
});

const threadSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, default: "" },
    description: { type: String, required: true, default: "" },
    // posts: { type: [postSchema], required: true, default: [] },
    category: { type: String, required: true, default: "" },
  },
  {
    timestamps: true,
    // toJSON: {virtuals:true}
  }
);

const User = mongoose.model("User", userSchema);
const Thread = mongoose.model("Thread", threadSchema);

module.exports = {
  User,
  Thread,
};

const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: String,
  password: String,
  posts: [{type: Schema.Types.ObjectId, ref: "Post"}]
});

const User = model("User", userSchema);

module.exports = User;

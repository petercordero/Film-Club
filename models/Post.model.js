const { Schema, model, now } = require("mongoose");

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    content: String,
    imageUrl: { type: String, default: 'https://media.comicbook.com/files/img/default-movie.png' },
    rating: Number,
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true
  }
);

const Post = model("Post", postSchema);

module.exports = Post;

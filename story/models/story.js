const mongoose = require("mongoose");
const storySchema = mongoose.Schema({
    title: {
      type: String,
      trim: true,
    },
    content :{
      type: String,
      trim: true,      
    },
    likes : {
      type: Number,
      trim: true
    },
    date: {
      type: Date,
    },
},
{ timestamps: true })

const story = mongoose.model("Story", storySchema, "Stories");

module.exports = {
  story : story,
};
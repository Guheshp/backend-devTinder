const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://Guheshpanjagall:qfA0iwoeN7EBpvhR@devtinder.6kstj.mongodb.net/DevTinder")
}
module.exports = { connectDB }

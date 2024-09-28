const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://Guheshpanjagall:Xuz7G3jJrzXeKuzi@devtinder.6kstj.mongodb.net/DevTinder")
}
module.exports = { connectDB }

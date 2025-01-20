"use strict";

const mongoose = require("mongoose");
const connectString = `mongodb+srv://datvminh07:SEljtn3fSoNadbd2@cluster0.qj9kf.mongodb.net/shopDb?retryWrites=true&w=majority&appName=Cluster0`;

class Database {
  constructor() {
    this.connect();
  }
  //connect
  connect(type = "mongodb") {
    //dev
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then((_) => console.log("connected MongoDb successfully"))
      .catch((err) => console.log("error connecting", err));
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;

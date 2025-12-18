import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replset;

export const connectTestDB = async () => {
  replset = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const uri = replset.getUri();
  
  await mongoose.connect(uri, {
    dbName: "test",
  });
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

export const closeTestDB = async () => {
  await mongoose.disconnect();
  if (replset) {
    await replset.stop();
  }
};

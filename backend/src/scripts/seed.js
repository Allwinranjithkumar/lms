const { saveStore } = require("../utils/store");
const { createSeedStore } = require("../data/seedData");

saveStore(createSeedStore());
console.log("Seeded backend/data/store.json");

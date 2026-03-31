const app = require("./src/app");
const connectToDB = require("./src/db/db");

const PORT = process.env.PORT;
connectToDB()
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

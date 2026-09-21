import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}
 
console.log("hi");

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

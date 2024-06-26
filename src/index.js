import express from "express";
import dotenv from "dotenv";
// import { notFound } from "./src/middlewares/notFound.js";
// import { handleError } from "./src/middlewares/handleError.js";
// import notesRoute from "./src/resources/notes/notes.routes.js";
import customerRoute from './route/userRout.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;



//middleware
app.use(express.json());

// api routes
app.use("/api/v1/customer", customerRoute);

// app.use(notFound);
// app.use(handleError);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
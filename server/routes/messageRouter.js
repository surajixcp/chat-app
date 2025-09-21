import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersFortSidebar, markMessageAsSeen, sendMessage } from  "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersFortSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
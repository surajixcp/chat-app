import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js"

// Get all users expcept the logged in user
export const getUsersFortSidebar = async (req,res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password")

        // count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async(user)=>{
            const message = await Message.find({senderId: user._id, receiverId:userId, seen:false})
            if(message.length > 0){
                unseenMessages[user._id] = message.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Get all message for selected user
export const getMessages = async(req,res) =>{
    try{
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {receiverId: myId, senderId: selectedUserId},
            ]

        })
        await Message.updateMany({senderId : selectedUserId, receiverId: myId},
            {seen: true})
            res.json({success: true, messages})
        }

    catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//  api to mark message as seen using message id
export const markMessageAsSeen = async(req,res)=>{
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen: true})
        res.json({success: true})
    } catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Send message to selected user
export const sendMessage = async (req,res) => {
    try{
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        console.log('Send message request:', { senderId, receiverId, text: text ? text.substring(0, 50) + '...' : 'no text', hasImage: !!image });

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        console.log('Message created:', newMessage._id);

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        console.log('Receiver socket ID:', receiverSocketId);
        console.log('User socket map:', userSocketMap);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
            console.log('Message emitted to receiver');
        } else {
            console.log('Receiver not online or socket not found');
        }
        res.json({success: true, newMessage})
    } catch(error){
        console.log('Send message error:', error.message);
        res.json({success: false, message: error.message})
    }
}

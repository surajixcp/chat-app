import { useContext, useEffect, useState } from "react";
import { createContext }  from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children}) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext);

    // Debug socket connection
    useEffect(() => {
        if (socket) {
            console.log('Socket connected:', socket.connected);
            socket.on('connect', () => {
                console.log('Socket connected successfully');
            });
            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });
            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        } else {
            console.log('Socket not available');
        }
    }, [socket]);

    // function to get all users for sidebar
    const getUsers =  async () => {
        try {
            const {data} =  await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error){
            toast.error(error.message);

        }
    }

    // function to get message for selected user
    const getMessages = async (userId) => {
        try{
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
            }
        } catch (error){
            toast.error(error.message);

        }
    }

    //  function to send message to selected user
    const sendMessage = async (messageData)=>{
        try{
            console.log('Sending message to:', selectedUser._id, 'Message data:', messageData);
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            console.log('Send message response:', data);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
                console.log('Message sent successfully');
            } else{
                toast.error(data.message);
                console.error('Send message failed:', data.message);
            }
        } catch (error){
            toast.error(error.message);
            console.error('Send message error:', error);
        }

    }

    //  function to subscribe to messages for selected user
    const subscribeToMessages = async () =>{
        if(!socket) return;
        socket.on("newMessage", (newMessage)=>{
            console.log('Received new message:', newMessage);
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    // function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    },[socket,selectedUser])


    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
    }


    return (
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
    )
}

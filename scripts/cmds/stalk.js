const axios = require('axios');

module.exports = {
    config: {
        name: "stalk",
        aliases: [],
        version: "1.0", 
        author: "ARIYAN",
        description: {
            vi: "Thu thập thông tin từ một người dùng trên Facebook.",
            en: "Retrieve information about a user on Facebook."
        },
        category: "Tools",
        guide: {
            vi: "{pn} <@mention hoặc trả lời tin nhắn của người dùng>",
            en: "{pn} <@mention or reply to a message of the user>"
        }
    },

    onStart: async function ({ api, args, event }) {
        let userId;
        let userName;

        try {
            if (event.type === "message_reply") {
                userId = event.messageReply.senderID;
                const user = await api.getUserInfo(userId);
                userName = user[userId].name;
            } else {
                const input = args.join(" ");

                if (event.mentions && Object.keys(event.mentions).length > 0) {
                    userId = Object.keys(event.mentions)[0];
                    const user = await api.getUserInfo(userId);
                    userName = user[userId].name;
                } else if (/^\d+$/.test(input)) {
                    userId = input;
                    const user = await api.getUserInfo(userId);
                    userName = user[userId].name;
                } else if (input.includes("facebook.com")) {
                    const { findUid } = global.utils;
                    let linkUid;
                    try {
                        linkUid = await findUid(input);
                    } catch (error) {
                        console.error(error);
                        return api.sendMessage(
                            "⚠️ |  I couldn't find the user ID from the provided link. Please try again with the user ID.\n\nExample ➾ .stalk 100073291639820",
                            event.threadID
                        );
                    }
                    if (linkUid) {
                        userId = linkUid;
                        const user = await api.getUserInfo(userId);
                        userName = user[userId].name;
                    }
                } else {
                    userId = event.senderID;
                    const user = await api.getUserInfo(userId);
                    userName = user[userId].name;
                }
            }

            const response = await axios.get(`https://noobs-apihouse.onrender.com/dipto/fbinfo?id=${userId}&key=dipto008`);
            const { data, photo } = response.data;

            const formattedData = data.split('\n').filter(item => item.trim() !== '');
            const formattedResponse = formattedData.map(item => item.trim()).join('\n');

            await api.sendMessage({
                body: `${formattedResponse}`,
                attachment: await global.utils.getStreamFromURL(photo)
            }, event.threadID);
        } catch (error) {
            console.error('Error fetching stalk data:', error);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        }
    }
};

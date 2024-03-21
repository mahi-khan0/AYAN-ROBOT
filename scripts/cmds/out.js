module.exports = {
  config: {
    name: "out",
    aliases: ["l"],
    version: "1.0",
    author: "Alfred",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "remove bot from the box"
    },
    longDescription: {
      en: "remove bot from the group"
    },
    category: "owner",
    guide: {
      en: ""
    }
  },
  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
        if (!isNaN(args[0])) return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
  }
};

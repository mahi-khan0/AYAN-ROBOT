module.exports = {
  config: {
    name: "sing",
    version: "1.0",
    author: "RUBISH",
    role: 0,
    shortDescription: {
      vi: "Tìm kiếm nhạc và nghe.",
      en: "Search for music and listen."
    },
    longDescription: {
      vi: "Lệnh `music` cho phép bạn tìm kiếm bản nhạc và nghe trực tiếp mà không cần trả lời bằng số.",
      en: "The `music` command allows you to search for music and listen directly without replying with numbers."
    },
    category: "media",
    guide: {
      en: "{pn} <song name>"
    }
  },
  
  onStart: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const ytdl = require("ytdl-core");
    const yts = require("yt-search");

    const input = event.body;
    const text = input.substring(12);
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | Please enter a music name.", event.threadID);
    }

    data.shift();
    const song = data.join(" ");

    try {
      const searchingMessage = await api.sendMessage(`⏳ | Searching Music "${song}"`, event.threadID);

      const searchResults = await yts(song);
      if (!searchResults.videos.length) {
        await api.sendMessage("Error: Invalid request.", event.threadID);
        await api.unsendMessage(searchingMessage.messageID);
        return;
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      const stream = ytdl(videoUrl, { filter: "audioonly" });

      const fileName = `music.mp3`;
      const filePath = __dirname + `/tmp/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('response', () => {
        console.info('[DOWNLOADER]', 'Starting download now!');
      });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
      });

      stream.on('end', async () => {
        console.info('[DOWNLOADER] Downloaded');

        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          await api.sendMessage('[ERR] The file could not be sent because it is larger than 25MB.', event.threadID);
        } else {
          const message = {
            body: `
♡ˍˍˍ𝐌𝐔𝐒𝐈𝐂 𝐅𝐎𝐔𝐍𝐃ˍˍˍ♡

➺ 𝐒𝐎𝐍𝐆 𝐓𝐈𝐓𝐋𝐄: ${video.title}

➺ 𝐀𝐑𝐓𝐈𝐒𝐓: ${video.author.name}

♡ˍˍˍˍ𝐉𝐎𝐃𝐎✍︎𝐁𝐎𝐓𖤍ˍˍˍˍ♡`,
            attachment: fs.createReadStream(filePath)
          };

          await api.sendMessage(message, event.threadID);
        }

        await api.unsendMessage(searchingMessage.messageID);
      });
    } catch (error) {
      console.error('[ERROR]', error);
      await api.sendMessage('An error occurred while processing the command.', event.threadID);
    }
  }      
    }

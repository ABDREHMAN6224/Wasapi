const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
// import translate from "translate";
let translate;
import("translate").then((module) => {
  translate = module.default;
});

let audios = ["1.opus", "2.opus", "3.opus"];

let responses = [
  `Dear [Friend's Name],

I hope this message finds you well! I’m excited to invite you to a cozy dinner at my place this [specific day, e.g., Friday] evening.

I've been wanting to catch up and thought it would be wonderful to share a meal together. I’ll be preparing some of our favorite dishes, and of course, there will be plenty of good conversation and laughter.

Details:
Date: [Date]
Time: [Time]
Location: [Your Address]

Please let me know if you can make it. I’m looking forward to a great evening with you!

Warm regards,

[Your Name]`,
  `The solar system is like a big family with the Sun at its center, providing light and heat. Eight planets, including Earth, orbit the Sun like a merry-go-round. Jupiter is the largest planet, and Mercury is the smallest and closest to the Sun. Our Earth has one moon, and there are also asteroids and comets zooming around. The solar system is a fun, busy place with many exciting things moving together in space!`,
  `

To play a cover drive in cricket, start with a balanced stance, feet shoulder-width apart, and knees slightly bent. Lift your bat in a comfortable backlift position as the bowler delivers. Step forward with your front foot towards the ball, keeping your head steady and eyes focused. Swing the bat straight through the line of the ball, aiming to make contact with the middle of the bat, and follow through smoothly in the direction you want the ball to travel.`,
];

// translate.engine = "google";

// Create a new client instance
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // headless: false,
  },
});
const qrcode = require("qrcode-terminal");

// When the client is ready, run this code (only once)
client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", async () => {
  console.log("READY");
  const debugWWebVersion = await client.getWWebVersion();
  console.log(`WWebVersion = ${debugWWebVersion}`);

  client.pupPage.on("pageerror", function (err) {
    console.log("Page error: " + err.toString());
  });
  client.pupPage.on("error", function (err) {
    console.log("Page error: " + err.toString());
  });
});
client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

// When the client received QR-Code
let pairingCodeRequested = false;
client.on("qr", async (qr) => {
  console.log("QR RECEIVED", qr);

  // paiuting code example
  const pairingCodeEnabled = false;
  if (pairingCodeEnabled && !pairingCodeRequested) {
    const pairingCode = await client.requestPairingCode(
      process.env.PHONE_NUMBER
    ); // enter the target phone number
    console.log("Pairing code enabled, code: " + pairingCode);
    pairingCodeRequested = true;
  }
});

client.on("message", async (msg) => {
  console.log("MESSAGE RECEIVED", msg);
  let chat = await msg.getChat();
  console.log(chat.name);
  if (chat.name !== "Abdullah Mash") {
    return;
  }
  chat.sendSeen();
  const body = msg.body.toLowerCase();

  if (body == "1" || body == "2" || body == "3") {
    let index = parseInt(body) - 1;
    if (index < 0 || index >= responses.length) {
      let text = "Invalid choice. Please choose a valid option.";
      const data = await translate(text, { from: "en", to: "ur" });
      console.log(data);
      msg.reply(data);
      return;
    }
    let response = responses[index];
    const data = await translate(response, { from: "en", to: "ur" });
    console.log(data);
    msg.reply(data);
    let audio = audios[index];

    let media = MessageMedia.fromFilePath(audio);
    await client.sendMessage(msg.from, media);
  } else {
    let reply = `Hello. I am BaatGPT. Your personal assistant. Choose one of the following:
  1️⃣: Write a dinner invitation for a friend.
  2️⃣: Explain solar system to a 5 year old.
  3️⃣: Recommend good books to read.`;
    const data = await translate(reply, { from: "en", to: "ur" });
    console.log(data);
    msg.reply(data);
  }
});

client.on("vote_update", (vote) => {
  /** The vote that was affected: */
  console.log(vote);
});
// Start your client
client.initialize();

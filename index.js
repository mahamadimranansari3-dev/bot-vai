const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const axios = require('axios')

const GROQ_API_KEY = "PASTE_YOUR_KEY_HERE"

async function getReply(msg) {
  try {
    const r = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: `Tu Kathmandu ka famous funny group manager 'bot-vai' hai. Tera naam bot-vai hai. Har reply me thoda attitude, Hinglish, 1-2 line me savage funny reply de, gali mat de. Msg: ${msg}` }]
    }, { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } })
    return r.data.choices[0].message.content
  } catch(e){ return "Are vai thoda ruk, bot-vai ka dimag hang ho gaya 😅" }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, printQRInTerminal: true })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    if (!m.key.remoteJid.endsWith('@g.us')) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text
    if (!text) return
    const reply = await getReply(text)
    await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m })
  })
}
start()

require('dotenv').config()
import {Telegraf, Context, Markup} from 'telegraf'
//import mineflayer from 'mineflayer'
const mineflayer = require('mineflayer')
import { MTProto } from '@mtproto/core'
const { sleep } = require('@mtproto/core/src/utils/common');
const api_id =  Number(process.env.API_ID);
const api_hash = process.env.API_HASH;
const mtproto = new MTProto({ api_id, api_hash,});
const allowed = require('./allowedUsers.json')
const banned = require('./bannedUsers.json')
const fs = require('fs')
const mc = mineflayer.createBot({
    host: process.env.MC_SERVER, // optional
    port: process.env.MC_PORT,       // optional
    username: process.env.USERNAME, // email and password are required only for
    password: `#${process.env.PASSWORD}`,          // online-mode=true servers
    auth: process.env.AUTH      // optional; by default uses mojang, if using a microsoft account, set to 'microsoft' 
  })
const PORT = Number(process.env.PORT) || 3000
const bot = new Telegraf(process.env.BOT_TOKEN)

const api = {
    call(method, params, options = {}) {
      return mtproto.call(method, params, options)
      .catch(async error => {  
        const { error_code, error_message } = error;
  
        if (error_code === 420) {
            console.log(`${method} error:`, error);
          const seconds = +error_message.split('FLOOD_WAIT_')[1];
          const ms = seconds * 1000;
  
          await sleep(ms);
  
          return this.call(method, params, options);
        }
  
        if (error_code === 303) {
            console.log(`${method} error:`, error);
          const [type, dcId] = error_message.split('_MIGRATE_');
  
          // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
          if (type === 'PHONE') {
            await mtproto.setDefaultDc(+dcId);
          } else {
            options = {
              ...options,
              dcId: +dcId,
            };
          }
  
          return this.call(method, params, options);
        }
  
        return Promise.reject(error);
      })
    },
};

function userNotAuthorized(bot:Telegraf, mc, player){
    mc.chat(`/gamemode spectator ${player.username}`)
    bot.telegram.sendMessage(process.env.GROUP, `<b>Unknown User: ${player.username} Joined the server!</b> \nUser placed in spectator. Allow survival access?`, {reply_markup:{
        inline_keyboard:[[Markup.button.callback(`Set ${player.username} gamemode survival`, `allow_${player.username}`)], [Markup.button.callback(`Kick ${player.username}`, `kick_${player.username}`)]]
        },
        parse_mode:'HTML'
})
}

mc.on('playerJoined', ((player) => {
    if(player.username == mc.username) return null
    if(allowed[player.username]) return null
    if(banned[player.username]) return mc.chat(`/kick ${player.username} [blacklist]`)
   console.log(player.username)
   api.call('contacts.resolveUsername', {username: player.username})
   .then(async (res) => {
       console.log(res.peer.user_id)
       bot.telegram.getChatMember(process.env.GROUP, res.peer.user_id)
       .then((res) => {
           if(res.status != `creator` && res.status !=  `administrator` && res.status != `member`) return userNotAuthorized(bot, mc, player)
           console.log('user in chat', res)
       })
       .catch((err) => {
               userNotAuthorized(bot, mc, player)
       })
   })
   .catch((err) => console.error(err))
}))

bot.action(/(allow)\w+/g, ctx => {
    if("data" in ctx.callbackQuery){
        let [identifier, username] = ctx.callbackQuery.data.split('_')
        mc.chat(`/gamemode survival ${username}`)
        allowed[username] = true
        ctx.answerCbQuery(`${username} gamemode switched to survival`)
        fs.writeFileSync('./allowedUsers.json', JSON.stringify(allowed))
    } 
})
bot.action(/(kick)\w+/g, ctx => {
    if("data" in ctx.callbackQuery){
        let [identifier, username] = ctx.callbackQuery.data.split('_')
        mc.chat(`/kick ${username} [blacklist]`)
        banned[username] = true
        ctx.answerCbQuery(`${username} was kicked from the server`)
        fs.writeFileSync('./allowedUsers.json', JSON.stringify(banned))
    } 
})
mc.on('error', err => console.log(err))
bot.launch({
    webhook:{
        domain: process.env.DOMAIN,
        port:PORT
    }
})
.then(() => {
    console.log(`telegraf listening on ${PORT}`);
    
})
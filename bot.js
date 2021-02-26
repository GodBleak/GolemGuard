"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require('dotenv').config();
var telegraf_1 = require("telegraf");
//import mineflayer from 'mineflayer'
var mineflayer = require('mineflayer');
var core_1 = require("@mtproto/core");
var sleep = require('@mtproto/core/src/utils/common').sleep;
var api_id = Number(process.env.API_ID);
var api_hash = process.env.API_HASH;
var mtproto = new core_1.MTProto({ api_id: api_id, api_hash: api_hash });
var allowed = require('./allowedUsers.json');
var banned = require('./bannedUsers.json');
var fs = require('fs');
var mc = mineflayer.createBot({
    host: process.env.MC_SERVER,
    port: process.env.MC_PORT,
    username: process.env.USERNAME,
    password: "#" + process.env.PASSWORD,
    auth: process.env.AUTH // optional; by default uses mojang, if using a microsoft account, set to 'microsoft' 
});
var PORT = Number(process.env.PORT) || 3000;
var bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
var api = {
    call: function (method, params, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return mtproto.call(method, params, options)["catch"](function (error) { return __awaiter(_this, void 0, void 0, function () {
            var error_code, error_message, seconds, ms, _a, type, dcId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        error_code = error.error_code, error_message = error.error_message;
                        if (!(error_code === 420)) return [3 /*break*/, 2];
                        console.log(method + " error:", error);
                        seconds = +error_message.split('FLOOD_WAIT_')[1];
                        ms = seconds * 1000;
                        return [4 /*yield*/, sleep(ms)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, this.call(method, params, options)];
                    case 2:
                        if (!(error_code === 303)) return [3 /*break*/, 6];
                        console.log(method + " error:", error);
                        _a = error_message.split('_MIGRATE_'), type = _a[0], dcId = _a[1];
                        if (!(type === 'PHONE')) return [3 /*break*/, 4];
                        return [4 /*yield*/, mtproto.setDefaultDc(+dcId)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        options = __assign(__assign({}, options), { dcId: +dcId });
                        _b.label = 5;
                    case 5: return [2 /*return*/, this.call(method, params, options)];
                    case 6: return [2 /*return*/, Promise.reject(error)];
                }
            });
        }); });
    }
};
function userNotAuthorized(bot, mc, player) {
    mc.chat("/gamemode spectator " + player.username);
    bot.telegram.sendMessage(process.env.GROUP, "<b>Unknown User: " + player.username + " Joined the server!</b> \nUser placed in spectator. Allow survival access?", { reply_markup: {
            inline_keyboard: [[telegraf_1.Markup.button.callback("Set " + player.username + " gamemode survival", "allow_" + player.username)], [telegraf_1.Markup.button.callback("Kick " + player.username, "kick_" + player.username)]]
        }, parse_mode: 'HTML' });
}
mc.on('playerJoined', (function (player) {
    if (player.username == mc.username)
        return null;
    if (allowed[player.username])
        return null;
    if (banned[player.username])
        return mc.chat("/kick " + player.username + " [blacklist]");
    console.log(player.username);
    api.call('contacts.resolveUsername', { username: player.username })
        .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log(res.peer.user_id);
            bot.telegram.getChatMember(process.env.GROUP, res.peer.user_id)
                .then(function (res) {
                if (res.status != "creator" && res.status != "administrator" && res.status != "member")
                    return userNotAuthorized(bot, mc, player);
                console.log('user in chat', res);
            })["catch"](function (err) {
                userNotAuthorized(bot, mc, player);
            });
            return [2 /*return*/];
        });
    }); })["catch"](function (err) { return console.error(err); });
}));
bot.action(/(allow)\w+/g, function (ctx) {
    if ("data" in ctx.callbackQuery) {
        var _a = ctx.callbackQuery.data.split('_'), identifier = _a[0], username = _a[1];
        mc.chat("/gamemode survival " + username);
        allowed[username] = true;
        ctx.answerCbQuery(username + " gamemode switched to survival");
        fs.writeFileSync('./allowedUsers.json', JSON.stringify(allowed));
    }
});
bot.action(/(kick)\w+/g, function (ctx) {
    if ("data" in ctx.callbackQuery) {
        var _a = ctx.callbackQuery.data.split('_'), identifier = _a[0], username = _a[1];
        mc.chat("/kick " + username + " [blacklist]");
        banned[username] = true;
        ctx.answerCbQuery(username + " was kicked from the server");
        fs.writeFileSync('./allowedUsers.json', JSON.stringify(banned));
    }
});
mc.on('error', function (err) { return console.log(err); });
bot.launch({
    webhook: {
        domain: process.env.DOMAIN,
        port: PORT
    }
})
    .then(function () {
    console.log("telegraf listening on " + PORT);
});

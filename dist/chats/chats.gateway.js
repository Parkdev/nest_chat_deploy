"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatsGateway = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chattings_model_1 = require("./models/chattings.model");
const sockets_model_1 = require("./models/sockets.model");
const mongoose_2 = require("mongoose");
let ChatsGateway = class ChatsGateway {
    constructor(chattingModel, socketModel) {
        this.chattingModel = chattingModel;
        this.socketModel = socketModel;
        this.logger = new common_1.Logger('chat');
        this.logger.log('constructor');
    }
    afterInit() {
        console.log('소켓 서버가 초기화되었습니다.');
        this.logger.log('init');
    }
    handleConnection(socket) {
        console.log('클라이언트 접속');
        this.logger.log(`connect : ${socket.id} ${socket.nsp.name}`);
    }
    async handleDisconnect(socket) {
        console.log('클라이언트 접속 해제');
        const user = await this.socketModel.findOne({ id: socket.id });
        if (user) {
            socket.broadcast.emit('user_disconnected', user.username);
            await user.deleteOne();
            console.log('유저 삭제');
        }
        this.logger.log(`disconnect : ${socket.id} ${socket.nsp.name}`);
    }
    async handleNewUser(username, socket) {
        const exist = await this.socketModel.exists({ username: username });
        if (exist) {
            username = `${username}_${Math.floor(Math.random() * 100)}`;
            await this.socketModel.create({
                id: socket.id,
                username,
            });
        }
        else {
            await this.socketModel.create({
                id: socket.id,
                username,
            });
        }
        const count = await this.socketModel.countDocuments();
        socket.broadcast.emit('user_connected', { count, username });
        return { username, count };
    }
    async handleSubmitChat(chat, socket) {
        const socketObj = await this.socketModel.findOne({ id: socket.id });
        console.log('유저찾음', socketObj);
        await this.chattingModel.create({
            user: socketObj,
            chat: chat,
        });
        socket.broadcast.emit('new_chat', {
            chat,
            username: socketObj.username,
        });
    }
};
exports.ChatsGateway = ChatsGateway;
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatsGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('new_user'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleNewUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('submit_chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleSubmitChat", null);
exports.ChatsGateway = ChatsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'chatting' }),
    __param(0, (0, mongoose_1.InjectModel)(chattings_model_1.Chatting.name)),
    __param(1, (0, mongoose_1.InjectModel)(sockets_model_1.Socket.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ChatsGateway);
//# sourceMappingURL=chats.gateway.js.map
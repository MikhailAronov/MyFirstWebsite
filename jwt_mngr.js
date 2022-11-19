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
var JWT_token_manager = /** @class */ (function () {
    function JWT_token_manager() {
        this.crypt = require('crypto');
        this.jwt = require('jsonwebtoken');
    }
    JWT_token_manager.prototype.accessTokenAsync = function (uniq_id, access_secret, expires) {
        if (expires === void 0) { expires = 1800; }
        return __awaiter(this, void 0, void 0, function () {
            var accessToken;
            return __generator(this, function (_a) {
                console.log('uniq_id: ', uniq_id);
                accessToken = this.jwt.sign({ ID: uniq_id }, access_secret, { expiresIn: expires });
                /* console.log('Access secret ket: ', access_secret.toString('base64url'));
                console.log('Access token made by JWT module: ', accessToken);
                console.log('accessToken (jwt.sign) type of: ', typeof accessToken); */
                return [2 /*return*/, 'Bearer ' + accessToken];
            });
        });
    };
    JWT_token_manager.prototype.refreshTokenAsync = function (refresh_secret) {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken;
            return __generator(this, function (_a) {
                refreshToken = this.jwt.sign({ hm: 'skibidi vapa dub' }, refresh_secret);
                /* console.log('Refresh secret ket: ', refresh_secret.toString('base64url'));
                console.log('Refresh token made by JWT module: ', refreshToken);
                console.log('refreshToken (jwt.sign) type of: ', typeof refreshToken); */
                return [2 /*return*/, 'Bearer ' + refreshToken];
            });
        });
    };
    JWT_token_manager.prototype.tokenValidation = function (token, secret) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                try {
                    token = token.split(' ')[1];
                    payload = this.jwt.verify(token, secret);
                    return [2 /*return*/, true];
                }
                catch (err) {
                    console.log('token invalid or error');
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    JWT_token_manager.prototype.newSecret = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.crypt.randomBytes(32)];
            });
        });
    };
    return JWT_token_manager;
}());
module.exports = {
    JWT_token_manager: JWT_token_manager
};

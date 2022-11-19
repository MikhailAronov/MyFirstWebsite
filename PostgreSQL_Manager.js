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
var PostgreSQL_db_manager = /** @class */ (function () {
    function PostgreSQL_db_manager() {
        this.Pool = require('pg').Pool;
        this.Client = require('pg').Client;
    }
    PostgreSQL_db_manager.prototype.connectTodb_pool = function (user, host, database, password, port) {
        if (user === void 0) { user = 'me'; }
        if (host === void 0) { host = 'localhost'; }
        if (database === void 0) { database = 'newbeginnings'; }
        if (password === void 0) { password = '123'; }
        if (port === void 0) { port = 5432; }
        this.pool = new this.Pool({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port
        });
        this.db = this.pool;
        console.log('Connected to database as pool successfully...');
    };
    PostgreSQL_db_manager.prototype.connectTodb_client = function (user, host, database, password, port) {
        if (user === void 0) { user = 'me'; }
        if (host === void 0) { host = 'localhost'; }
        if (database === void 0) { database = 'newbeginnings'; }
        if (password === void 0) { password = '123'; }
        if (port === void 0) { port = 5432; }
        this.client = new this.Client({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port
        });
        this.db = this.client;
        console.log('Connected to database as client successfully...');
    };
    PostgreSQL_db_manager.prototype.createRows = function (table, columns, values) {
        return __awaiter(this, void 0, void 0, function () {
            var createPromise;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createPromise = new Promise(function (resolve, reject) {
                            _this.db.query("INSERT INTO ".concat(table, " ").concat(columns, " VALUES ").concat(values, ";"), function (err) {
                                if (err)
                                    throw err;
                                console.log('Postgres: Rows were created...');
                                resolve();
                            });
                        });
                        return [4 /*yield*/, createPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgreSQL_db_manager.prototype.readRows = function (table, columns, where) {
        return __awaiter(this, void 0, void 0, function () {
            var readPromise, readResult;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        readPromise = new Promise(function (resolve, reject) {
                            _this.db.query("SELECT ".concat(columns, " FROM ").concat(table, " WHERE ").concat(where, ";"), function (err, result) {
                                if (err)
                                    throw err;
                                console.log('Postgres: Rows were read...');
                                resolve(result.rows);
                            });
                        });
                        return [4 /*yield*/, readPromise];
                    case 1:
                        readResult = _a.sent();
                        console.log(readResult);
                        return [2 /*return*/, readResult];
                }
            });
        });
    };
    PostgreSQL_db_manager.prototype.updateRows = function (table, columns, values, where) {
        return __awaiter(this, void 0, void 0, function () {
            var updatePromise;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatePromise = new Promise(function (resolve, reject) {
                            _this.db.query("UPDATE ".concat(table, " SET ").concat(columns, " = ").concat(values, " WHERE ").concat(where, ";"), function (err) {
                                if (err)
                                    throw err;
                                console.log('Postgres: Rows were updated...');
                                resolve();
                            });
                        });
                        return [4 /*yield*/, updatePromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgreSQL_db_manager.prototype.deleteRows = function (table, where) {
        return __awaiter(this, void 0, void 0, function () {
            var deletePromise;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deletePromise = new Promise(function (resolve, reject) {
                            _this.db.query("DELETE FROM ".concat(table, " WHERE ").concat(where, ";"), function (err) {
                                if (err)
                                    throw err;
                                console.log('Postgres: Rows were deleted...');
                                resolve();
                            });
                        });
                        return [4 /*yield*/, deletePromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgreSQL_db_manager.prototype.customQuery = function (customQuery) {
        return __awaiter(this, void 0, void 0, function () {
            var customQueryPromise, customQueryResult;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        customQueryPromise = new Promise(function (resolve, reject) {
                            _this.db.query(customQuery, function (err, result) {
                                if (err)
                                    throw err;
                                console.log('Postgres: custom query was done...');
                                resolve(result.rows);
                            });
                        });
                        return [4 /*yield*/, customQueryPromise];
                    case 1:
                        customQueryResult = _a.sent();
                        return [2 /*return*/, customQueryResult];
                }
            });
        });
    };
    return PostgreSQL_db_manager;
}());
/*
async function main() : Promise<void> {
    var db1 = new PostgreSQL_db_manager();

    db1.connectTodb_pool('me', 'localhost', 'newbeginnings', '123', 5432);
    
    /* await db1.createRows('first_test_table', '(test_int_column, test_varchar_column)', '(3, \'createRowCommand\')');

    console.log(await db1.readRows('first_test_table', 'test_int_column, test_varchar_column', 'id > 0'));

    await db1.updateRows('first_test_table', '(test_int_column, test_varchar_column)', '(18, \'updateRowCommand\')', 'id=1');

    await db1.deleteRows('first_test_table', 'id=2');

    await db1.customQuery('INSERT INTO first_test_table (test_int_column, test_varchar_column) VALUES (11, \'First statement in custom query\'); INSERT INTO first_test_table (test_int_column, test_varchar_column) VALUES (22, \'Second statement in custom query\');');
}
main();
 */
module.exports = {
    PostgreSQL_db_manager
};

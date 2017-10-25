const co = require("co");
const knex = require("knex");
const config = require("./config");

const dbs = {};

function Mysql() {};
Mysql.prototype.login = function(address, database, user, password) {
    const that = this;
    return co(function*() {
        let ss = address.split(":");
        let host = ss[0];
        let port;
        if (ss.length > 1) {
            port = ss[1];
        } else {
            port = 3306;
        }
        that.knex = knex({
            client: "mysql",
            connection: {
                host: host,
                port: port,
                user: user,
                password: password,
                database: database
            },
            pool: { min: 1, max: 1 },
            debug: config.dev
        });
        try {
            yield that.knex.raw("show databases");
        } catch (msg) {
            return msg;
        }
    });
};
Mysql.prototype.databases = function() {
    const that = this;
    return co(function*() {
        let data = yield that.knex.raw("show databases");
        return data[0].map(x => x.Database);
    });
};
Mysql.prototype.tables = function() {
    const that = this;
    return co(function*() {
        let data = yield that.knex.raw("show tables");
        return data[0].map(x => Object.values(x)[0]);
    });
};
Mysql.prototype.select = function(table, where, order, limit, offset) {
    const that = this;
    return co(function*() {
        let sql = that.knex(table);
        if (where) sql = sql.where(where);
        if (order) sql = sql.orderByRaw(order);
        let total = yield sql.clone().count();
        total = Object.values(total[0])[0];
        let list = yield sql.limit(limit || 30).offset(offset || 0);
        let data = yield that.knex.raw("describe " + table);
        data = data[0];
        let pk = [];
        let columns = [];
        for (let item of data) {
            columns.push({
                title: item.Field,
                dataIndex: item.Field,
                key: item.Field
            });
            if (item.Key === "PRI") {
                pk.push(item.Field);
            }
        }
        return { pk, columns, list, total };
    });
};
Mysql.prototype.raw = function(sql) {
    const that = this;
    return co(function*() {
        let data = yield that.knex.raw(sql);
        return data;
    });
};
Mysql.prototype.update = function(table, where, update) {
    const that = this;
    return co(function*() {
        table = that.knex(table);
        if (where) table = table.where(where);
        let data = yield table.update(update);
        return data;
    });
};
Mysql.prototype.delete = function(table, where) {
    const that = this;
    return co(function*() {
        table = that.knex(table);
        if (where) table = table.where(where);
        let data = yield table.del();
        return data;
    });
};
Mysql.prototype.insert = function(table, insert) {
    const that = this;
    return co(function*() {
        table = that.knex(table);
        let data = yield table.insert(insert);
        return data;
    });
};


dbs["mysql"] = Mysql;

module.exports = dbs;
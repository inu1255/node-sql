const co = require("co");
const Db = require("../common/db");

const kn = {};

exports.login = function(req, res) {
    return co(function*() {
        const body = req.body;
        const db = new Db[body.type];
        if (!db) {
            return 404;
        }
        let key = `${body.type}://${body.user}:${body.password}@${body.address}/${body.database}`;
        if (kn[key]) {
            req.session.db = key;
            return;
        }
        let msg = yield db.login(body.address, body.database, body.user, body.password);
        if (msg) {
            res.err(405, msg);
            req.session.db = "";
        } else {
            kn[key] = db;
            req.session.db = key;
        }
    });
};

exports.logout = function(req, res) {
    delete req.session.db;
};

exports.check = function(req, res) {
    return co(function*() {
        const knex = kn[req.session.db];
        if (!knex) {
            return 404;
        }
    });
};

exports.databases = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        return yield db.databases();
    });
};

exports.use = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        return yield db.use();
    });
};

exports.tables = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        return yield db.tables();
    });
};

exports.select = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        const body = req.body;
        return yield db.select(body.table, body.where, body.order, body.limit, body.offset);
    });
};

exports.insert = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        const body = req.body;
        yield db.insert(body.table, body.data);
    });
};

exports.update = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        const body = req.body;
        yield db.update(body.table, body.where, body.data);
    });
};

exports.delete = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        const body = req.body;
        yield db.delete(body.table, body.where);
    });
};

exports.raw = function(req, res) {
    return co(function*() {
        const db = kn[req.session.db];
        if (!db) {
            return 401;
        }
        const body = req.body;
        try {
            return yield db.raw(body.sql);
        } catch (error) {
            return [error];
        }
    });
};
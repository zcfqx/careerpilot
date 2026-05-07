const { initDatabase, getDatabase, saveDatabase } = require('./db');

class DatabaseWrapper {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await initDatabase();
    return this;
  }

  prepare(sql) {
    return new PreparedStatement(this.db, sql, this);
  }

  exec(sql) {
    this.db.run(sql);
    saveDatabase();
  }

  pragma(pragmaString) {
    this.db.run(`PRAGMA ${pragmaString}`);
    saveDatabase();
  }
}

class PreparedStatement {
  constructor(db, sql, wrapper) {
    this.db = db;
    this.sql = sql;
    this.wrapper = wrapper;
  }

  run(...params) {
    try {
      this.db.run(this.sql, params);
      const lastInsertRowid = this.getLastInsertRowid();
      const changes = this.db.getRowsModified();
      saveDatabase();
      return {
        changes: changes,
        lastInsertRowid: lastInsertRowid
      };
    } catch (error) {
      throw error;
    }
  }

  get(...params) {
    try {
      const stmt = this.db.prepare(this.sql);
      stmt.bind(params);
      if (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        stmt.free();
        const result = {};
        columns.forEach((col, i) => {
          result[col] = values[i];
        });
        return result;
      }
      stmt.free();
      return undefined;
    } catch (error) {
      throw error;
    }
  }

  all(...params) {
    try {
      const results = [];
      const stmt = this.db.prepare(this.sql);
      stmt.bind(params);
      while (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        const row = {};
        columns.forEach((col, i) => {
          row[col] = values[i];
        });
        results.push(row);
      }
      stmt.free();
      return results;
    } catch (error) {
      throw error;
    }
  }

  getLastInsertRowid() {
    try {
      const result = this.db.exec('SELECT last_insert_rowid()');
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}

let wrapper = null;

async function getWrapper() {
  if (!wrapper) {
    wrapper = new DatabaseWrapper();
    await wrapper.init();
  }
  return wrapper;
}

module.exports = { getWrapper };
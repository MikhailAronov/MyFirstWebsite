class Mysql_database_manager {
    mysql;
    db;
    constructor () {
        this.mysql = require('mysql');

    }
    async connectToDatabase(connectionParams = {
        host     : '127.0.0.1',
        port     : '3306',
        user     : 'root',
        password : 'BjV13LcgY%7;u',
        database : 'AnonPF2EChat',
        multipleStatements: true
    }) {
        this.db = this.mysql.createConnection(connectionParams);
    }

    async createRows(table, columns, values) {
        try{
            if(columns.toString != '') {
                columns = '(' + columns + ')';
            }
            if(table === '' || values === '') {
                console.log('Enter table name or values');
                return;
            } 
            if(values != '') {
                values = '(' + values + ')';
            }
            let sql_request = `INSERT INTO ${table} ${columns} VALUES ${values};`;
            let endOfInsertionPromise = new Promise((resolve, reject) => {
                this.db.query(sql_request, (err) => {
                    if(err) {
                        throw err;
                        reject();
                    }
                    console.log('mysql.db: Data inserted successfully...');
                    resolve();
                });
            });
            await endOfInsertionPromise;
            return;
        } catch(err) {
            throw err;
        }
    }

    async readRows(table, columns, where) {
        try {
            if(table === '' || columns === '' || where === '') {
                console.log('Please, enter table, columns and values (string or array) and where condition (it\'s obligatory)');
                return;
            }
            let sql_request = `SELECT ${columns} FROM ${table} WHERE ${where};`;
            let endOfSelectPromise = new Promise((resolve, reject) => {
                this.db.query(sql_request, (err, result) => {
                    if(err) {
                        throw err;
                        reject();
                    }
                    console.log('mysql.db: Data read successfully...');
                    resolve(result);
                });
            });
            let endOfSelect = await endOfSelectPromise;
            return endOfSelect;
        } catch(err) {
            throw err;
        }
    }

    async updateRows(table, columns, values, where) {
        try{
            if (table === '' || columns === '' || values === '' || where === '') {
                console.log('Please, enter table (string or array), object (object) and where condition (it\'s obligatory)');
                return;
            }
            let columnsArr = columns.replace(' ', '').split(',');
            let valuesArr = values.replace(' ', '').split(',');
            if (columnsArr.length != valuesArr.length) {
                console.log('Amount of columns do not match with amount of values');
                return;
            }
            let setString = '';
            for(let k=0; k < columnsArr.length; k++) {
                setString += columnsArr[k] + ' = ' + `${valuesArr[k]}` + ',';
            }
            setString = setString.slice(0, -1);
            let sql_request = `UPDATE ${table} SET ${setString} WHERE ${where};`;
            let endOfUpdateionPromise = new Promise((resolve, reject) => {
                this.db.query(sql_request, (err) => {
                    if(err) {
                        throw err;
                        reject();
                    }
                    console.log('mysql.db: Data updated successfully...');
                    resolve();
                });
            });
            await endOfUpdateionPromise;
            return;
        } catch(err) {
            throw err;
        }
    }
    
    async deleteRows(table, where) {
        try {
            if(table === '' || where === '') {
                console.log('Please, enter table (string or array) and where condition (it\'s obligatory)');
                return;
            }
            let sql_request = `DELETE FROM ${table} WHERE ${where};`;
            let endOfDeletePromise = new Promise ((resolve, reject) => {
                this.db.query(sql_request, (err) => {
                    if(err) {
                        throw err;
                        reject();
                    }
                    console.log('mysql.db: Data deleted successfully...');
                    resolve();
                });
            });
            let endOfDelete = await endOfDeletePromise;
            return;
        } catch(err) {
            throw err;
        }
    }

    async customQuery(query) {
        try {
            if(query === '') {
                console.log('Enter your custom query');
                return;
            }
            let endOfCustomQueryPromise = new Promise ((resolve, reject) => {
                this.db.query(query, (err, result) => {
                    if(err) {
                        throw err;
                        reject();
                    }
                    console.log('mysql.db: Custom query is done successfully...');
                    if(result[0] === undefined) {
                        resolve();                    
                    } else {
                        resolve(result);
                    }
                });
            });
            let endOfCustomQuery = await endOfCustomQueryPromise;
            return endOfCustomQuery;            
        } catch(err) {
            throw err;
        }
    }
}

module.exports = {
    Mysql_database_manager
}


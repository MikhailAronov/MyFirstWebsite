const fls = require('fs');
const pathm = require('path');

const Postgre_mngr = require('../PostgreSQL_Manager.js').PostgreSQL_db_manager;
const db_m = new Postgre_mngr();

const argv = process.argv.slice(2);
console.log(argv);
try{
//db_m.connectTodb_pool(argv[0] || 'fortesttask', argv[1] || '127.0.0.1', argv[2] || 'fortesttask_test', argv[3] || '1111', Number(argv[4]) || 5432);
db_m.connectTodb_pool('admin', 'postgresdb', 'chatwebsite', '1111', 5432);
} catch {
    throw 'ERR: Connection to databse failed. Check the credentials or database working';
}
console.log("process.env.POSTGRES_HOST : ", process.env.POSTGRES_HOST);

async function migrations_init() {
    try {
        let Promise_init_migrations_query = new Promise ((resolve, reject) => {
            fls.readFile(pathm.join(__dirname, '00000001-init-migrations.sql'), 'utf-8', (err, data) => {
                if (err) throw 'readfile';
                resolve(data);
            });
        });
        let init_migrations_query = await Promise_init_migrations_query;
        console.log(init_migrations_query);
        try {await db_m.customQuery(init_migrations_query);
        console.log("db_m.customQuery(init_migrations_query) has done!");} catch {throw 'db'}
    } 
    catch (err) {
        switch(err) {
            case 'readfile' : 
                throw 'ERR: Cannot read the init-migrations file';
                break;
            case 'db' :
                throw 'ERR: Database cannot execute query'
            default : 
                throw 'ERR: Something goes wrong';
        }
    }  
}

async function executedMigrations () {
    let migr_files = await db_m.customQuery('SELECT * FROM migrations;');
    let exec_migrations =[];
    for(let row of migr_files) {
        exec_migrations.push(row.file);
    }
    //if (exec_migrations === undefined) exec_migrations = [];
    console.log('f:executedMigrations : ', exec_migrations);
    return exec_migrations;
}
async function migration() {
    try {
        await migrations_init();
        let executed_migrations = [];
        executed_migrations = await executedMigrations();
        let migrations_to_execute;
        let PromiseallDirFiles = new Promise ((resolve, reject) => {
            fls.readdir(__dirname, 'utf-8', (err, data) => {
                //if (err) throw 'readdir';
                resolve(data);
            });
        });
        let allDirFiles = await PromiseallDirFiles;
        console.log('allDirFiles : ', allDirFiles);
        console.log('executed_migrations : ', executed_migrations);
        migrations_to_execute = allDirFiles.filter((file) => { return file.split('.').pop() === 'sql' && !(executed_migrations.includes(file)) && !(file === '00000001-init-migrations.sql')});
        let query = '';
        console.log('migrations_to_execute : ', migrations_to_execute);
        for(let migration of migrations_to_execute) {
            let Promise_migration_query = new Promise ((resolve, reject) => {
                fls.readFile(pathm.join(__dirname, migration), 'utf-8', (err, data) => {
                    //if (err) throw 'readfile';
                    resolve(data);
                });
            });
            query += await Promise_migration_query + '\n\n';
        }
        console.log('query : ', query);
        try{ 
            await db_m.customQuery('BEGIN; \n' + query + '\n COMMIT;');
            if(migrations_to_execute.length != 0) {
                await db_m.customQuery(`INSERT INTO migrations (file) VALUES (\'${migrations_to_execute.join('), (')}\');`);
            }
        } catch(err) { throw 'ERR: Database cannot execute migrations query'};
    }
    catch(err) {
        switch(err) {
            case 'db' :
                throw 'ERR: Database cannot execute migrations query';
            case 'readfile' :
                throw 'ERR: Cannot read the migration files';
            default :
                throw err;
        }
    }
}
migration();
const sql = require('mssql/msnodesqlv8');
const config = {
    connectionString:
        "Driver={ODBC Driver 18 for SQL Server};" +
        "Server=DESKTOP-C3NT4R6\\SQLEXPRESS01;" +
        "Database=ComicHub;" +
        "Trusted_Connection=Yes;" +
        "Encrypt=No;" +
        "TrustServerCertificate=Yes;"
};
sql.connect(config)
    .then(pool => pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"))
    .then(r => {
        console.log(r.recordset);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

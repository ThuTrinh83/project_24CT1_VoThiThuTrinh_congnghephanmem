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
    .then(async pool => {
        const rev = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Reviews'");
        console.log("Reviews schema:", rev.recordset);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

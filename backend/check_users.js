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
        const r = await pool.request().query("SELECT id, name, email, role FROM Users");
        console.log("Users:", r.recordset);
        process.exit(0);
    })
    .catch(err => { console.error(err); process.exit(1); });

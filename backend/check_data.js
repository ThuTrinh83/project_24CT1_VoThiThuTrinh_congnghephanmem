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
        const cat = await pool.request().query("SELECT * FROM Categories");
        const prod = await pool.request().query("SELECT * FROM Products");
        console.log("Categories data:", cat.recordset);
        console.log("Products data:", prod.recordset);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

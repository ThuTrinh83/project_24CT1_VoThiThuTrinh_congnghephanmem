const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcryptjs');
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
        const shopPassword = await bcrypt.hash('shop123456', 10);
        const adminPassword = await bcrypt.hash('admin123456', 10);

        // Thêm tài khoản shop
        const shopResult = await pool.request()
            .input('name', sql.NVarChar, 'ComicHub Shop')
            .input('email', sql.VarChar, 'shop@comichub.vn')
            .input('password', sql.VarChar, shopPassword)
            .input('role', sql.VarChar, 'shop')
            .query(`
                IF NOT EXISTS (SELECT id FROM Users WHERE email = 'shop@comichub.vn')
                    INSERT INTO Users (name, email, password, role)
                    OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
                    VALUES (@name, @email, @password, @role)
            `);
        console.log("Shop account:", shopResult.recordset);

        // Thêm tài khoản admin
        const adminResult = await pool.request()
            .input('name', sql.NVarChar, 'Admin ComicHub')
            .input('email', sql.VarChar, 'admin@comichub.vn')
            .input('password', sql.VarChar, adminPassword)
            .input('role', sql.VarChar, 'admin')
            .query(`
                IF NOT EXISTS (SELECT id FROM Users WHERE email = 'admin@comichub.vn')
                    INSERT INTO Users (name, email, password, role)
                    OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
                    VALUES (@name, @email, @password, @role)
            `);
        console.log("Admin account:", adminResult.recordset);

        // Kiểm tra lại
        const all = await pool.request().query("SELECT id, name, email, role FROM Users");
        console.log("All users:", all.recordset);
        process.exit(0);
    })
    .catch(err => { console.error(err); process.exit(1); });

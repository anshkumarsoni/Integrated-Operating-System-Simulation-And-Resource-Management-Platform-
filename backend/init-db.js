import 'dotenv/config';
import { initDatabaseAndSchema } from './db.js';

console.log('----------------------------------------------------');
console.log('🔄 Initializing Real MySQL Database on Your Laptop...');
console.log(`📍 Target Host: ${process.env.MYSQL_HOST || 'localhost'}:${process.env.MYSQL_PORT || 3306}`);
console.log(`👤 MySQL User: ${process.env.MYSQL_USER || 'root'}`);
console.log('----------------------------------------------------');

try {
  const result = await initDatabaseAndSchema({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'os_simulation_db'
  });

  console.log(`✅ SUCCESS! ${result.message}`);
  console.log('📊 Tables in your laptop MySQL:');
  result.tables.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));
  console.log('----------------------------------------------------');
  console.log('🎉 Your laptop MySQL is now completely ready and connected!');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Could not connect to MySQL.');
  console.error(`Error message: ${err.message}`);
  if (err.message.includes('Access denied')) {
    console.error('\n💡 HINT: Please check the MYSQL_PASSWORD in backend/.env file.');
  }
  process.exit(1);
}

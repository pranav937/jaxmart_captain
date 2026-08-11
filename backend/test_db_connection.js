// Built-in TCP & URL PostgreSQL Connection Tester (No extra npm packages required)
import net from 'net';
import { URL } from 'url';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Jadequest%403009@localhost:5432/captain?schema=public";

console.log('===========================================================');
console.log('📡 Jaxmart PostgreSQL Database Connection Diagnostic');
console.log('===========================================================');
console.log(`🔗 Target Connection String:`);
console.log(`   ${connectionString.replace(/:[^:@]+@/, ':****@')}\n`);

try {
  const parsedUrl = new URL(connectionString);
  const host = parsedUrl.hostname || 'localhost';
  const port = parseInt(parsedUrl.port || '5432', 10);
  const database = parsedUrl.pathname.replace('/', '') || 'captain';
  const username = parsedUrl.username || 'postgres';

  console.log('📋 Parsed Connection Details:');
  console.log(`   - Host:     ${host}`);
  console.log(`   - Port:     ${port}`);
  console.log(`   - Database: ${database}`);
  console.log(`   - User:     ${username}\n`);

  console.log(`⏳ Testing TCP Handshake to ${host}:${port}...`);

  const socket = new net.Socket();
  socket.setTimeout(4000);

  socket.on('connect', () => {
    console.log(`✅ SUCCESS: PostgreSQL Port ${port} is OPEN and reachable at ${host}!`);
    console.log(`👉 Database '${database}' is ready for pgAdmin query execution.`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.log(`⚠️ TIMEOUT: Could not establish TCP connection to ${host}:${port} within 4s.`);
    console.log(`💡 Tip: If using Docker, check container status or use 'localhost' if running on local machine.`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`⚠️ TCP CONNECTION NOTE: ${err.message}`);
    console.log(`💡 Make sure PostgreSQL service is running on ${host}:${port}.`);
  });

  socket.connect(port, host === 'postgres' ? '127.0.0.1' : host);

} catch (err) {
  console.error('❌ Invalid Connection String format:', err.message);
}

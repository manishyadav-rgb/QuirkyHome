const { Client } = require('pg');
const fs = require('fs');

let databaseUrl = 'postgresql://neondb_owner:npg_SFK9nH2uTaIi@ep-falling-unit-aocdzkhh-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match && match[1]) {
    databaseUrl = match[1];
  }
} catch (e) {}

async function main() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query("select schema_json from builder_pages where site_id = 'quirkyhome' and id = 'main'");
    if (res.rows.length > 0) {
      const schema = res.rows[0].schema_json;
      if (schema && schema.pages && schema.pages.home) {
        console.log("Home page sections details:");
        schema.pages.home.sections.forEach((s, idx) => {
          console.log(`Section ${idx}: Type = ${s.type}, Visible = ${s.visible}`);
          console.log(`Settings:`, JSON.stringify(s.settings, null, 2));
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
main();

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './shared/schema.js';

// Conectar a la base de datos
const sqlite = new Database('./database.db');
const db = drizzle(sqlite, { schema });

console.log('🗄️  CONSULTANDO BASE DE DATOS SQLite');
console.log('=====================================\n');

try {
  // Consultar todas las visitas
  console.log('📊 VISITAS:');
  const visits = await db.select().from(schema.visits);
  console.log(`Total de visitas: ${visits.length}`);
  visits.forEach((visit, index) => {
    console.log(`${index + 1}. ID: ${visit.id}`);
    console.log(`   Referrer: ${visit.referrer || 'Directo'}`);
    console.log(`   User Agent: ${visit.userAgent?.substring(0, 50)}...`);
    console.log(`   Timestamp: ${new Date(visit.timestamp * 1000).toLocaleString('es-ES')}`);
    console.log('   ---');
  });

  console.log('\n🔗 CLICS:');
  const clicks = await db.select().from(schema.clicks);
  console.log(`Total de clics: ${clicks.length}`);
  clicks.forEach((click, index) => {
    console.log(`${index + 1}. ID: ${click.id}`);
    console.log(`   Plataforma: ${click.platform}`);
    console.log(`   URL: ${click.url}`);
    console.log(`   Referrer: ${click.referrer || 'Directo'}`);
    console.log(`   Timestamp: ${new Date(click.timestamp * 1000).toLocaleString('es-ES')}`);
    console.log('   ---');
  });

  // Estadísticas adicionales
  console.log('\n📈 ESTADÍSTICAS:');
  console.log(`Total de visitas: ${visits.length}`);
  console.log(`Total de clics: ${clicks.length}`);
  
  // Clics por plataforma
  const clicksByPlatform = clicks.reduce((acc, click) => {
    acc[click.platform] = (acc[click.platform] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\nClics por plataforma:');
  Object.entries(clicksByPlatform).forEach(([platform, count]) => {
    console.log(`  - ${platform}: ${count} clics`);
  });

  // Tasa de conversión
  const conversionRate = visits.length > 0 ? (clicks.length / visits.length * 100).toFixed(2) : 0;
  console.log(`\nTasa de conversión: ${conversionRate}%`);

} catch (error) {
  console.error('❌ Error consultando la base de datos:', error);
} finally {
  sqlite.close();
}
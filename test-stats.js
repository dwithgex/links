import { storage } from "./server/storage.js";

async function testStats() {
  try {
    console.log("🧪 Probando estadísticas de la base de datos...\n");
    
    // Verificar clics
    console.log("📊 CLICS:");
    const allClicks = await storage.getAllClicks();
    console.log(`  Total de registros de clics: ${allClicks.length}`);
    if (allClicks.length > 0) {
      allClicks.forEach((click, index) => {
        if (index < 5) { // Mostrar solo los primeros 5
          console.log(`  ${index + 1}. ${click.platform} - ${new Date(click.timestamp * 1000).toLocaleString("es-ES")}`);
        }
      });
      if (allClicks.length > 5) {
        console.log(`  ... y ${allClicks.length - 5} más`);
      }
    }
    
    // Verificar visitas
    console.log("\n👥 VISITAS:");
    const allVisits = await storage.getAllVisits();
    console.log(`  Total de registros de visitas: ${allVisits.length}`);
    if (allVisits.length > 0) {
      allVisits.forEach((visit, index) => {
        if (index < 5) { // Mostrar solo las primeras 5
          const referrer = visit.referrer || "Directo";
          console.log(`  ${index + 1}. ${referrer} - ${new Date(visit.timestamp * 1000).toLocaleString("es-ES")}`);
        }
      });
      if (allVisits.length > 5) {
        console.log(`  ... y ${allVisits.length - 5} más`);
      }
    }
    
    // Probar estadísticas
    console.log("\n📈 ESTADÍSTICAS:");
    
    try {
      const clickStats = await storage.getClickStats();
      console.log("  ✅ Click stats:", clickStats);
    } catch (e) {
      console.log("  ❌ Error en click stats:", e.message);
    }
    
    try {
      const visitStats = await storage.getVisitStats();
      console.log("  ✅ Visit stats:", visitStats);
    } catch (e) {
      console.log("  ❌ Error en visit stats:", e.message);
    }
    
    try {
      const totalClicks = await storage.getTotalClicks();
      console.log("  ✅ Total clicks:", totalClicks);
    } catch (e) {
      console.log("  ❌ Error en total clicks:", e.message);
    }
    
    try {
      const totalVisits = await storage.getTotalVisits();
      console.log("  ✅ Total visits:", totalVisits);
    } catch (e) {
      console.log("  ❌ Error en total visits:", e.message);
    }
    
    // Verificar enlaces cortos
    console.log("\n🔗 ENLACES CORTOS:");
    const shortLinks = await storage.getAllShortLinks();
    shortLinks.forEach(link => {
      console.log(`  • ${link.platform}: /go/${link.shortCode} → ${link.originalUrl} (${link.clickCount} clicks)`);
    });
    
    console.log("\n🎉 Prueba completada!");
    
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
  }
}

testStats();
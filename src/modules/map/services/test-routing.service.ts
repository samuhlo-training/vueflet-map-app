/**
 * TEST DEL SERVICIO DE ROUTING
 *
 * Este archivo es solo para PROBAR que el servicio funciona correctamente.
 * NO es parte de la aplicación, es solo para desarrollo/testing.
 *
 * Para ejecutarlo:
 * 1. Abre la consola del navegador (F12)
 * 2. Importa este módulo en algún componente temporalmente
 * 3. O copia y pega el código en la consola
 */

import { routingService } from "./routing.service";
import type { Waypoint } from "../interfaces/routing.interfaces";

/**
 * testRoutingService: Prueba el servicio con datos reales
 */
export async function testRoutingService() {
  console.log("🧪 Iniciando prueba del servicio de routing...\n");

  // Crear waypoints de prueba: Madrid → Barcelona
  const origin: Waypoint = {
    id: "test-origin",
    name: "Madrid, España",
    coordinates: [40.4168, -3.7038], // [lat, lon]
    type: "origin",
    order: 0,
  };

  const destination: Waypoint = {
    id: "test-destination",
    name: "Barcelona, España",
    coordinates: [41.3851, 2.1734], // [lat, lon]
    type: "destination",
    order: 1,
  };

  console.log("📍 Origen:", origin.name, origin.coordinates);
  console.log("📍 Destino:", destination.name, destination.coordinates);
  console.log("\n");

  // Probar cada modo de transporte
  const modes = ["driving", "cycling", "walking"] as const;

  for (const mode of modes) {
    console.log(`\n🚗 Probando modo: ${mode}`);
    console.log("─".repeat(50));

    try {
      const startTime = Date.now();

      const route = await routingService.getRoute([origin, destination], mode);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("✅ Ruta calculada exitosamente");
      console.log(`⏱️  Tiempo de cálculo: ${duration}ms`);
      console.log(`📏 Distancia: ${(route.distance / 1000).toFixed(2)} km`);
      console.log(`⏳ Duración: ${Math.round(route.duration / 60)} minutos`);
      console.log(`🗺️  Segmentos: ${route.segments.length}`);
      console.log(`📍 Puntos de geometría: ${route.geometry.length}`);

      // Mostrar primeras 3 instrucciones
      console.log("\n📝 Primeras instrucciones:");
      route.segments.slice(0, 3).forEach((segment, i) => {
        console.log(
          `  ${i + 1}. ${segment.instruction} (${segment.distance.toFixed(0)}m)`
        );
      });
    } catch (error: any) {
      console.error(`❌ Error en modo ${mode}:`, error.message);
      if (error.details) {
        console.error("   Detalles:", error.details);
      }
    }
  }

  console.log("\n\n🏁 Prueba completada");
}

/**
 * testWithIntermediateWaypoint: Prueba con una parada intermedia
 */
export async function testWithIntermediateWaypoint() {
  console.log("🧪 Probando ruta con parada intermedia...\n");

  const origin: Waypoint = {
    id: "test-origin",
    name: "Madrid",
    coordinates: [40.4168, -3.7038],
    type: "origin",
    order: 0,
  };

  const intermediate: Waypoint = {
    id: "test-intermediate",
    name: "Zaragoza",
    coordinates: [41.6488, -0.8891],
    type: "waypoint",
    order: 1,
  };

  const destination: Waypoint = {
    id: "test-destination",
    name: "Barcelona",
    coordinates: [41.3851, 2.1734],
    type: "destination",
    order: 2,
  };

  console.log("📍 Ruta: Madrid → Zaragoza → Barcelona\n");

  try {
    const route = await routingService.getRoute(
      [origin, intermediate, destination],
      "driving"
    );

    console.log("✅ Ruta con parada calculada exitosamente");
    console.log(`📏 Distancia total: ${(route.distance / 1000).toFixed(2)} km`);
    console.log(
      `⏳ Duración total: ${Math.round(route.duration / 60)} minutos`
    );
    console.log(`🗺️  Segmentos: ${route.segments.length}`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

/**
 * testErrorHandling: Prueba el manejo de errores
 */
export async function testErrorHandling() {
  console.log("🧪 Probando manejo de errores...\n");

  // Caso 1: Waypoints inválidos (solo 1)
  console.log("Test 1: Solo un waypoint");
  try {
    await routingService.getRoute(
      [
        {
          id: "test",
          name: "Test",
          coordinates: [40.4168, -3.7038],
          type: "origin",
          order: 0,
        },
      ],
      "driving"
    );
    console.error("❌ Debería haber lanzado error");
  } catch (error: any) {
    console.log("✅ Error capturado correctamente:", error.message);
  }

  // Caso 2: Coordenadas imposibles (en medio del océano)
  console.log("\nTest 2: Coordenadas sin ruta posible");
  try {
    await routingService.getRoute(
      [
        {
          id: "test1",
          name: "Océano",
          coordinates: [0, 0],
          type: "origin",
          order: 0,
        },
        {
          id: "test2",
          name: "Océano 2",
          coordinates: [1, 1],
          type: "destination",
          order: 1,
        },
      ],
      "driving"
    );
  } catch (error: any) {
    console.log("✅ Error capturado:", error.code, "-", error.message);
  }

  console.log("\n🏁 Pruebas de errores completadas");
}

// Para usar en la consola del navegador:
// import { testRoutingService, testWithIntermediateWaypoint, testErrorHandling } from './test-routing.service';
// await testRoutingService();
// await testWithIntermediateWaypoint();
// await testErrorHandling();

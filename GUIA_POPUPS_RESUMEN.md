# 📍 GUÍA COMPLETA: POPUPS EN LEAFLET CON VUE 3

## 📌 Resumen Ejecutivo

Hay **3 formas** de usar popups en Leaflet:

1. **Simple inline** - Para contenido básico
2. **Componente reutilizable** - Para contenido complejo
3. **Popup standalone** - Para casos especiales

---

## ✅ OPCIÓN 1: POPUP SIMPLE (Inline)

### Cuándo usarlo:
- Contenido simple (texto/HTML básico)
- Solo lo usas una vez
- No necesitas lógica compleja

### Ejemplo:
```vue
<l-marker :lat-lng="userLocation">
  <l-popup>
    <div class="popup-content">
      <h3 class="font-bold">Mi Ubicación</h3>
      <p>Latitud: {{ userLocation[0].toFixed(4) }}</p>
      <p>Longitud: {{ userLocation[1].toFixed(4) }}</p>
    </div>
  </l-popup>
</l-marker>
```

### Archivos a actualizar:
- `src/modules/map/components/Map.vue` ✅ Ya actualizado

---

## ✅ OPCIÓN 2: COMPONENTE REUTILIZABLE

### Cuándo usarlo:
- Contenido complejo con lógica
- Lo reutilizas en múltiples lugares
- Necesitas estilos personalizados
- Quieres emit events (editar, eliminar, etc)

### Componente: `MarkerPopup.vue`
```vue
<!-- Uso -->
<MarkerPopup
  :location="[51.5, -0.09]"
  title="Mi Ubicación"
  badge="Actual"
  :show-actions="true"
  @edit="handleEdit"
  @delete="handleDelete"
>
  <!-- Contenido personalizado aquí -->
  <p class="text-sm">Información adicional</p>
</MarkerPopup>
```

### Archivo creado:
- `src/modules/map/components/MarkerPopup.vue` ✅ Creado

---

## 🎨 OPCIONES DE PERSONALIZACIÓN

### Opciones del Popup:
```javascript
{
  maxWidth: 300,              // Ancho máximo (px)
  minWidth: 50,               // Ancho mínimo (px)
  maxHeight: 400,             // Alto máximo (px)
  autoClose: true,            // Cierra cuando se abre otro
  closeButton: true,          // Muestra botón X
  closeOnClick: true,         // Cierra al clickear afuera
  closeOnEscapeKey: true,     // Cierra con tecla ESC
  className: 'my-popup',      // Clase CSS personalizada
  offset: [0, -35],           // [x, y] en píxeles
  autoPan: true,              // Ajusta el mapa si sale afuera
  keepInView: false,          // Mantiene visible al hacer pan
}
```

### Ejemplo con opciones:
```vue
<l-popup :options="{ 
  maxWidth: 400, 
  className: 'custom-popup',
  closeButton: true 
}">
  <div>Contenido</div>
</l-popup>
```

---

## 🎯 PERSONALIZACIÓN CON CSS

### Estilos que puedes personalizar:

```vue
<style>
/* Contenedor del popup */
:deep(.leaflet-popup-content-wrapper) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Punta del popup */
:deep(.leaflet-popup-tip) {
  background: #667eea;
}

/* Contenido */
:deep(.leaflet-popup-content) {
  margin: 0;
  font-size: 14px;
  color: white;
}

/* Botón de cerrar */
:deep(.leaflet-popup-close-button) {
  color: white;
  font-size: 20px;
}

:deep(.leaflet-popup-close-button:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
```

---

## 🚀 CASOS DE USO COMUNES

### 1️⃣ Popup con Información de Contacto
```vue
<MarkerPopup :location="[51.5, -0.09]" title="Oficina">
  <div class="space-y-2">
    <p class="text-sm">📧 info@example.com</p>
    <p class="text-sm">📞 +34 91 123 4567</p>
    <p class="text-sm">🕐 Lun-Vie: 9:00 - 18:00</p>
    <button class="w-full bg-blue-600 text-white py-2 rounded">
      Llamar Ahora
    </button>
  </div>
</MarkerPopup>
```

### 2️⃣ Popup con Imagen
```vue
<l-marker :lat-lng="location">
  <l-popup>
    <div>
      <img :src="photoUrl" class="w-full rounded mb-2" />
      <h4 class="font-bold">{{ title }}</h4>
      <p class="text-sm">{{ description }}</p>
    </div>
  </l-popup>
</l-marker>
```

### 3️⃣ Popup con Acciones
```vue
<MarkerPopup 
  :location="location" 
  :show-actions="true"
  @edit="onEdit"
  @delete="onDelete"
>
  <p>Contenido</p>
</MarkerPopup>
```

### 4️⃣ Popup Interactivo
```vue
<l-marker :lat-lng="location">
  <l-popup>
    <div>
      <input v-model="searchQuery" placeholder="Buscar..." />
      <button @click="handleSearch">Buscar</button>
      <div v-for="result in results" :key="result.id">
        {{ result.name }}
      </div>
    </div>
  </l-popup>
</l-marker>
```

---

## 📦 DIFERENCIAS: Componente vs Inline

| Característica | Inline | Componente |
|---|---|---|
| Complejidad | Simple | Compleja |
| Reutilizable | No | Sí |
| Props/Eventos | Limitado | Completo |
| Mantenibilidad | Fácil | Mejor para complejos |
| Tamaño | Pequeño | Mediano |
| Casos | 1-2 usos | 3+ usos |

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
src/modules/map/
├── components/
│   ├── Map.vue                  # Mapa simple con popup inline ✅
│   ├── MarkerPopup.vue          # Componente reutilizable ✅
│   └── MapExample.vue           # Ejemplo completo con ambos ✅
├── views/
│   └── MapView.vue
└── stores/
    └── map.store.ts
```

---

## 🔄 EVENTOS DEL POPUP

```javascript
// Eventos que puede disparar un popup
popup.on('popupopen', () => {
  console.log('Popup abierto')
})

popup.on('popupclose', () => {
  console.log('Popup cerrado')
})

marker.on('click', () => {
  // Se dispara cuando clickeas el marcador
})
```

---

## ⚡ TIPS Y TRUCOS

✅ **DO:**
- Usa componentes para popups complejos
- Personaliza con CSS para mejor UX
- Usa `autoClose: true` para evitar múltiples popups
- Agrega iconos y emojis para mejor visualización

❌ **DON'T:**
- No metas lógica compleja en popups inline
- No hagas popups muy grandes (>500px)
- No abuses de animaciones en popups
- No olvides cerrar el botón de cerrar

---

## 🎓 PRÓXIMOS PASOS

1. **Personalizar MarkerPopup.vue** según tus necesidades
2. **Agregar más puntos de interés** al mapa
3. **Implementar búsqueda** de lugares
4. **Agregar clusters** de marcadores (para muchos puntos)
5. **Usar iconos personalizados** en lugar de marcadores azules

---

## 📚 REFERENCIAS

- [Leaflet Popup API](https://leafletjs.com/reference.html#popup)
- [Vue Leaflet Docs](https://vue-leaflet.github.io/)
- [Leaflet Tutorials](https://leafletjs.com/examples.html)

---

## 🎯 RESUMEN

- ✅ **Map.vue**: Popup simple inline
- ✅ **MarkerPopup.vue**: Componente reutilizable
- ✅ **MapExample.vue**: Ejemplo completo con ambos

¡Ahora estás listo para agregar popups profesionales a tu aplicación! 🚀

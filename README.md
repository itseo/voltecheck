# VoLTECheck

**VoLTECheck** es una web gratuita y de código abierto que ayuda a saber si un teléfono móvil dispone de tecnología VoLTE y muestra cómo encontrar su configuración.

La aplicación está pensada para **teléfonos móviles**: identifica automáticamente el modelo cuando el navegador facilita esa información y permite elegirlo manualmente cuando no es posible. Presenta una guía paso a paso, sin acceder a las llamadas, a la SIM ni al estado de VoLTE.

## Características

- Funcionamiento estático desde GitHub Pages, sin servidor ni bases de datos externas.
- Catálogo de dispositivos e instrucciones almacenados en archivos locales.
- Identificación de marca y modelo cuando el navegador lo permite.
- Búsqueda manual y guías adaptadas al fabricante y a la interfaz del sistema.
- Aviso específico para ordenadores, televisores y tablets.
- Diseño adaptado a teléfonos y accesible.
- Sin analítica, cookies de seguimiento ni registro de información personal.

La compatibilidad técnica del teléfono no asegura que cada operador habilite VoLTE para cada línea o versión de software. Los navegadores, especialmente Safari en iPhone, no siempre revelan el modelo exacto.

## Usar y publicar

Abre `index.html` desde un servidor web estático o publica la raíz del proyecto mediante GitHub Pages. Para ejecutar en local:

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080` desde el ordenador para inspección y pruebas; la interfaz pública está orientada a teléfonos.

Los datos se mantienen en `data/catalog.json`. El archivo `scripts/validate.mjs` valida la estructura.

## Autor y licencia

**Francisco Díaz Lara — [Sistewa](https://sistewa.com)**

© 2026 Francisco Díaz Lara. Distribuido bajo **GNU General Public License v3.0 (GPL-3.0-only)**. Consulta `LICENSE` y `NOTICE.md`.

**Creado con ❤️ por [Sistewa](https://sistewa.com).**

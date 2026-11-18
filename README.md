# Momoto Café — sitio web

Sitio estático (HTML + CSS + JavaScript, sin compilación) para **Momoto Café**, Batahola Sur, Managua.

**Dirección de diseño:** minimalista y elegante, al estilo de un restaurante con estrellas Michelin. La paleta sale del logo (negro y blanco), la tipografía es **Raleway** y la script de marca se usa solo como acento. Las transiciones y animaciones siguen el estilo de [onyxatthepreserve.com](https://onyxatthepreserve.com):

- **Fondo fijo con videos oficiales** que se funden al pasar de una sección a otra. Están en cámara lenta y en bucle sin corte visible.
- **Logo oficial animado:** "MOMOTO" aparece letra por letra con desenfoque, la línea se dibuja y "Café" se escribe. Pasa en la portada y al final de cada página.
- **Titulares** letra por letra con desenfoque, y textos que suben al entrar en pantalla.
- **Header transparente** que toma fondo negro con desenfoque al hacer scroll.
- **Franja superior** con el horario y el estado "Abierto ahora / Cerrado" según la hora de Managua.
- **Menú móvil** a pantalla completa, **galería** deslizable y **carta** con pestañas y navegación que sigue el scroll.
- **Rendimiento:** en computadora se cargan videos 16:9 y en celular videos 9:16. Solo se reproduce el de la sección visible, se pausa al salir y se precarga el siguiente. Con "reducir movimiento" o "ahorro de datos" se muestran solo los pósters.

## Ver el sitio en tu computadora

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.

## Estructura

```
index.html                  Inicio: portada, Bienvenidos, La barra, Iced latte, Coffee Spritz, Visítanos (mapa), Momentos
menu.html                   Carta: café (calientes/fríos + ficha de origen), de la casa, sin café, para acompañar
assets/css/styles.css       Sistema de diseño (colores, tipografía, animaciones)
assets/js/app.js            Animaciones, videos e interacciones
assets/video/               Videos de fondo: NOMBRE-land.mp4 (16:9) y NOMBRE-port.mp4 (9:16)
assets/img/                 Pósters, fotos, logo (blanco y negro), favicon e imagen para redes (og.jpg)
assets/vendor/swiper/       Swiper 11.1.14 (galería)
```

## Identidad

- **Logo:** vectores exactos del PDF oficial. `assets/img/logo-blanco.svg` y `logo-negro.svg` sirven para usar en otros lados. En la portada y el footer el logo está separado en piezas para poder animarlo.
- **Colores:** negro `#0b0b0b`, blanco hueso `#f4f2ed` y papel `#f6f4ef` para la carta. Todo está en `:root`, al inicio de `assets/css/styles.css`.
- **Tipografías:** Raleway (Google Fonts) y **Beautifully Delicious Script**.
  - Beautifully Delicious Script es una fuente **comercial** (My Creative Land). En el logo se usa el trazo vectorial del PDF.
  - Para los acentos en script del sitio hace falta su **licencia web**. Mientras tanto se usa Ms Madi, que es libre y muy parecida.
  - Cuando tengan el archivo `.woff2`, colóquenlo en `assets/fonts/` y descomenten el bloque `@font-face` al inicio de `styles.css`.

## Videos y fotos

Todo el material viene del álbum oficial de Momoto. Cada sección usa un tramo sin textos sobreimpresos, en cámara lenta y con un fundido en el punto de bucle.

| Sección | Video | Contenido |
| --- | --- | --- |
| Portada | `hero` | Vertido del AeroPress |
| Bienvenidos | `bienvenida` | Latte y agua en bandeja |
| La barra | `barra` | V60 |
| Iced latte | `frios` | Iced latte entre vasos de Momoto |
| Coffee Spritz | `spritz-port.jpg` (foto) | Coffee Spritz |
| Visítanos | `visitanos` | Vaso de Momoto saliendo por la puerta |

**Para cambiar un video:** exporta dos versiones con el mismo nombre, ambas en MP4 (H.264), sin audio, de 5 a 10 segundos:

- `NOMBRE-land.mp4`: 1600×900
- `NOMBRE-port.mp4`: 720×1280

Exporta también sus pósters `NOMBRE-land.jpg` y `NOMBRE-port.jpg` (primer cuadro del video). Por ejemplo:

```bash
ffmpeg -i original.mp4 -ss 3 -t 8 -an -vf "crop=iw:iw*9/16,scale=1600:900" -c:v libx264 -crf 22 -preset slow -movflags +faststart -pix_fmt yuv420p hero-land.mp4
```

Las fotos de la galería son `assets/img/galeria-1.jpg` a `galeria-8.jpg` (900×1125, formato 4:5).

## Horario, dirección y WhatsApp

- **Textos visibles:** en `index.html` y `menu.html` (busca `8:00 AM`, `Batahola` o `50586568304`).
- **"Abierto ahora / Cerrado":** `BUSINESS` al inicio de `assets/js/app.js`.
- **Datos para Google:** bloque `application/ld+json` en `index.html`.

## Carta

La carta de `menu.html` es **preliminar y no tiene precios**.

- **Salen del material oficial:** espresso, latte, V60, AeroPress, iced latte, Coffee Spritz y la ficha de origen (Nicaragua · Finca Bella Vista · Matagalpa · Lavado · Jania Arauz).
- **Son de ejemplo:** el resto de los productos.

Para agregar un precio, pon debajo de la descripción:

```html
<span class="menu-item-price">C$ 90</span>
```

Los enlaces `menu.html#frios` y `menu.html#calientes` abren directamente esa pestaña.

## Publicar

Es un sitio estático: funciona en cualquier hosting, como GitHub Pages, Netlify o Vercel. Al publicar, cambia `og:image` en ambos HTML por la URL absoluta de `og.jpg` para que la vista previa funcione en WhatsApp y redes.

## Pendiente de confirmar

- **Carta completa y precios.**
- **WhatsApp:** se usa `+505 8656 8304`, que aparece en un listado público junto a la dirección de La Colmena. Otro listado muestra `+505 8284 4208`.
- **Dirección:** "Batahola Sur, de Miscelánea La Colmena, 3 c. al sur, 1 c. al este". El mapa usa las coordenadas de Waze (12.136662, -86.305481).
- **Licencia web de Beautifully Delicious Script**, para reemplazar la fuente alternativa.

## Créditos

- Fotos y videos: material oficial de Momoto Café.
- [Swiper](https://swiperjs.com) 11.1.14, licencia MIT (`assets/vendor/swiper/LICENSE`).
- Íconos: [Feather](https://feathericons.com) (MIT) y [Tabler Icons](https://tabler.io/icons) (MIT, ícono de WhatsApp).
- Fuentes: Raleway y Ms Madi (SIL Open Font License), servidas por Google Fonts.

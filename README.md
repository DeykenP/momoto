# Momoto Café — sitio web

Sitio estático (HTML + CSS + JavaScript, sin compilación) para **Momoto Café**, Managua: Batahola (central), Plaza Natura y Distrito Diseño.

**Dirección de diseño:** minimalista y elegante, al estilo de un restaurante con estrellas Michelin. La paleta sale del logo (negro y blanco), la tipografía es **Raleway** y la script de marca se usa solo como acento. Las transiciones y animaciones siguen el estilo de [onyxatthepreserve.com](https://onyxatthepreserve.com):

- **Fondo fijo con videos oficiales** que se funden al pasar de una sección a otra. Están en cámara lenta y en bucle sin corte visible.
- **Logo oficial animado:** "MOMOTO" aparece letra por letra con desenfoque, la línea se dibuja y "Café" se escribe.
- **Titulares** letra por letra, y textos que suben al entrar en pantalla.
- **Header** que toma fondo negro con desenfoque al hacer scroll.
- **Estado en vivo** según la hora de Managua.
  - En la franja superior: por ejemplo, "Abierto ahora en Batahola y Plaza Natura" o "Cerrado · abrimos mañana a las 8 AM".
  - En cada sucursal: por ejemplo, "Abierto ahora · cierra a las 6 PM".
- **Carta completa** con precios, navegación por categorías que sigue el scroll y pestañas caliente/helado.
- **Rendimiento:** en computadora se cargan videos 16:9 y en celular 9:16. Solo se reproduce el de la sección visible y se pausa al salir. Con "reducir movimiento" o "ahorro de datos" se muestran solo los pósters.

## Ver el sitio en tu computadora

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.

## Estructura

```
index.html                  Inicio: portada, Bienvenidos, La barra, Iced latte, Coffee Spritz, Visítanos (3 sucursales), Momentos
menu.html                   Carta completa (transcrita del menú oficial en PDF)
assets/css/styles.css       Sistema de diseño (colores, tipografía, animaciones)
assets/js/app.js            Animaciones, videos, horarios de sucursales e interacciones
assets/video/               Videos de fondo: NOMBRE-land.mp4 (16:9) y NOMBRE-port.mp4 (9:16)
assets/img/                 Pósters, fotos, logo (blanco y negro), favicon e imagen para redes (og.jpg)
assets/vendor/swiper/       Swiper 11.1.14 (galería)
```

## Sucursales y horarios

| Sucursal | Dirección | Horario |
| --- | --- | --- |
| Batahola (central) | Aldeas SOS 1 c. al sur, 1 c. al oeste · Calle Diagonal, Batahola Sur | Lunes a domingo, 8 AM – 8 PM |
| Plaza Natura | Plaza Natura · Pista Suburbana | Lunes a sábado, 8 AM – 6 PM |
| Distrito Diseño (Distrito Café by Momoto) | Los Robles, del portón trasero del Parque Japonés 75 vrs al norte | Lunes a sábado, 9 AM – 6 PM |

Si cambia un horario, hay que actualizarlo en tres lugares:

1. El texto en `index.html` (sección Visítanos y footer) y en el footer de `menu.html`.
2. `BRANCHES`, al inicio de `assets/js/app.js`. De ahí sale el estado "Abierto ahora / Cerrado". `days` usa 0 = domingo … 6 = sábado, y las horas van en formato 24 h.
3. El bloque `application/ld+json` en `index.html`, que son los datos para Google.

Los enlaces de Google Maps abren las fichas oficiales de cada sucursal.

**Para probar el estado a otra hora**, abre `index.html?hora=2026-11-22T21:30` (hora de Managua).

## Carta

`menu.html` contiene la carta oficial completa (91 productos con sus precios) en categorías:

- Espresso bar (caliente y helado)
- Matcha, Smoothies, Mocktails
- Cócteles
- Desayunos y omelettes
- Paninis, Hamburguesas
- Ensaladas y wraps
- Snacks y postres

Las marcas son las mismas del menú impreso: ★ para los recomendados de la casa y una hoja para los vegetarianos.

**Para cambiar un precio**, busca el producto en `menu.html` y edita `<span class="menu-item-price">C$125</span>`. Cada producto es un bloque `<li class="menu-item">`.

Los enlaces `menu.html#caliente` y `menu.html#helado` abren esa pestaña. Las demás categorías tienen su propia ancla, por ejemplo `menu.html#cocteles`.

## Identidad

- **Logo:** vectores exactos del PDF oficial. `assets/img/logo-blanco.svg` y `logo-negro.svg` sirven para usar en otros lados.
- **Colores:** negro `#0b0b0b`, blanco hueso `#f4f2ed` y papel `#f6f4ef` para la carta. Todo está en `:root` de `assets/css/styles.css`.
- **Tipografías:** Raleway (Google Fonts) y **Beautifully Delicious Script**.
  - Beautifully Delicious Script es una fuente comercial. El logo usa el trazo vectorial del PDF.
  - Para los acentos en script del sitio hace falta su licencia web. Mientras tanto se usa Ms Madi, que es libre y muy parecida.
  - Cuando tengan el `.woff2`, colóquenlo en `assets/fonts/` y descomenten el `@font-face` al inicio de `styles.css`.

## Videos y fotos

Todo el material viene del álbum oficial de Momoto.

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

Exporta también sus pósters `NOMBRE-land.jpg` y `NOMBRE-port.jpg` (primer cuadro). Por ejemplo:

```bash
ffmpeg -i original.mp4 -ss 3 -t 8 -an -vf "crop=iw:iw*9/16,scale=1600:900" -c:v libx264 -crf 22 -preset slow -movflags +faststart -pix_fmt yuv420p hero-land.mp4
```

## Publicar

Es un sitio estático: funciona en cualquier hosting, como GitHub Pages, Netlify o Vercel. Al publicar, cambia `og:image` en ambos HTML por la URL absoluta de `og.jpg`.

## Pendiente de confirmar

- **Licencia web de Beautifully Delicious Script**, para reemplazar la fuente alternativa.
- **Ortografía en la carta impresa:** en la web se corrigieron "Espresso Doppio", "Iced Affogato" y "mozzarella" (en el PDF dice Dopio, Affogatto y Mozarella), además de erratas en las descripciones ("huelo" → hielo, "especies" → especias). Conviene corregirlo también en el PDF.
- **Horario de Plaza Natura en Google Maps:** la ficha indica cierre a las 8 PM, mientras que el horario real es de 8 AM a 6 PM. Conviene actualizarla desde Google Business Profile.

## Créditos

- Fotos y videos: material oficial de Momoto Café.
- [Swiper](https://swiperjs.com) 11.1.14, licencia MIT (`assets/vendor/swiper/LICENSE`).
- Íconos: [Feather](https://feathericons.com) (MIT) y [Tabler Icons](https://tabler.io/icons) (MIT, ícono de WhatsApp).
- Fuentes: Raleway y Ms Madi (SIL Open Font License), servidas por Google Fonts.

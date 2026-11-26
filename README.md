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

Para verlo exactamente como en Cloudflare (direcciones como `/menu` y la página 404), usa `npx wrangler dev` y abre <http://localhost:8787>.

## Estructura

```
index.html                  Inicio (historia de la marca): portada, Nuestra historia, Nuestra visión, Origen y calidad, Nuestros espacios, Visítanos (3 sucursales), Momentos
menu.html                   Destacados en video + carta completa (transcrita del menú oficial en PDF)
404.html                    Página para direcciones que no existen
assets/css/styles.css       Sistema de diseño (colores, tipografía, animaciones)
assets/js/app.js            Animaciones, videos, horarios de sucursales e interacciones
assets/video/               Videos de fondo: NOMBRE-land.mp4 (16:9) y NOMBRE-port.mp4 (9:16)
assets/img/                 Pósters, fotos, logo (blanco y negro), favicon e imagen para redes (og.jpg)
assets/vendor/swiper/       Swiper 11.1.14 (galería)
wrangler.jsonc              Configuración de Cloudflare (ver "Publicar en Cloudflare")
.assetsignore               Lo que está en el repositorio pero no se publica
_headers                    Encabezados de seguridad y caché
cloudflare/worker.js        Sirve los videos por partes para que se reproduzcan en iPhone
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

## Historia de la marca (inicio)

La portada cuenta la historia, la visión y la filosofía de Momoto; los productos viven en el menú.

- **Nuestra historia:** nació en plena pandemia, en un garaje, con una moka italiana y pedidos a domicilio; hoy son tres sucursales y doce colaboradores (datos de la nota de Forbes). Cierra con los reconocimientos, el más reciente primero:
  - Momoto Café, ganador de los [Connecta Awards Nicaragua 2026](https://www.myt.connectab2b.com/post/connecta-awards-nicaragua-2026-celebr%C3%B3-el-liderazgo-y-la-excelencia-del-sector-empresarial) en la categoría Iniciativa Pyme (23 de noviembre de 2026; organizan ConnectaB2B y Mercados y Tendencias).
  - Kevin Castillo Canales en el [30 Under 30 de Forbes Centroamérica 2026](https://forbescentroamerica.com/2026/07/07/estos-son-los-30-under-30-forbes-centroamerica-2026/).
  - Para agregar otro, copia un `<li>` dentro de `<ul class="panel-press">` en `index.html` y ponlo de primero. El premio también está en los datos estructurados (`"award"` en el JSON-LD del `<head>`).
- **Nuestra visión:** un panel más, con video de fondo, que sale del pitch de Kevin adaptado para clientes:
  - El titular: "De Nicaragua para el mundo".
  - La idea central: "Nicaragua no solo puede exportar granos de café. Puede exportar una experiencia completa."
  - La meta: ser la primera cadena de cafeterías nacida en Nicaragua reconocida en el mundo, creciendo con intención y sin perder la esencia.
  - Los tres pilares, solo con su nombre: café de especialidad, espacios que conectan y una misma experiencia. Cada uno se desarrolla en el panel siguiente: Origen y calidad, Nuestros espacios y Visítanos.
  - Los datos de mercado y el modelo de expansión del pitch son para inversionistas y no van en la web pública.
  - Para compartirla con aliados: `index.html#vision`.
- **Origen y calidad:** trabajo directo con fincas de Nicaragua, asesoría a productores (nuevas variedades, Taza de Excelencia) y la ficha de origen. Su botón, «Conoce las fincas», lleva a las fichas de origen del menú.
- **Nuestros espacios (Un plan de todos los días):** frases de los propios Reels de Momoto ("El café no siempre se trata de energía…", "Si llueve. Si hace frío…") y la idea de hospitalidad del pitch.

## Destacados del menú

Arriba de la carta hay un bloque con tres productos (Coffee Spritz, Iced Latte y Latte): un video a la vez, con transición, que avanza solo cada 7 segundos. Se detiene al pasar el puntero o al tocar un producto, y se pausa cuando no está en pantalla. Cada producto tiene su precio y un enlace a su lugar en la carta.

Para cambiar un producto destacado:

1. Exporta el video en 4:5 (720×900), MP4 H.264, sin audio, de 4 a 10 segundos: `assets/video/feat-NOMBRE.mp4`.
2. Guarda su primer cuadro como póster: `assets/img/feat-NOMBRE.jpg`.
3. En `menu.html`, dentro de `<section class="featured">`, cambia el video, el texto (nombre, descripción, precio), el enlace y el nombre de su pestaña.

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

### Cafés de origen

Arriba del Espresso bar está la ficha de origen, con una pestaña por finca. Los datos salen de las fichas impresas:

| Finca | Región | Variedad | Proceso | Caficultor |
| --- | --- | --- | --- | --- |
| Bella Vista | Matagalpa | Marsella Caturra | Lavado | Jania Arauz |
| La Esperanza | Matagalpa | Maracaturra con Catuaí | Natural anaeróbico | Norman Torres |
| El Cambalache | Nueva Segovia | Maracaturra | Lavado | Samuel Zabala |

Para agregar, quitar o cambiar un café, edita en `menu.html` el bloque `<article … id="fincas">`. Cada finca es un botón `.origin-tab` más su `.origin-panel`, y el comentario de arriba del bloque explica qué cambiar. Se ven bien hasta cuatro fincas.

Enlaces directos: `menu.html#fincas` abre el menú en las fichas (ahí lleva el botón «Conoce las fincas» del inicio) y `menu.html#la-esperanza` abre directamente esa finca.

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
| Nuestra historia | `historia` | V60 |
| Nuestra visión | `vision` | Toma cenital: café vertido sobre hielo entre vasos Momoto. En horizontal va girada 90° (es una toma desde arriba), así conserva la resolución y el vaso queda a la derecha del texto |
| Origen y calidad | `origen` | Llega la bandeja y el cliente lee la ficha de origen |
| Nuestros espacios | `diario` | Montaje: un sorbo, la laptop, una persona sentada |
| Visítanos | `visitanos` | Vaso de Momoto saliendo por la puerta |
| Menú · Destacados | `feat-spritz`, `feat-iced`, `feat-latte` | Coffee Spritz, Iced Latte y Latte (4:5) |

Cada tramo se eligió sin los textos sobreimpresos de los Reels. **Colorimetría:** todos los videos comparten el mismo tono cálido y natural. El Coffee Spritz venía mucho más saturado (saturación media 0.75 frente a 0.25–0.54 del resto), así que se corrigió para igualarlo (`eq=saturation=0.72:gamma=1.2:contrast=0.95` + un toque cálido). Si se agregan videos nuevos, conviene mantener ese mismo tono.

**Para cambiar un video:** exporta dos versiones con el mismo nombre, ambas en MP4 (H.264), sin audio, de 5 a 10 segundos:

- `NOMBRE-land.mp4`: 1600×900
- `NOMBRE-port.mp4`: 720×1280

Exporta también sus pósters `NOMBRE-land.jpg` y `NOMBRE-port.jpg` (primer cuadro). Por ejemplo:

```bash
ffmpeg -i original.mp4 -ss 3 -t 8 -an -vf "crop=iw:iw*9/16,scale=1600:900" -c:v libx264 -crf 22 -preset slow -movflags +faststart -pix_fmt yuv420p hero-land.mp4
```

## Publicar en Cloudflare

El sitio se publica gratis en Cloudflare Workers. No hay que compilar nada: Cloudflare sirve los archivos del repositorio tal cual.

**Cómo está armado**

- `wrangler.jsonc`: la configuración. Su nombre, `momoto-cafe`, tiene que ser igual al del proyecto en el panel de Cloudflare.
- `.assetsignore`: lo que no se publica (este README, la configuración y el código del Worker).
- `cloudflare/worker.js`: atiende solo los videos. Safari en iPhone pide los videos por partes, y sin esto Cloudflare responde el archivo completo y el video no se reproduce. El resto del sitio no pasa por el Worker.
- `_headers`: seguridad básica y caché de un día para las fotos.
- Direcciones: `/menu` abre el menú, y los enlaces a `menu.html` siguen funcionando (redirigen a `/menu`). Las direcciones que no existen muestran `404.html`.

**Primera publicación**

1. En el panel de Cloudflare: **Workers & Pages** → **Create application** → **GitHub** → elige `DeykenP/momoto`.
2. Configura:
   - Nombre del proyecto: `momoto-cafe`.
   - Rama: `claude/ecstatic-cerf-9cipl1`. Por ahora es la única; si después crean `main`, se cambia en **Settings** → **Build**.
   - Comando de build: vacío.
   - Comando de deploy: `npx wrangler deploy`, el que viene por defecto.
3. **Save and Deploy**. El sitio queda en una dirección `momoto-cafe.….workers.dev`, y cada cambio que se sube a esa rama se publica solo.

**Dominio propio**

1. El dominio tiene que estar en la misma cuenta de Cloudflare. Un .com se puede comprar ahí mismo. Si se compra en otro lado (por ejemplo, un .com.ni), se agrega como sitio en Cloudflare y se cambian sus nameservers por los que indique Cloudflare.
2. En el Worker: **Settings** → **Domains & Routes** → **Add** → **Custom Domain**, escribe el dominio (por ejemplo, `momotocafenic.com`) y **Add Custom Domain**. Repite con `www.momotocafenic.com`. Cloudflare crea solo los registros DNS y el certificado de seguridad.
3. Con el dominio funcionando, cambia `og:image` en `index.html` y `menu.html` por la URL absoluta de `og.jpg` (es la imagen que se ve al compartir el enlace).
4. Da de baja el proyecto de Vercel: su plan gratis no permite sitios comerciales.

**Costos:** el plan gratis alcanza. Las páginas, fotos y demás archivos no tienen límite de visitas. Solo los videos pasan por el Worker, que tiene 100,000 pedidos gratis al día: un café usa una fracción. Si algún día no alcanzara, el plan pagado de Workers cuesta US$5 al mes.

## Pendiente de confirmar

- **Mención de Forbes con el nombre del fundador:** confirmar con Kevin que quiere que aparezca así en la portada.
- **Texto de Nuestra visión:** es una adaptación del pitch. Conviene que Kevin apruebe la redacción final, sobre todo la meta pública de "ser la primera cadena de cafeterías nacida en Nicaragua reconocida en el mundo".
- **Fichas de origen:**
  - El proceso de La Esperanza va en español en la web («Natural anaeróbico»); en la ficha impresa está en inglés («Natural Anaerobic»).
  - La ficha de Bella Vista dice «Marsella Caturra». Si la variedad es Marsellesa, hay que corregirlo en la web y en la ficha.
- **Licencia web de Beautifully Delicious Script**, para reemplazar la fuente alternativa.
- **Ortografía en la carta impresa:** en la web se corrigieron "Espresso Doppio", "Iced Affogato" y "mozzarella" (en el PDF dice Dopio, Affogatto y Mozarella), además de erratas en las descripciones ("huelo" → hielo, "especies" → especias). Conviene corregirlo también en el PDF.
- **Horario de Plaza Natura en Google Maps:** la ficha indica cierre a las 8 PM, mientras que el horario real es de 8 AM a 6 PM. Conviene actualizarla desde Google Business Profile.

## Créditos

- Fotos y videos: material oficial de Momoto Café.
- Historia: [Forbes Centroamérica, 30 Under 30 2026](https://forbescentroamerica.com/2026/07/07/estos-son-los-30-under-30-forbes-centroamerica-2026/), [Mercados y Tendencias, Connecta Awards Nicaragua 2026](https://www.myt.connectab2b.com/post/connecta-awards-nicaragua-2026-celebr%C3%B3-el-liderazgo-y-la-excelencia-del-sector-empresarial) y [TN8](https://www.tn8.tv/nacionales/momoto-cafe-el-cielo-para-los-amantes-de-las-bebidas-a-base-del-grano-de-oro/).
- [Swiper](https://swiperjs.com) 11.1.14 (galería del inicio), licencia MIT (`assets/vendor/swiper/LICENSE`).
- Íconos: [Feather](https://feathericons.com) (MIT) y [Tabler Icons](https://tabler.io/icons) (MIT, ícono de WhatsApp).
- Fuentes: Raleway y Ms Madi (SIL Open Font License), servidas por Google Fonts.

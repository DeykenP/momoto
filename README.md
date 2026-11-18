# Momoto Café — sitio web

Sitio estático (HTML + CSS + JavaScript, sin compilación) para **Momoto Café**, Batahola Sur, Managua.

El diseño, las transiciones y las animaciones siguen el estilo de [onyxatthepreserve.com](https://onyxatthepreserve.com), con la identidad de Momoto:

- **Fondo fijo** con fotos que se funden suavemente al pasar de una sección a otra, con un zoom lento.
- **Titulares que aparecen letra por letra** con desenfoque.
- **Textos y botones que suben** al entrar en pantalla.
- **Header transparente** que toma fondo oscuro con desenfoque al hacer scroll.
- **Franja superior terracota** con horario, ubicación y estado "Abierto ahora / Cerrado" según la hora de Managua.
- **Logo animado** al final: MOMOTO aparece letra por letra, la línea se dibuja y "Café" se escribe.
- **Menú móvil** a pantalla completa, **galería deslizable** y **página de menú** con pestañas y navegación que sigue el scroll.
- Respeta la preferencia de "reducir movimiento" del sistema.

## Ver el sitio en tu computadora

```bash
python3 -m http.server 8000
```

Luego abrí <http://localhost:8000>.

## Estructura

```
index.html                 Inicio: hero, Bienvenidos, Mañanas, Tardes, Al caer la tarde, Visitanos (mapa), Momentos (galería)
menu.html                  Menú: café (calientes/fríos), sin café, dulces, salados
assets/css/styles.css      Sistema de diseño: colores, tipografía, animaciones
assets/js/app.js           Animaciones e interacciones (sin dependencias, salvo Swiper para la galería)
assets/img/                Fotos, favicon e imagen para compartir en redes (og.jpg)
assets/vendor/swiper/      Swiper 11.1.14 (galería)
```

## Identidad visual

La paleta y la tipografía salen de las fotos del rótulo y la fachada del local:

| Rol | Color | De dónde sale |
| --- | --- | --- |
| Fondo | `#121110` | Rótulo negro |
| Acento | `#c9ab74` | Letras doradas de "MOMOTO" |
| Texto | `#f2ece2` | Script "Café" |
| Franja superior | `#b65a2e` | Columnas terracota de la entrada |
| Fondo del menú | `#ece6da` | Paredes de estuco |

- **Tipografías** (Google Fonts): **Montserrat** para la palabra MOMOTO, títulos y textos, y **Ms Madi** para el script "Café". Se eligieron comparándolas con el rótulo.
- **Logo:** está recreado en HTML/CSS (MOMOTO, la línea y "Café"). Si tienen el logo original en SVG o PNG, se puede usar ese.

Todos los colores están en `:root` al inicio de `assets/css/styles.css`.

## Cómo cambiar las fotos

**Todas las fotos actuales son de muestra (Unsplash).** Para poner las de Momoto, reemplazá cada archivo en `assets/img/` por uno con el mismo nombre:

| Archivo | Dónde aparece |
| --- | --- |
| `hero.jpg` | Fondo de la portada |
| `bienvenida.jpg` | Fondo de "Bienvenidos a Momoto Café" |
| `mananas.jpg` | Fondo de "Mañanas" |
| `tardes.jpg` | Fondo de "Tardes" |
| `noches.jpg` | Fondo de "Al caer la tarde" |
| `visitanos.jpg` | Fondo de "Visitanos" |
| `menu-hero.jpg` | Portada de la página de menú |
| `galeria-1.jpg` … `galeria-8.jpg` | Galería "Momentos" y "Antojos" |
| `og.jpg` | Vista previa al compartir el enlace (1200×630) |

Recomendado: fondos de unos 2000 px de ancho y galería de unos 1400 px, en JPG de menos de 400 KB. El encuadre de cada fondo se ajusta con `--focus` en `index.html` (por ejemplo, `style="--focus: 40% 50%"`).

**Videos de fondo (por ejemplo, un Reel):** dentro de la capa, reemplazá el `<img>` por:

```html
<video muted loop playsinline poster="assets/img/hero.jpg">
    <source data-src="assets/video/hero.mp4" type="video/mp4">
</video>
```

El video se carga y se reproduce solo cuando su sección está en pantalla.

## Horario, dirección y WhatsApp

- **Textos visibles:** en `index.html` y `menu.html` (buscá `8:00 AM`, `Batahola` o `50586568304`).
- **"Abierto ahora / Cerrado":** se calcula con la hora de Managua según `BUSINESS` al inicio de `assets/js/app.js`.
- **Datos para Google:** bloque `application/ld+json` en `index.html`.

## Menú

El menú de `menu.html` es **un ejemplo genérico, sin precios**, marcado con el comentario `MENÚ DE EJEMPLO`. Para agregar un precio a un producto:

```html
<div class="menu-item-head">
    <h3 class="menu-item-name">Capuchino</h3>
    <span class="menu-item-dots"></span><span class="menu-item-price">C$ 90</span>
</div>
```

Los enlaces `menu.html#frios` y `menu.html#calientes` abren la pestaña correspondiente.

## Publicar

Es un sitio estático: funciona en cualquier hosting.

- **GitHub Pages:** en el repositorio, *Settings → Pages → Deploy from a branch*, elegir la rama y la carpeta raíz.
- **Netlify o Vercel:** subir la carpeta tal cual.

Al publicar, cambiá `og:image` en ambos HTML por la URL absoluta de `og.jpg` para que la vista previa funcione en WhatsApp y Facebook.

## Pendiente de confirmar

- **Fotos:** reemplazar las fotos de muestra por fotos propias.
- **Menú:** reemplazar el menú de ejemplo por el real, con precios.
- **WhatsApp:** se usa `+505 8656 8304`, que aparece en un listado público junto a la dirección de La Colmena. Otro listado muestra `+505 8284 4208`.
- **Dirección:** "Batahola Sur, de Miscelánea La Colmena, 3 c. al sur, 1 c. al este" (Facebook y TripAdvisor). El mapa usa las coordenadas de Waze (12.136662, -86.305481).
- **Horario:** "Lunes a domingo, 8 AM – 8 PM", del rótulo de la puerta.
- **Textos:** son un borrador; ajustarlos a la voz de Momoto.

## Créditos

- Fotos de muestra: [Unsplash](https://unsplash.com) (licencia Unsplash). IDs: `photo-1442512595331-e89e73853f31`, `photo-1600093463592-8e36ae95ef56`, `photo-1497515114629-f71d768fd07c`, `photo-1461023058943-07fcbe16d735`, `photo-1501339847302-ac426a4a7cbb`, `photo-1445116572660-236099ec97a0`, `photo-1461988091159-192b6df7054f`, `photo-1495474472287-4d71bcdd2085`, `photo-1541167760496-1628856ab772`, `photo-1572442388796-11668a67e53d`, `photo-1578985545062-69928b1d9587`, `photo-1497935586351-b67a49e012bf`, `photo-1514066558159-fc8c737ef259`, `photo-1517701604599-bb29b565090c`, `photo-1506372023823-741c83b836fe`.
- [Swiper](https://swiperjs.com) 11.1.14, licencia MIT (`assets/vendor/swiper/LICENSE`).
- Íconos: [Feather](https://feathericons.com) (MIT) y [Tabler Icons](https://tabler.io/icons) (MIT, ícono de WhatsApp).
- Fuentes: Montserrat y Ms Madi, SIL Open Font License, servidas por Google Fonts.

/**
 * Momoto Café · Worker de Cloudflare
 *
 * El sitio es estático: Cloudflare sirve los archivos directamente y este código no se ejecuta,
 * salvo para los videos (/assets/video/*, ver "run_worker_first" en wrangler.jsonc).
 *
 * Por qué existe: Safari en iPhone pide los videos por partes (por ejemplo, "Range: bytes=0-1")
 * y no los reproduce si el servidor responde con el archivo completo. Los archivos estáticos de
 * Cloudflare siempre responden completos, así que aquí se recorta la parte pedida y se responde
 * "206 Partial Content", como hace cualquier servidor de videos.
 */

const SINGLE_RANGE = /^bytes=(\d*)-(\d*)$/;

export default {
    async fetch(request, env) {
        const range = request.headers.get('Range');

        // Sin pedido por partes: se responde normal (el navegador puede revalidar con su caché)
        // y se avisa que el servidor acepta pedidos por partes.
        if (!range || (request.method !== 'GET' && request.method !== 'HEAD')) {
            const response = await env.ASSETS.fetch(request);
            return new Response(response.body, { status: response.status, statusText: response.statusText, headers: videoHeaders(response) });
        }

        // Se pide el archivo completo, sin Range ni condiciones, para recortarlo aquí.
        const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
        if (asset.status !== 200) return asset;

        const headers = videoHeaders(asset);

        // Varios rangos a la vez, un formato raro o un If-Range que ya no coincide:
        // se responde el archivo completo, que también es una respuesta válida.
        const match = SINGLE_RANGE.exec(range.trim());
        const ifRange = request.headers.get('If-Range');
        if (!match || (match[1] === '' && match[2] === '') || (ifRange && ifRange !== headers.get('ETag'))) {
            return new Response(request.method === 'HEAD' ? null : asset.body, { status: 200, headers });
        }

        const body = await asset.arrayBuffer();
        const size = body.byteLength;
        let start;
        let end;
        if (match[1] === '') {
            // "bytes=-500": los últimos 500 bytes.
            start = Math.max(size - Number(match[2]), 0);
            end = size - 1;
        } else {
            start = Number(match[1]);
            end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
        }

        if (start >= size || start > end) {
            headers.set('Content-Range', `bytes */${size}`);
            headers.delete('Content-Length');
            return new Response(null, { status: 416, headers });
        }

        headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
        headers.set('Content-Length', String(end - start + 1));
        return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), { status: 206, headers });
    },
};

// Las reglas de _headers no se aplican a lo que responde el Worker, así que los encabezados
// de los videos se ponen aquí: pedidos por partes, caché de un día y seguridad básica.
function videoHeaders(response) {
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'bytes');
    if (response.ok || response.status === 304) headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('X-Content-Type-Options', 'nosniff');
    return headers;
}

# Generador de Oficios Legales

Aplicación web estática para generar oficios legales a partir de una plantilla
con logo y márgenes configurables. Permite incluir u omitir los campos REF, MAT
y ADJ según cada caso, completar destinatario (A:) y remitente (DE:), y redactar
el cuerpo del documento. Exporta el resultado a PDF.

## Uso

Abre `index.html` en cualquier navegador moderno. No requiere build ni servidor.

Opcionalmente puedes servirlo localmente:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Estructura

- `index.html` — formulario y vista previa del documento.
- `styles.css` — estilos de la interfaz y del documento (tamaño carta/A4).
- `script.js` — lógica del formulario, render en vivo y exportación a PDF.

## Campos

- **Logo** (opcional): imagen que se embebe en el encabezado.
- **Márgenes** (cm): superior, derecho, inferior, izquierdo.
- **Lugar y fecha**, **N° de oficio**.
- **REF / MAT / ADJ** (opcionales, se muestran solo si se marcan).
- **A:** destinatario.
- **DE:** remitente.
- **Cuerpo** del oficio.

> El documento no incluye bloque de firma: la firma electrónica avanzada se
> aplica posteriormente en un sistema interno.

## Exportación

El botón *Descargar PDF* genera el archivo usando `html2pdf.js` (cargado por
CDN). El nombre del archivo se basa en el N° de oficio.

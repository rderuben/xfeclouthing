# Proyecto: Automatización de estatus de embarques aéreos

## Objetivo
Automatizar el aviso a clientes sobre el estatus de sus embarques de carga aérea. Hoy alguien consulta a mano la página de tracking de cada aerolínea y redacta un correo por cliente. La meta es que un script lo haga solo, a una hora definida.

## Contexto del negocio
- Freight forwarding de carga aérea en México.
- Cada embarque se identifica por su AWB (Air Waybill), con formato `PPP-NNNNNNNN`.
- Los primeros 3 dígitos del AWB son el **prefijo IATA de la aerolínea**. Por ejemplo, 139 es Aeroméxico Cargo, 001 es American y 057 es Air France.
- Cada aerolínea tiene su propia página de cargo tracking. Una persona la encuentra buscando "<aerolínea> cargo tracking", por ejemplo "Aeromexico cargo tracking".

## Flujo deseado
1. Leer la lista de embarques activos (AWB, nombre del cliente y correo del cliente) desde un Excel o CSV.
2. Tomar el prefijo del AWB y buscar en un directorio fijo la aerolínea y su URL oficial de tracking.
3. Abrir la página, capturar el AWB y extraer el estatus, el último movimiento con fecha y hora, y las piezas y el peso si aparecen.
4. Llenar una plantilla de correo con esos datos.
5. Dejar el correo como **borrador** (no enviar) durante la fase piloto.
6. Ejecutarlo de forma programada a una hora fija.

## Decisiones tomadas
- **No buscar en Google en cada ejecución.** Al buscar "Aeromexico cargo tracking", los primeros resultados son de terceros (TrackingMore, ShipsGo, GoComet, Parcels), no la página oficial. Por eso se usará un directorio fijo `prefijo → aerolínea → URL oficial` (por ejemplo `airlines.json`), que se llena una sola vez por aerolínea.
- **Borradores primero.** El envío automático se activa solo cuando el sistema demuestre que no falla.
- **Alternativa por evaluar:** usar un agregador (ShipsGo, TrackingMore o similar) en lugar de las páginas de cada aerolínea. Tiene la ventaja de ser un solo sitio o API para todas, pero implica posible retraso en los datos, costo y límites en el plan gratuito.

## Opciones técnicas consideradas
| Opción | Pros | Contras |
|---|---|---|
| Python + Playwright | Flexible, gratis, robusto | Requiere mantenimiento si la página cambia |
| Power Automate Desktop | Sin programar; integra Excel y Outlook | Frágil; la PC debe estar prendida |
| API de agregador | Lo más estable y escalable | Tiene costo |

Para Claude Code se sugiere **Python + Playwright**.

## Restricciones y riesgos
- **CAPTCHA:** no se debe intentar evadirlo. Si una aerolínea lo exige, ese caso se marca para revisión manual o se pasa a usar una API.
- **Login:** si alguna página lo pide, no se deben guardar contraseñas en el código. Usar variables de entorno o una sesión ya iniciada.
- **Cambios en la página:** aislar los selectores de cada aerolínea en un módulo propio, para que un rediseño solo rompa ese módulo.
- **Términos de uso:** las consultas deben ser pocas y espaciadas, nada de rastreo masivo.
- **Datos erróneos:** si no se pudo leer el estatus, no generar el correo. Registrar el error para revisión manual.
- **Confidencialidad:** cada correo debe llevar solo los embarques de ese cliente.

## Plantilla de correo
```
Asunto: Estatus embarque AWB {awb} – {fecha}

Estimado {cliente}, le compartimos la actualización de su embarque:
• Estatus: {estatus}
• Último movimiento: {ultimo_movimiento}
• Piezas / peso: {piezas} pzs / {peso} kg

Cualquier duda, quedamos atentos.
```

## Pendientes (los datos debe darlos el usuario)
- [ ] Lista de aerolíneas con las que se trabaja y la URL oficial de tracking de cada una.
- [ ] Un AWB de prueba por aerolínea.
- [ ] Saber si alguna página pide login o CAPTCHA.
- [ ] Cliente de correo: Gmail u Outlook.
- [ ] Hora de ejecución diaria.
- [ ] Formato de la lista de embarques (columnas del Excel).

## Primer paso sugerido
Construir un prototipo para **una sola aerolínea (Aeroméxico Cargo, prefijo 139)**:
1. Crear `airlines.json` con la entrada 139.
2. Escribir un scraper con Playwright que reciba un AWB y devuelva el estatus.
3. Generar el texto del correo con la plantilla e imprimirlo en consola, todavía sin enviar.
4. Cuando funcione, agregar más aerolíneas y la integración con el correo.

Documento de referencia del diseño: https://claude.ai/code/artifact/78a72c02-afbb-43a3-95ce-41683eb62fa2

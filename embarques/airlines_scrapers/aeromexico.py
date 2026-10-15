"""Scraper de Aeroméxico Cargo (prefijo 139).

Todo lo específico de la página vive aquí: si Aeroméxico rediseña su sitio,
solo se toca este módulo. SELECTORES POR VERIFICAR contra la página real.
"""
import re

from models import Tracking, TrackingError

# --- Selectores (ajustar tras inspeccionar la página real) ---
SEL_INPUT = "input[name='awb'], input[id*='awb' i], input[placeholder*='guía' i]"
SEL_SUBMIT = "button[type='submit']"
SEL_CAPTCHA = "iframe[src*='captcha' i], iframe[src*='recaptcha' i], .g-recaptcha, .h-captcha"
SEL_RESULTADO = "[data-testid='tracking-result'], .tracking-result"


def parse_resultado(awb: str, html_text: str) -> Tracking:
    """Extrae los datos del texto/HTML de resultados. Pura y testeable sin navegador."""
    text = re.sub(r"<[^>]+>", "\n", html_text)
    text = re.sub(r"\n\s*\n+", "\n", text)

    def campo(*etiquetas):
        for e in etiquetas:
            m = re.search(rf"{e}\s*[:\-]?\s*\n?\s*([^\n]+)", text, re.I)
            if m:
                return m.group(1).strip()
        return None

    estatus = campo("Estatus", "Status")
    movimiento = campo("Último movimiento", "Last event", "Last movement")
    if not estatus or not movimiento:
        raise TrackingError(f"AWB {awb}: no se encontró estatus/movimiento en la página")
    return Tracking(
        awb=awb,
        estatus=estatus,
        ultimo_movimiento=movimiento,
        piezas=campo("Piezas", "Pieces"),
        peso=(campo("Peso", "Weight") or "").replace("kg", "").strip() or None,
    )


def consultar(page, url: str, awb: str) -> Tracking:
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    if page.locator(SEL_CAPTCHA).count():
        raise TrackingError(f"AWB {awb}: la página exige CAPTCHA; revisión manual")
    page.fill(SEL_INPUT, awb.split("-")[1] if "-" in awb else awb)
    page.click(SEL_SUBMIT)
    try:
        page.wait_for_selector(SEL_RESULTADO, timeout=20000)
    except Exception as e:
        raise TrackingError(f"AWB {awb}: sin resultados (¿cambió la página?)") from e
    return parse_resultado(awb, page.inner_html(SEL_RESULTADO))

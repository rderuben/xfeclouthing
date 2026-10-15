"""Prototipo: consulta un AWB e imprime el correo (NO envía nada).

Uso: python main.py 139-12345678 "Nombre Cliente"
"""
import importlib
import json
import re
import sys
from pathlib import Path

from correo import generar
from models import TrackingError

AWB_RE = re.compile(r"^\d{3}-\d{8}$")


def cargar_directorio():
    return json.loads((Path(__file__).parent / "airlines.json").read_text(encoding="utf-8"))


def main(awb: str, cliente: str) -> int:
    if not AWB_RE.match(awb):
        print(f"AWB inválido: {awb} (formato PPP-NNNNNNNN)", file=sys.stderr)
        return 2
    aerolinea = cargar_directorio().get(awb[:3])
    if not aerolinea:
        print(f"Prefijo {awb[:3]} no está en airlines.json; revisión manual", file=sys.stderr)
        return 2
    scraper = importlib.import_module(f"airlines_scrapers.{aerolinea['scraper']}")

    from playwright.sync_api import sync_playwright
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            try:
                tracking = scraper.consultar(browser.new_page(), aerolinea["url"], awb)
            finally:
                browser.close()
    except TrackingError as e:
        print(f"ERROR (no se genera correo): {e}", file=sys.stderr)
        return 1
    print(generar(tracking, cliente))
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2]))

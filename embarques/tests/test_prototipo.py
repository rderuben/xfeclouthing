import sys
from datetime import date
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from airlines_scrapers.aeromexico import parse_resultado
from correo import generar
from models import TrackingError

HTML = """<div class="tracking-result">
<span>Estatus:</span><span>En tránsito</span>
<p>Último movimiento: 14/10/2026 18:30 MEX - Salida</p>
<p>Piezas: 4</p><p>Peso: 120.5 kg</p></div>"""


def test_parse_y_correo():
    t = parse_resultado("139-12345678", HTML)
    assert t.estatus == "En tránsito" and t.piezas == "4" and t.peso == "120.5"
    out = generar(t, "ACME", date(2026, 10, 15))
    assert "Asunto: Estatus embarque AWB 139-12345678 – 15/10/2026" in out
    assert "4 pzs / 120.5 kg" in out


def test_sin_datos_no_genera():
    with pytest.raises(TrackingError):
        parse_resultado("139-12345678", "<div>nada</div>")

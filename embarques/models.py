from dataclasses import dataclass
from typing import Optional


class TrackingError(Exception):
    """No se pudo leer el estatus (CAPTCHA, login, selector roto, etc.)."""


@dataclass
class Tracking:
    awb: str
    estatus: str
    ultimo_movimiento: str
    piezas: Optional[str] = None
    peso: Optional[str] = None

from datetime import date

from models import Tracking

PLANTILLA = """Asunto: Estatus embarque AWB {awb} – {fecha}

Estimado {cliente}, le compartimos la actualización de su embarque:
• Estatus: {estatus}
• Último movimiento: {ultimo_movimiento}
• Piezas / peso: {piezas} pzs / {peso} kg

Cualquier duda, quedamos atentos.
"""


def generar(t: Tracking, cliente: str, hoy: date | None = None) -> str:
    return PLANTILLA.format(
        awb=t.awb, fecha=(hoy or date.today()).strftime("%d/%m/%Y"), cliente=cliente,
        estatus=t.estatus, ultimo_movimiento=t.ultimo_movimiento,
        piezas=t.piezas or "N/D", peso=t.peso or "N/D",
    )

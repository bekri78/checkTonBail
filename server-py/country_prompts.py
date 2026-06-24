# ==========================================
# PROMPTS JURIDIQUES - FRANCE
# (port de country-prompts.js — seule la France est supportée)
# ==========================================

COUNTRY_LEGAL_PROMPTS = {
    "FR": {
        "name": "France",
        "flag": "FR",
        "laws": "loi du 6 juillet 1989, lois ALUR et ELAN, Code civil, Code de la construction et de l'habitation",
        "deposit_limits": {
            "unfurnished": "1 mois de loyer hors charges",
            "furnished": "2 mois de loyer hors charges",
        },
    }
}


def get_country_info(_country_code: str = "FR") -> dict:
    """Infos pays — seule la France est supportée."""
    return COUNTRY_LEGAL_PROMPTS["FR"]

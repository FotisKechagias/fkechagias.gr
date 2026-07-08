import json

from django import template
from django.conf import settings
from django.templatetags.static import static as static_url
from django.utils.safestring import mark_safe

register = template.Library()

MANIFEST_PATH = settings.BASE_DIR / 'static' / 'landing' / '.vite' / 'manifest.json'
_manifest = None


def _load_manifest():
    global _manifest
    if _manifest is not None and not settings.DEBUG:
        return _manifest
    if not MANIFEST_PATH.exists():
        return {}
    with open(MANIFEST_PATH, encoding='utf-8') as f:
        _manifest = json.load(f)
    return _manifest


@register.simple_tag
def vite_asset(entry):
    """Ρίχνει <link>/<script> tags για ένα Vite entry, διαβάζοντας το
    manifest.json που παράγεται με `build.manifest: true`. Έτσι δεν
    χρειάζεται να κυνηγάμε με το χέρι τα hashed filenames του build."""
    manifest = _load_manifest()
    info = manifest.get(entry)
    if not info:
        return ''

    tags = []
    for css_file in info.get('css', []):
        tags.append(f'<link rel="stylesheet" href="{static_url("landing/" + css_file)}">')
    file_ = info.get('file')
    if file_:
        tags.append(f'<script type="module" src="{static_url("landing/" + file_)}"></script>')

    return mark_safe('\n'.join(tags))

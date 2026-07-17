"""Μετρητής επισκέψεων — χωρίς cookies, χωρίς εξωτερικές υπηρεσίες.

Καταγράφει μόνο GET σελίδων περιεχομένου (όχι admin/static/media,
όχι AJAX, όχι γνωστά bots) ως άθροισμα ανά σελίδα/ημέρα. Δεν
αποθηκεύεται τίποτα προσωπικό — ούτε IP, ούτε user agent.
"""
from datetime import date

from django.db import IntegrityError
from django.db.models import F

BOT_MARKERS = ('bot', 'crawl', 'spider', 'slurp', 'preview', 'facebookexternalhit',
               'headless', 'lighthouse', 'monitor', 'curl', 'wget', 'python-requests')
SKIP_PREFIXES = ('/admin', '/static', '/media', '/robots.txt', '/sitemap',
                 '/favicon', '/apple-touch')


class VisitCounterMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            if (
                request.method == 'GET'
                and response.status_code == 200
                and 'text/html' in response.get('Content-Type', '')
                and not request.path.startswith(SKIP_PREFIXES)
                and request.headers.get('X-Requested-With') != 'XMLHttpRequest'
            ):
                ua = request.headers.get('User-Agent', '').lower()
                if ua and not any(m in ua for m in BOT_MARKERS):
                    self._count(request.path[:200])
        except Exception:
            pass
        return response

    @staticmethod
    def _count(path):
        from .models import DailyVisit
        today = date.today()
        updated = DailyVisit.objects.filter(date=today, path=path).update(
            count=F('count') + 1
        )
        if not updated:
            try:
                DailyVisit.objects.create(date=today, path=path, count=1)
            except IntegrityError:
                DailyVisit.objects.filter(date=today, path=path).update(
                    count=F('count') + 1
                )

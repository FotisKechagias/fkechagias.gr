from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from portfolio.sitemaps import ProjectSitemap, StaticViewSitemap

sitemaps = {
    'static': StaticViewSitemap,
    'projects': ProjectSitemap,
}


def robots_txt(request):
    return HttpResponse(
        'User-agent: *\n'
        'Disallow: /admin/\n'
        'Sitemap: https://fkechagias.gr/sitemap.xml\n',
        content_type='text/plain',
    )


urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt, name='robots_txt'),
    path('', include('portfolio.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from .models import Project
from .services_data import SERVICES


class StaticViewSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return ['index', 'project_list', 'build_together', 'digital_check', 'service_list']

    def location(self, item):
        return reverse(item)


class ServiceSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.7

    def items(self):
        return [s['slug'] for s in SERVICES]

    def location(self, slug):
        return reverse('service_detail', args=[slug])


class ProjectSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.6

    def items(self):
        return Project.objects.all()

    def lastmod(self, obj):
        return obj.created_at

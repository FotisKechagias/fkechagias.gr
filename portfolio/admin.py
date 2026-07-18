from django.contrib import admin
from django.utils.html import format_html
from .models import Project, Testimonial, ContactMessage, ProjectBrief, DailyVisit

admin.site.site_header = 'FKECHAGIAS — Διαχείριση'
admin.site.site_title = 'FKECHAGIAS'
admin.site.index_title = 'Πίνακας ελέγχου'


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client_name', 'industry', 'is_featured', 'order')
    list_editable = ('is_featured', 'order')
    list_filter = ('is_featured', 'industry')
    search_fields = ('title', 'client_name', 'industry')
    ordering = ('order',)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'client_company', 'rating', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    list_filter = ('is_active', 'rating')


@admin.register(ProjectBrief)
class ProjectBriefAdmin(admin.ModelAdmin):
    list_display = ('status_badge', 'business_name', 'contact_name', 'service_needed',
                    'budget', 'created_at', 'status')
    list_editable = ('status',)
    list_filter = ('status', 'service_needed', 'business_type')
    search_fields = ('business_name', 'contact_name', 'email', 'phone')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

    @admin.display(description='')
    def status_badge(self, obj):
        colors = {
            'new':      ('#7d8ff4', '#0b0e17'),
            'answered': ('#e0b45f', '#0b0e17'),
            'won':      ('#5fb787', '#0b0e17'),
            'lost':     ('#5a5a62', '#ffffff'),
        }
        bg, fg = colors.get(obj.status, ('#5a5a62', '#ffffff'))
        return format_html(
            '<span style="background:{};color:{};padding:3px 10px;'
            'border-radius:999px;font-size:11px;font-weight:600;">{}</span>',
            bg, fg, obj.get_status_display()
        )


@admin.register(DailyVisit)
class DailyVisitAdmin(admin.ModelAdmin):
    change_list_template = 'admin/portfolio/dailyvisit/change_list.html'
    list_display = ('date', 'path', 'count')
    list_filter = ('date',)
    search_fields = ('path',)
    ordering = ('-date', '-count')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        from datetime import date, timedelta
        from django.db.models import Sum
        today = date.today()
        days = [today - timedelta(days=i) for i in range(13, -1, -1)]
        totals = dict(
            DailyVisit.objects.filter(date__gte=days[0])
            .values_list('date')
            .annotate(total=Sum('count'))
        )
        chart = [{'date': d, 'total': totals.get(d, 0)} for d in days]
        peak = max((c['total'] for c in chart), default=0) or 1
        for c in chart:
            c['pct'] = round(c['total'] / peak * 100)
        extra_context = extra_context or {}
        extra_context['visit_chart'] = chart
        extra_context['visit_sum'] = sum(c['total'] for c in chart)
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'service', 'created_at', 'is_read')
    list_editable = ('is_read',)
    list_filter = ('is_read', 'service')
    readonly_fields = ('name', 'email', 'phone', 'service', 'message', 'created_at')
    ordering = ('-created_at',)

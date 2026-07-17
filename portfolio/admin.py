from django.contrib import admin
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
    list_display = ('business_name', 'contact_name', 'business_type', 'service_needed', 'budget', 'created_at', 'is_read')
    list_editable = ('is_read',)
    list_filter = ('is_read', 'service_needed', 'business_type')
    search_fields = ('business_name', 'contact_name', 'email', 'phone')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(DailyVisit)
class DailyVisitAdmin(admin.ModelAdmin):
    list_display = ('date', 'path', 'count')
    list_filter = ('date',)
    search_fields = ('path',)
    ordering = ('-date', '-count')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'service', 'created_at', 'is_read')
    list_editable = ('is_read',)
    list_filter = ('is_read', 'service')
    readonly_fields = ('name', 'email', 'phone', 'service', 'message', 'created_at')
    ordering = ('-created_at',)

from django.contrib import admin
from .models import Project, Testimonial, ContactMessage


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


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'service', 'created_at', 'is_read')
    list_editable = ('is_read',)
    list_filter = ('is_read', 'service')
    readonly_fields = ('name', 'email', 'phone', 'service', 'message', 'created_at')
    ordering = ('-created_at',)

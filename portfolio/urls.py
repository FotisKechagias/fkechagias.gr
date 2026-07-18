from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('projects/', views.project_list, name='project_list'),
    path('project/<int:pk>/', views.project_detail, name='project_detail'),
    path('contact/submit/', views.contact_submit, name='contact_submit'),
    path('xtisoume-mazi/', views.build_together, name='build_together'),
    path('xtisoume-mazi/submit/', views.build_submit, name='build_submit'),
    path('elegxos/', views.digital_check, name='digital_check'),
    path('ypiresies/', views.service_list, name='service_list'),
    path('ypiresies/<slug:slug>/', views.service_detail, name='service_detail'),
]

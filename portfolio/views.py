import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.mail import EmailMessage
from django.conf import settings
from .models import Project, Testimonial, ContactMessage


def index(request):
    projects = Project.objects.filter(is_featured=True)
    testimonials = Testimonial.objects.filter(is_active=True)
    context = {
        'projects': projects,
        'testimonials': testimonials,
    }
    return render(request, 'portfolio/index.html', context)


def project_list(request):
    projects = Project.objects.all()
    return render(request, 'portfolio/project_list.html', {'projects': projects})


def project_detail(request, pk):
    project = get_object_or_404(Project, pk=pk)
    return render(request, 'portfolio/project_detail.html', {'project': project})


@require_POST
def contact_submit(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        service = data.get('service', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not message:
            return JsonResponse({'success': False, 'error': 'Συμπληρώστε τα υποχρεωτικά πεδία.'}, status=400)

        ContactMessage.objects.create(
            name=name,
            email=email,
            phone=phone,
            service=service,
            message=message,
        )

        subject = f'Νέο μήνυμα από {name} — FKECHAGIAS'
        body = f"""Νέο μήνυμα επικοινωνίας:

Όνομα:     {name}
Email:     {email}
Τηλέφωνο: {phone or '—'}
Υπηρεσία: {service or '—'}

Μήνυμα:
{message}
"""
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email='noreply@fkechagias.gr',
            to=[settings.CONTACT_RECIPIENT_EMAIL],
            reply_to=[email],
        )
        msg.send(fail_silently=False)

        return JsonResponse({'success': True, 'message': 'Το μήνυμά σας εστάλη επιτυχώς!'})

    except (json.JSONDecodeError, Exception) as e:
        return JsonResponse({'success': False, 'error': 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.'}, status=500)

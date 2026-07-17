import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.mail import EmailMessage
from django.conf import settings
from .models import Project, Testimonial, ContactMessage, ProjectBrief


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


def build_together(request):
    """Διαδραστική σελίδα-οδηγός «Ας χτίσουμε μαζί»."""
    return render(request, 'portfolio/build_together.html')


@require_POST
def build_submit(request):
    """Παραλαβή του αναλυτικού brief (multipart λόγω logo) + αναλυτικό email."""
    try:
        d = request.POST

        # Honeypot: το πεδίο "website" είναι αόρατο για ανθρώπους —
        # αν έχει τιμή, είναι bot. Απαντάμε "επιτυχία" χωρίς να σώσουμε.
        if d.get('website', '').strip():
            return JsonResponse({'success': True})

        contact_name  = d.get('contact_name', '').strip()[:200]
        business_name = d.get('business_name', '').strip()[:200]
        business_type = d.get('business_type', '').strip()[:120]
        service       = d.get('service_needed', '').strip()[:120]
        current_url   = d.get('current_url', '').strip()[:200]
        email         = d.get('email', '').strip()[:254]
        phone         = d.get('phone', '').strip()[:30]
        city          = d.get('city', '').strip()[:120]
        address       = d.get('address', '').strip()[:200]
        budget        = d.get('budget', '').strip()[:60]
        timeline      = d.get('timeline', '').strip()[:60]
        vision        = d.get('vision', '').strip()[:5000]
        logo          = request.FILES.get('logo')

        if not contact_name or not business_name or not email:
            return JsonResponse({'success': False, 'error': 'Λείπουν υποχρεωτικά πεδία.'}, status=400)

        if logo:
            if logo.size > 5 * 1024 * 1024:
                return JsonResponse({'success': False, 'error': 'Το logo ξεπερνά τα 5MB.'}, status=400)
            if not (logo.content_type or '').startswith('image/'):
                return JsonResponse({'success': False, 'error': 'Το logo πρέπει να είναι εικόνα.'}, status=400)

        brief = ProjectBrief.objects.create(
            contact_name=contact_name,
            business_name=business_name,
            business_type=business_type,
            service_needed=service,
            current_url=current_url,
            logo=logo,
            email=email,
            phone=phone,
            city=city,
            address=address,
            budget=budget,
            timeline=timeline,
            vision=vision,
        )

        body = f"""Νέο αίτημα project από τη σελίδα «Ας χτίσουμε μαζί»
═══════════════════════════════════════════════

ΕΠΙΧΕΙΡΗΣΗ
  Όνομα:              {business_name}
  Τύπος:              {business_type or '—'}
  Υπάρχουσα σελίδα:   {current_url or '—'}
  Logo:               {'Επισυνάπτεται' if logo else 'Δεν δόθηκε'}

ΤΙ ΧΡΕΙΑΖΕΤΑΙ
  Υπηρεσία:           {service or '—'}
  Budget:             {budget or '—'}
  Χρονοδιάγραμμα:     {timeline or '—'}

ΕΠΙΚΟΙΝΩΝΙΑ
  Όνομα:              {contact_name}
  Email:              {email}
  Κινητό:             {phone or '—'}
  Πόλη:               {city or '—'}
  Διεύθυνση:          {address or '—'}

ΟΡΑΜΑ / ΣΗΜΕΙΩΣΕΙΣ
{vision or '—'}

═══════════════════════════════════════════════
Αποθηκεύτηκε και στο admin: /admin/portfolio/projectbrief/{brief.pk}/
"""
        try:
            # From: ΠΑΝΤΑ διεύθυνση του domain μας — αν μπει gmail κ.λπ.
            # στο From ενώ στέλνουμε από τον δικό μας server, η Gmail το
            # απορρίπτει με DMARC (550 5.7.26). Το gmail πάει μόνο στο to/reply_to.
            msg = EmailMessage(
                subject=f'Νέο project brief: {business_name} ({service or "—"}) — FKECHAGIAS',
                body=body,
                from_email='noreply@fkechagias.gr',
                to=[settings.CONTACT_RECIPIENT_EMAIL],
                reply_to=[email],
            )
            if logo:
                logo.seek(0)
                msg.attach(logo.name, logo.read(), logo.content_type)
            msg.send(fail_silently=False)
        except Exception:
            # Το brief έχει ήδη σωθεί στη βάση/admin — μη χαθεί το lead
            # επειδή απέτυχε στιγμιαία το SMTP.
            pass

        # Αυτόματη επιβεβαίωση προς τον πελάτη — χτίζει εμπιστοσύνη
        # και κλειδώνει την προσδοκία των 24 ωρών.
        try:
            confirm = EmailMessage(
                subject='Έλαβα το αίτημά σας — FKECHAGIAS',
                body=f"""Γεια σας {contact_name},

Ευχαριστώ για τον χρόνο σας! Έλαβα το αίτημα για την επιχείρησή σας
«{business_name}» και θα το μελετήσω προσεκτικά.

Θα σας απαντήσω εντός 24 ωρών με συγκεκριμένη πρόταση.

Στο μεταξύ, αν θέλετε να προσθέσετε κάτι, απαντήστε απευθείας σε αυτό
το email ή καλέστε με στο +30 6987 530 306.

Φώτης Κεχαγιάς
Web Designer & Developer
https://fkechagias.gr
""",
                from_email='noreply@fkechagias.gr',
                to=[email],
                reply_to=[settings.CONTACT_RECIPIENT_EMAIL],
            )
            confirm.send(fail_silently=True)
        except Exception:
            pass

        return JsonResponse({'success': True})

    except Exception:
        return JsonResponse({'success': False, 'error': 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.'}, status=500)


@require_POST
def contact_submit(request):
    try:
        data = json.loads(request.body)

        # Honeypot (βλ. build_submit)
        if data.get('website', '').strip():
            return JsonResponse({'success': True, 'message': 'OK'})

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

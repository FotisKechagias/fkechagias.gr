from django.db import models
from django.urls import reverse


class Project(models.Model):
    title = models.CharField(max_length=200, verbose_name="Τίτλος")
    client_name = models.CharField(max_length=200, verbose_name="Όνομα Πελάτη")
    industry = models.CharField(max_length=100, verbose_name="Κλάδος")
    description = models.TextField(verbose_name="Περιγραφή")
    case_study = models.TextField(blank=True, verbose_name="Case Study")
    technologies = models.CharField(max_length=500, verbose_name="Τεχνολογίες (κόμμα)")
    image = models.ImageField(upload_to='projects/', verbose_name="Εικόνα")
    live_url = models.URLField(blank=True, verbose_name="Live URL")
    is_featured = models.BooleanField(default=True, verbose_name="Featured")
    order = models.PositiveIntegerField(default=0, verbose_name="Σειρά")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Έργο"
        verbose_name_plural = "Έργα"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('project_detail', args=[self.pk])

    def get_technologies_list(self):
        return [t.strip() for t in self.technologies.split(',') if t.strip()]


class Testimonial(models.Model):
    client_name = models.CharField(max_length=200, verbose_name="Όνομα")
    client_role = models.CharField(max_length=200, verbose_name="Ρόλος")
    client_company = models.CharField(max_length=200, blank=True, verbose_name="Εταιρεία")
    content = models.TextField(verbose_name="Κείμενο")
    rating = models.PositiveSmallIntegerField(default=5, verbose_name="Βαθμολογία")
    is_active = models.BooleanField(default=True, verbose_name="Ενεργό")
    order = models.PositiveIntegerField(default=0, verbose_name="Σειρά")

    class Meta:
        ordering = ['order']
        verbose_name = "Μαρτυρία"
        verbose_name_plural = "Μαρτυρίες"

    def __str__(self):
        return f"{self.client_name} — {self.client_company}"


class ProjectBrief(models.Model):
    """Αναλυτικό αίτημα από τη σελίδα «Ας χτίσουμε μαζί»."""
    contact_name = models.CharField(max_length=200, verbose_name="Όνομα")
    business_name = models.CharField(max_length=200, verbose_name="Επιχείρηση")
    business_type = models.CharField(max_length=120, verbose_name="Τύπος επιχείρησης")
    service_needed = models.CharField(max_length=120, verbose_name="Τι χρειάζεται")
    current_url = models.URLField(blank=True, verbose_name="Υπάρχουσα σελίδα")
    logo = models.ImageField(upload_to='briefs/', blank=True, verbose_name="Logo")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Κινητό")
    city = models.CharField(max_length=120, blank=True, verbose_name="Πόλη")
    address = models.CharField(max_length=200, blank=True, verbose_name="Διεύθυνση")
    budget = models.CharField(max_length=60, blank=True, verbose_name="Budget")
    timeline = models.CharField(max_length=60, blank=True, verbose_name="Χρονοδιάγραμμα")
    vision = models.TextField(blank=True, verbose_name="Όραμα / Σημειώσεις")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ημερομηνία")
    is_read = models.BooleanField(default=False, verbose_name="Διαβάστηκε")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Αίτημα Project"
        verbose_name_plural = "Αιτήματα Project"

    def __str__(self):
        return f"{self.business_name} — {self.contact_name} ({self.created_at.strftime('%d/%m/%Y')})"


class ContactMessage(models.Model):
    SERVICE_CHOICES = [
        ('custom', 'Custom Website Development'),
        ('business', 'Business Website'),
        ('realestate', 'Real Estate Website'),
        ('ecommerce', 'E-Commerce Store'),
        ('landing', 'Landing Page'),
        ('redesign', 'Website Redesign'),
        ('seo', 'SEO Optimization'),
        ('maintenance', 'Website Maintenance'),
        ('ai', 'AI Chatbot Integration'),
        ('performance', 'Performance Optimization'),
        ('other', 'Άλλο'),
    ]
    name = models.CharField(max_length=200, verbose_name="Όνομα")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Τηλέφωνο")
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES, blank=True, verbose_name="Υπηρεσία")
    message = models.TextField(verbose_name="Μήνυμα")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ημερομηνία")
    is_read = models.BooleanField(default=False, verbose_name="Διαβάστηκε")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Μήνυμα Επικοινωνίας"
        verbose_name_plural = "Μηνύματα Επικοινωνίας"

    def __str__(self):
        return f"{self.name} — {self.email} ({self.created_at.strftime('%d/%m/%Y')})"

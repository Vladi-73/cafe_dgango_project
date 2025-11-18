from django.db import models


class Client(models.Model):
    phone = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100, blank=True)
    qr_code = models.CharField(max_length=100, unique=True, blank=True)
    orders_count = models.IntegerField(default=0)
    discount = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.phone} ({self.orders_count} заказов)"


class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('base', 'Основа для завтрака'),
        ('ingredient', 'Ингредиенты'),
        ('drink', 'Напитки'),
        ('cook_method', 'Способ приготовления'),
        ('utensil', 'Приборы'),
    ]

    UNIT_CHOICES = [
        ('piece', 'шт'),
        ('gram', 'г'),
        ('ml', 'мл'),
        ('slice', 'ломтик'),
        ('spoon', 'ложка'),
        ('portion', 'порция'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='piece')
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('paid', 'Оплачен'),
        ('cancelled', 'Отменен'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    items = models.JSONField(default=dict)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Заказ #{self.id} - {self.client.phone if self.client else 'Гость'}"


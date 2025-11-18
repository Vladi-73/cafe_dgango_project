from django.contrib import admin
from .models import MenuItem, Order, Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['phone', 'name', 'orders_count', 'discount', 'created_at']
    search_fields = ['phone', 'name']
    list_filter = ['created_at']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'unit', 'order']
    list_filter = ['category']
    list_editable = ['price', 'unit', 'order']
    search_fields = ['name']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'total', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['client__phone']
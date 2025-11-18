from django.shortcuts import render
from django.http import JsonResponse
from .models import MenuItem, Client, Order
import json


def menu_page(request):
    """Главная страница с меню"""
    # Группируем товары по категориям
    menu_items = MenuItem.objects.all().order_by('order')

    categories = {}
    for item in menu_items:
        if item.category not in categories:
            categories[item.category] = []
        categories[item.category].append(item)

    return render(request, 'cafe/menu.html', {
        'categories': categories
    })


def add_to_cart(request):
    """Добавление товара в корзину"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Здесь будет логика добавления в корзину
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)

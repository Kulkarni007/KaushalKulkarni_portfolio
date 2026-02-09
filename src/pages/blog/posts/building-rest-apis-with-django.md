---
layout: /src/layouts/MarkdownPostLayout.astro
title: Building REST APIs with Django REST Framework
author: Kaushal Kulkarni
description: "Learn how to build robust REST APIs using Django REST Framework. This guide covers serializers, viewsets, authentication, and best practices for building scalable backend systems."
image:
  url: "/images/posts/django-rest-api.svg"
  alt: "Django REST API architecture diagram showing endpoints, serializers, and database models"
pubDate: 2025-01-15
tags:
  [
    "Python", "Django", "REST-API", "Backend", "Web-Development"
  ]
languages: ["python", "django", "javascript"]
---

Django REST Framework (DRF) is a powerful toolkit for building Web APIs in Python. It provides a clean, modular architecture that makes it easy to build robust and scalable REST APIs.

## Why Django REST Framework?

DRF offers several advantages for API development:

- **Serialization**: Complex data types like model instances can be converted to native Python datatypes
- **Authentication**: Built-in support for various authentication schemes
- **Permissions**: Fine-grained control over who can access what
- **Viewsets**: Concise way to build CRUD operations
- **Documentation**: Auto-generated API documentation

## Getting Started

First, install DRF:

```bash
pip install djangorestframework
```

Add it to your `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
]
```

## Creating a Simple API

### 1. Define Your Model

```python
# models.py
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

### 2. Create a Serializer

```python
# serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
```

### 3. Build the ViewSet

```python
# views.py
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

### 4. Configure URLs

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

## Advanced Features

### Custom Permissions

```python
# permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
```

### Custom Actions

```python
# views.py
from rest_framework.decorators import action
from rest_framework.response import Response

class ProductViewSet(viewsets.ModelViewSet):
    # ... existing code
    
    @action(detail=True, methods=['post'])
    def mark_featured(self, request, pk=None):
        product = self.get_object()
        product.featured = True
        product.save()
        return Response({'status': 'product marked as featured'})
```

## Best Practices

1. **Use ViewSets for CRUD operations** - They provide built-in actions for create, retrieve, update, and delete
2. **Implement proper authentication** - Use token-based authentication for APIs
3. **Add pagination** - Prevent large datasets from slowing down your API
4. **Use throttling** - Protect your API from abuse
5. **Write comprehensive tests** - Ensure your API works as expected

## Testing Your API

DRF provides excellent testing utilities:

```python
# tests.py
from rest_framework.test import APITestCase
from rest_framework import status

class ProductAPITestCase(APITestCase):
    def test_create_product(self):
        data = {
            'name': 'Test Product',
            'description': 'A test product',
            'price': '29.99'
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

## Conclusion

Django REST Framework provides everything you need to build professional-grade APIs. Its modular design, extensive documentation, and powerful features make it an excellent choice for backend development.

By following the patterns and best practices outlined in this guide, you can build APIs that are not only functional but also maintainable and scalable.

Happy coding! 🚀

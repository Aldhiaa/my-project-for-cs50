from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name


class Place(models.Model):
    person = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="user")
    title = models.CharField(max_length=400, blank=True, null=True)
    description = models.CharField(max_length=2000, blank=True, null=True)
    image = models.ImageField(upload_to="myplaces/static/places_pictures", default="myplaces/static/places_pictures/default.png", blank=True)
    address = models.CharField(max_length=2000, blank=True, null=True)
    longitude = models.CharField(max_length=400, blank=True, null=True)
    latitude = models.CharField(max_length=400, blank=True, null=True)
    country = models.CharField(max_length=400, blank=True, null=True)
    city = models.CharField(max_length=400, blank=True, null=True)
    categories = models.ManyToManyField(Category, blank=True, related_name="categories")
    date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.id} - {self.person} added an address on {self.date.strftime('%d %b %Y')} - Title: {self.title} "

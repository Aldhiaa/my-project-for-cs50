from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name    


class Listing(models.Model):
    imageURL = models.CharField(max_length=2000)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=400)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, blank=True, null=True, related_name="category")
    starting_price = models.FloatField()
    creation_date = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="user")
    watchlist = models.ManyToManyField(User, null=True, blank=True, related_name="user_watchlist")
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="winner_listing")

    def __str__(self):
        return self.title

class Bid(models.Model):
    person = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="person_bid")
    price = models.FloatField()
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, null=True, blank=True, related_name="listing_Bid")
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.person} bidded ${self.price} on {self.listing}"


class Comment(models.Model):
    person = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="person_comment")
    comment = models.CharField(max_length=500)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, null=True, blank=True, related_name="listing_comment")
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.person} on {self.listing} on {self.date}"
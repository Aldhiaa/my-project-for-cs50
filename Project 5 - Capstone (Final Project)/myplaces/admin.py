from django.contrib import admin
from myplaces.models import User, Place, Category

# Register your models here.
admin.site.register(User)
admin.site.register(Place)
admin.site.register(Category)
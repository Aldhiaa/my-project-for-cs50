from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("myplaces", views.myplaces, name="myplaces"),
    path("submitNewPlace", views.submitNewPlace, name="submitNewPlace"),
    path("submitEditPlace", views.submitEditPlace, name="submitEditPlace"),
    path("deletePlace/<int:id>", views.deletePlace, name="deletePlace"),
    path("getUserLocations", views.getUserLocations, name="getUserLocations"),
    path("getLocationsByCategory/<str:category>", views.getLocationsByCategory, name="getLocationsByCategory"),
]

# This enables us to display images from the database to the client
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

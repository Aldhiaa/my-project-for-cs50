from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("followings", views.following_page, name="following_page"),
    path("newPost/", views.newPost, name="newPost"),
    path("edit/<int:post_id>", views.new_edit, name="edit"),
    path("like/<int:post_id>", views.like, name="like"),
    path("follow/<int:id>", views.follow, name="follow"),
    path("unfollow/<int:id>", views.unfollow, name="unfollow"),
    path("delete/<int:post_id>", views.deletePost, name="delete"),
    path("editProfile/<int:profile_id>", views.editProfile, name="editProfile"),
]

# This enables us to display images from the database to the client
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

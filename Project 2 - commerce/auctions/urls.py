from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_listing", views.create_listing, name="create_listing"),
    path("show_listing_by_category", views.show_listing_by_category, name="show_listing_by_category"),
    path("listing_page_info/<int:id>", views.listing_page_info, name="listing_page_info"),
    path("addtowatchlist/<int:id>", views.addtowatchlist, name="addtowatchlist"),
    path("removefromwatchlist/<int:id>", views.removefromwatchlist, name="removefromwatchlist"),
    path("show_watchlist", views.show_watchlist, name="show_watchlist"),
    path("comment/<int:id>", views.comment, name="comment"),
    path("delete_comment/<int:id>", views.delete_comment, name="delete_comment"),
    path("bid/<int:id>", views.bid, name="bid"),
    path("close_auction/<int:id>", views.close_auction, name="close_auction"),
    path("bid_won", views.bid_won, name="bid_won")
]

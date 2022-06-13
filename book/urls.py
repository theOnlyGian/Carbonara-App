from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt


urlpatterns = [
    path('', csrf_exempt(views.home), name ='home'),
    path('plates/', csrf_exempt(views.platesView), name='plates'),
    path('login/', views.loginView, name='login'),
    path('register/', views.registerView, name='register'),
    path('logout', views.logoutView, name='logout')
]

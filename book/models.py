from django.db import models
from django.contrib.auth.models import AbstractUser

class Recipe(models.Model):
    title = models.CharField(blank=False, max_length=64)
    mealType = models.CharField(blank='False', max_length=64)
    tempoStimato = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    recipeUrl = models.TextField();
    
    def __str__(self):
        return f'{self.title} {self.mealType} {self.tempoStimato}'

class MyUser(AbstractUser):
    recipes = models.ManyToManyField(Recipe, related_name='owners', blank=True)
    bio = models.TextField(blank=True)
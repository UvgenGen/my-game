from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class UserRegistrationForm(UserCreationForm):
    name = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-500'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-500'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-500'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

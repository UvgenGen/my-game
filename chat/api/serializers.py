from rest_framework import serializers

from user_profile.api.serializers import UserSerializer
from chat.models import Post

class chaterializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    publish_date = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'message', 'user', 'publish_date']

    def get_publish_date(self, post):
        publish_date = post.publish_date
        return publish_date.strftime("%d.%m.%Y, %H:%M")

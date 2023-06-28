from rest_framework import serializers

from user_profile.api.serializers import UserSerializer
from chat.models import Message

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    publish_date = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'message', 'user', 'publish_date', 'game']

    def get_publish_date(self, post):
        publish_date = post.publish_date
        return publish_date.strftime("%d.%m.%Y, %H:%M")

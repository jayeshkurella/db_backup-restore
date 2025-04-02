
from django.contrib.gis.db import models

class MissingPerson(models.Model):
    name = models.CharField(max_length=255)
    last_known_location =models.PointField()
    date_missing = models.DateField()

    def __str__(self):
        return self.name

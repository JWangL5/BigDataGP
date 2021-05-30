from django.db import models

# Create your models here.
from neomodel import StructuredNode, StringProperty, DateProperty


class Paper(StructuredNode):
	title = StringProperty()
	journal = StringProperty()
	year = StringProperty()
	doi = StringProperty(unique_index=True)

	def __unicode__(self):
		return f'{self.title} {self.journal} {self.year} {self.doi}'


class Author(StructuredNode):
	name = StringProperty()

	def __unicode__(self):
		return self.name

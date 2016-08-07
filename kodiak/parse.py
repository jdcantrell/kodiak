import docutils.core
from docutils.parsers.rst import directives
from docutils.writers.html4css1 import Writer

from kodiak.directives import Images
from kodiak.translator import Translator

class Parser:

    def __init__(self):
        directives.register_directive('images', Images)

        self.html_writer = Writer()
        self.html_writer.translator_class = Translator

    def parse(self, rst_string):
        doctree = docutils.core.publish_doctree(source=rst_string)

        #remove docinfo and fields
        return docutils.core.publish_from_doctree(doctree, writer=self.html_writer)




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
        return  docutils.core.publish_string(source=rst_string, writer=self.html_writer)

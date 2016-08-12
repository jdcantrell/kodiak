import docutils.core
from docutils.parsers.rst import directives

from kodiak.directives import Images
from kodiak.translator import Translator, KodiakWriter

class Parser:

    def __init__(self):
        directives.register_directive('images', Images)

        self.html_writer = KodiakWriter()
        self.html_writer.translator_class = Translator

    def parse(self, rst_string):
        doctree = docutils.core.publish_doctree(source=rst_string)

        #remove docinfo and fields
        return docutils.core.publish_from_doctree(doctree, writer=self.html_writer)




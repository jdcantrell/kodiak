import docutils.core
from docutils.parsers.rst import directives
from docutils.utils import SystemMessage

from kodiak.directives import Images, KodiakImage
from kodiak.translator import Translator, KodiakWriter

class Parser:

    def __init__(self):
        directives.register_directive('images', Images)
        directives.register_directive('image', KodiakImage)

        self.html_writer = KodiakWriter()
        self.html_writer.translator_class = Translator

    def parse(self, rst_string):
        try:
            doctree = docutils.core.publish_doctree(source=rst_string)
        except SystemMessage as message:
            msg = '<html><body><pre>Line %s</pre></body></html>' % message.args
            return msg.replace('<string>','')

        #remove docinfo and fields
        return docutils.core.publish_from_doctree(doctree, writer=self.html_writer)




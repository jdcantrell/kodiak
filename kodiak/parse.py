import docutils.core
from docutils.parsers.rst import directives
from docutils.utils import SystemMessage

from kodiak.directives import Images, KodiakImage
from kodiak.translator import Translator, KodiakWriter

import re

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

def extract_info(rst_string):
    #find title lines
    info = {
        'title': 'None'
    }
    lines = rst_string.splitlines()
    for idx, line in enumerate(lines):
        if idx > 0 and re.match('^=+$', line):
            info['title'] = lines[idx - 1]
            break

    meta_tags = ['slug', 'date', 'tags']
    for meta in meta_tags:
        regex = '^:%s: (.*)$' % meta
        match = re.search(regex, rst_string, re.MULTILINE)
        if match is not None:
            info[meta] = match.group(1).strip()

    return info

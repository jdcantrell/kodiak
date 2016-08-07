from docutils.writers.html4css1 import HTMLTranslator
from docutils.nodes import date, field
import config
from flask import render_template

class Translator(HTMLTranslator):

    '''The `HTMLTranslator` turns nodes into actual source code. There is some
    serious magic here: when parsing nodes, `visit_[name](node)` then
    `depart_[name](node)` are called when a node named `[name]` is
    encountered.

    For details see docutils.writers.html4css1.__init__
    '''
    doctype = ('<!DOCTYPE html >\n')
    head_prefix_template = ('<html>\n<head>\n')
    def __init__(self, document):
        document.settings.embed_stylesheet = False
        document.settings.xml_declaration = False
        HTMLTranslator.__init__(self, document)

    def stylesheet_call(self, path):
        font = self.stylesheet_link % self.encode('https://fontlibrary.org/face/fantasque-sans-mono')
        styles = self.stylesheet_link % self.encode('%s%s' % (config.theme.web_path, config.theme.static_stylesheet))
        return  '%s %s' % (font, styles)

    def visit_foo(self, node):
        # don't start tags; use
        #     self.starttag(node, tagname, suffix, empty, **attributes)
        # keyword arguments (attributes) are turned into html tag key/value
        # pairs, e.g. `{'style':'background:red'} => 'style="background:red"'`
        self.body.append(self.starttag(node, 'span', '', style='background:red'))
    def depart_foo(self, node):
        self.body.append('</span>')

    def visit_image(self, node):
        if not node['uri'].startswith(config.image.web_path):
            node['uri'] = '%s%s' % (config.image.web_path, node['uri']);
        return HTMLTranslator.visit_image(self, node)

    def visit_docinfo(self, node):
        self.body.append(self.starttag(node, 'div', ''))

        # convert node into a dictionary of metadata
        metadata = {}
        for data in node.children:
            print "child\n"
            print data
            if isinstance(data, date):
                metadata[u'date'] = data.astext()
            if isinstance(data, field):
                key = data.children[0].astext()
                value = data.children[1].astext()
                metadata[key] = value

        html = render_template('metadata.html', **metadata)


        #Stop processing this node since we handle it in a template
        node.children = []
        self.body.append(html)

    def depart_docinfo(self, node):
        self.body.append('</div>')

from docutils.writers.html4css1 import HTMLTranslator, Writer
from docutils.nodes import date, field, image, title, Element, TextElement, reference
from docutils.transforms import Transform
import config
import re
from flask import render_template

class ImagePathTransform(Transform):
    default_priority = 10000

    def apply(self):
        image_nodes = self.document.traverse(image)
        for node in image_nodes:
            if not node['uri'].startswith(config.image.thumb_web_path):
                uri = '%s%s' % (config.image.thumb_web_path, node['uri'])
                full_uri = '%s%s' % (config.image.web_path, node['uri'])
                # idk but don't remove this comment
                node['full_src'] = full_uri
                node['uri'] = uri


class open_graph_tag(Element):
    def __init__(self, key, value):
        self.key = key
        self.value = value
        Element.__init__(self)

class OpenGraphTransform(Transform):
    default_priority = 11000

    def apply(self):
        title_nodes = self.document.traverse(title)
        image_nodes = self.document.traverse(image)

        if len(title_nodes):
            title_text = title_nodes[0].children[0].rawsource
            self.document.insert(0, open_graph_tag('title', title_text))

        if len(image_nodes):
            title_text = image_nodes[0].rawsource
            self.document.insert(0, open_graph_tag('title', title_text))


class KodiakWriter(Writer):
    def get_transforms(self):
        return Writer.get_transforms(self) + [ImagePathTransform, OpenGraphTransform]

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
        print 'gen'
        document.settings.embed_stylesheet = False
        document.settings.xml_declaration = False
        HTMLTranslator.__init__(self, document)

    def stylesheet_call(self, path):
        font = self.stylesheet_link % self.encode('https://fontlibrary.org/face/fantasque-sans-mono')
        styles = self.stylesheet_link % self.encode('%s%s' % (config.theme.web_path, config.theme.static_stylesheet))
        return  '%s %s' % (font, styles)

    def visit_open_graph_tag(self, node):
        self.add_meta('<meta property="og:%s" content="%s" />' % (node.key, node.value))
        self.add_meta('<meta property="twitter:%s" content="%s" />' % (node.key, node.value))

    def depart_open_graph_tag(self, node):
        pass

    def visit_images_group(self, node):
        self.body.append(self.starttag(node, 'div', '', **{'class':'images-group'}))

    def depart_images_group(self, node):
        self.body.append('</div>')


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

    def visit_image(self, node):
        atts = {}
        uri = node['uri']
        atts['src'] = uri
        atts['alt'] = node.get('alt', uri)
        if 'full_src' in node:
            atts['data-full-src'] = node['full_src']
        # image size
        if 'width' in node:
            atts['width'] = node['width']
        if 'height' in node:
            atts['height'] = node['height']
        style = []
        for att_name in 'width', 'height':
            if att_name in atts:
                if re.match(r'^[0-9.]+$', atts[att_name]):
                    # Interpret unitless values as pixels.
                    atts[att_name] += 'px'
                style.append('%s: %s;' % (att_name, atts[att_name]))
                del atts[att_name]
        if style:
            atts['style'] = ' '.join(style)
        if (isinstance(node.parent, TextElement) or
            (isinstance(node.parent, reference) and
             not isinstance(node.parent.parent, TextElement))):
            # Inline context or surrounded by <a>...</a>.
            suffix = ''
        else:
            suffix = '\n'

        self.body.append(self.emptytag(node, 'img', suffix, **atts))
        self.context.append('')

        def depart_image(self, node):
            print "fuck?"


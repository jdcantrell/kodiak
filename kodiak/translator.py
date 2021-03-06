from docutils.writers.html4css1 import HTMLTranslator, Writer
from docutils.nodes import date, field, image, title, Element, TextElement, reference, raw
from docutils.transforms import Transform
from config import config
import re
from flask import render_template
import jinja2


def render_theme_template(path, template, **context):
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(path + '/')
    ).get_template(template).render(context)

class ImagePathTransform(Transform):
    default_priority = 10000

    def apply(self):
        image_nodes = self.document.traverse(image)
        for node in image_nodes:
            if not node['uri'].startswith(config['image']['thumb_web_path']):
                uri = '%s%s' % (config['image']['thumb_web_path'], node['uri'])
                full_uri = '%s%s' % (config['image']['web_path'], node['uri'])
                # idk but don't remove this comment
                node['full_src'] = full_uri
                node['uri'] = uri

class ImageSizeToCss(Transform):
    default_priority = 10001

    next_id = 0;

    def getNextId(self):
        self.next_id += 1;
        return self.next_id;

    def apply(self):
        image_nodes = self.document.traverse(image)
        styles = []
        for node in image_nodes:
            if 'width' in node and 'height' in node:
                class_name = 'img%s' % self.getNextId()
                if 'class' in node:
                    node['class'] = '%s %s' % (class_name, node['class'])
                else:
                    node['class'] = class_name
                styles.append('.%s { width: %spx; height: %spx }' % (class_name, node['width'], node['height']))
                del node['height']
                del node['width']
        stylesheet = render_theme_template(config['theme']['theme_dir'], 'image_stylesheet.html', image_styles= "\n".join(styles), web_path=config['theme']['web_path'])
        self.document.insert(0, raw('', stylesheet, format='html'))


class open_graph_tag(Element):
    def __init__(self, key, value):
        self.key = key
        self.value = value
        Element.__init__(self)

class twitter_card_tag(Element):
    def __init__(self, key, value):
        self.key = key
        self.value = value
        Element.__init__(self)

class OpenGraphTransform(Transform):
    default_priority = 11000

    def apply(self):
        title_nodes = self.document.traverse(title)
        image_nodes = self.document.traverse(image)
        has_data = False

        if len(title_nodes):
            title_text = title_nodes[0].children[0].rawsource
            self.document.insert(0, open_graph_tag('title', title_text))
            self.document.insert(0, twitter_card_tag('title', title_text))
            has_data = True

        if len(image_nodes):
            image_text = '%s%s' % (config['app']['host'], image_nodes[0]['uri'])
            self.document.insert(0, open_graph_tag('image', image_text))
            self.document.insert(0, twitter_card_tag('image', image_text))
            has_data = True

        if has_data:
            self.document.insert(0, twitter_card_tag('card', 'photo'))
            self.document.insert(0, twitter_card_tag('site', config['app']['twitter_handle']))



class KodiakWriter(Writer):
    def get_transforms(self):
        return Writer.get_transforms(self) + [ImagePathTransform, ImageSizeToCss, OpenGraphTransform]

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
        footer_html = render_theme_template(config['theme']['theme_dir'], 'footer.html', web_path=config['theme']['web_path'])
        head_html = render_theme_template(config['theme']['theme_dir'], 'head.html', web_path=config['theme']['web_path'])
        self.head.insert(0, head_html)
        self.body_suffix = [footer_html]

    def render_template(self, path, template, **context):
        return jinja2.Environment(
            loader=jinja2.FileSystemLoader(path + '/')
        ).get_template(template).render(context)

    def stylesheet_call(self, path):
        return  ''

    def visit_open_graph_tag(self, node):
        self.add_meta('<meta property="og:%s" content="%s" />' % (node.key, node.value))

    def visit_twitter_card_tag(self, node):
        self.add_meta('<meta property="twitter:%s" content="%s" />' % (node.key, node.value))

    def depart_open_graph_tag(self, node):
        pass

    def depart_twitter_card_tag(self, node):
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
        alt = node.get('alt', None)
        if alt is not None:
            atts['alt'] = alt
        if 'full_src' in node:
            atts['data-full-src'] = node['full_src']
        if 'caption' in node:
            atts['data-caption'] = node['caption']
        # image size
        if 'width' in node:
            atts['width'] = node['width']
        if 'height' in node:
            atts['height'] = node['height']
        if 'class' in node:
            atts['class'] = node['class']
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
            pass


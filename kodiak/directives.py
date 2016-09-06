'''Example of a custom ReST directive in Python docutils'''
from docutils.nodes import image, Element
from docutils.parsers.rst import Directive, directives
from docutils.parsers.rst.directives import images
from PIL import Image
from config import config

def size_image(filename, width, height, attributes):
    attributes['uri'] = filename
    attributes['rawsource']=filename
    img = image(**attributes)
    img['width'] = '%f' % width
    img['height'] = '%f' % height
    return img

def size_row(row, new_height):
    new_row = []
    original_width = 0
    rounded_width = 0
    for i in row:
        width = (new_height * i.aspect)
        original_width += width
        width = round(width)
        rounded_width += width

        if i == row[-1]:
            i.attributes['class'] = 'last'
            print (original_width - rounded_width)
            width += (original_width - rounded_width)

        img = size_image(i.rawsource, width, new_height, i.attributes)
        new_row.append(img)
    return new_row

class images_group(Element):
    pass

class KodiakImage(images.Image):
    # add caption as part of our spec
    option_spec = {'alt': directives.unchanged,
                   'height': directives.length_or_unitless,
                   'width': directives.length_or_percentage_or_unitless,
                   'name': directives.unchanged,
                   'target': directives.unchanged_required,
                   'class': directives.class_option,
                   'caption': directives.unchanged}

class Images(Directive):

    max_width = config['theme']['max_width']
    image_padding = config['theme']['image_padding']
    target_height = config['theme']['target_thumb_height']
    image_path = config['image']['thumb_path']

    has_content = True
    def run(self):
        rows = []
        current_row = []
        current_height = self.target_height
        total_aspect_ratio = 0;
        for image_arg_str in self.content:
            image_args = image_arg_str.split(',')
            image_filename = image_args.pop(0)
            image_options = {k:v.strip() for (k,v) in [opt.strip().replace(':','',1).split(':', 1) for opt in image_args]}

            with Image.open('%s%s' % (self.image_path, image_filename)) as im:
                width, height = im.size
            aspect = width / float(height)

            row_max_width = self.max_width - ((len(current_row) - 1) * self.image_padding)

            if current_height * (total_aspect_ratio + aspect) > row_max_width:
                new_height = row_max_width /total_aspect_ratio
                new_row = size_row(current_row, new_height)
                rows.append(new_row)
                current_row = []
                total_aspect_ratio = 0


            img = size_image(image_filename, (current_height * aspect), current_height, image_options)
            img.aspect = aspect


            total_aspect_ratio += aspect
            current_row.append(img)

        row_max_width = self.max_width - ((len(current_row) - 1) * self.image_padding)
        if len(current_row) > 1:
            rows.append(size_row(current_row, row_max_width/total_aspect_ratio))
        if len(current_row) == 1:
            rows.append(current_row)


        all_images = [j for i in rows for j in i]

        return [images_group('', *all_images)]

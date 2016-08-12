'''Example of a custom ReST directive in Python docutils'''
from docutils.nodes import image, Element
from docutils.parsers.rst import Directive
from PIL import Image
import config

def size_image(filename, width, height, attributes):
    attributes['uri'] = filename
    attributes['rawsource']=filename
    img = image(**attributes)
    img['width'] = '%f' % width
    img['height'] = '%f' % height
    return img

def size_row(row, new_height):
    new_row = []
    for i in row:
        img = size_image(i.rawsource, (new_height * i.aspect), new_height, i.attributes)
        new_row.append(img)
    return new_row

class images_group(Element):
    pass

class Images(Directive):

    max_width = config.theme.max_width
    target_height = config.theme.target_thumb_height
    image_path = config.image.thumb_path

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

            if current_height * (total_aspect_ratio + aspect) > self.max_width:
                new_height = self.max_width /total_aspect_ratio
                new_row = size_row(current_row, new_height)
                rows.append(new_row)
                current_row = []
                total_aspect_ratio = 0


            img = size_image(image_filename, (current_height * aspect), current_height, image_options)
            img.aspect = aspect


            total_aspect_ratio += aspect
            current_row.append(img)

        if len(current_row) > 1:
            rows.append(size_row(current_row, self.max_width/total_aspect_ratio))
        if len(current_row) == 1:
            rows.append(current_row)


        all_images = [j for i in rows for j in i]

        return [images_group('', *all_images)]

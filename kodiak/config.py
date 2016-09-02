import yaml

config = {}

def load_config(config_path):
    global config
    config = yaml.safe_load(open(config_path))
    theme_config = yaml.safe_load(open('%s/theme.yml' % config['theme']['theme_dir']))

    for key in theme_config.keys():
        config['theme'][key] = theme_config[key]

    return config

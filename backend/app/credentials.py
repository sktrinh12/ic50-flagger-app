cred_file = '/Users/spencer.trinhkinnate.com/Documents/security_files/oracle2'

cred_dct = {}

with open(cred_file, 'r') as f:
    lines = f.readlines()
    for line in lines:
        str_split = line.split(',')
        key = str_split[0].strip()
        value = str_split[1].strip()
        cred_dct[key] = value

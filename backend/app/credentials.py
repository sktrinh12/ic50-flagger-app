from os import getenv
cred_file = getenv('ORACLE_CREDS_ARG', '')


cred_dct = {}

if cred_file == '':
    cred_file = '/Users/spencer.trinhkinnate.com/Documents/security_files/oracle2'
    with open(cred_file, 'r') as f:
        lines = f.readlines()
        for line in lines:
            str_split = line.split(',')
            key = str_split[0].strip()
            value = str_split[1].strip()
            cred_dct[key] = value
else:
    cred_dct['HOST'] = getenv('ORACLE_HOST')
    cred_dct['USERNAME'] = getenv('ORACLE_USER')
    cred_dct['PASSWORD'] = getenv('ORACLE_PASS')
    cred_dct['SID'] = getenv('ORACLE_SID')
    cred_dct['PORT'] = getenv('ORACLE_PORT')

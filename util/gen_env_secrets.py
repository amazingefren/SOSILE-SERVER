#!/bin/python3
from os import path
from shutil import copyfile
import sys
import secrets;
import uuid;


target_dir = path.abspath(path.join(path.dirname(__file__),".."))
env_path = path.abspath(target_dir+"/.env")
template_path = path.abspath(target_dir+"/.env.example")

check_start = '#------------ KEYGEN START ------------'
emergency_stop = '#------------- KEYGEN END -------------'


def check():
    if not path.exists(template_path):
        sys.exit('Where is .env.example?')
    if not path.exists(env_path):
        copyfile(template_path, env_path)
        return True
    return True


def generate():
    keys = [ 
        "AT_SECRET="+secrets.token_hex(256),
        "RT_SECRET="+secrets.token_hex(256),
        "COOKIE_SECRET="+str(uuid.uuid4())
    ];

    old = open(env_path, "r").readlines();
    with open(env_path, "w") as f:
        rewrite = False;
        counter = 0
        for line in old:
            if rewrite and counter < len(keys):
                f.writelines(keys[counter]+"\n")
                counter+=1
            else:
                f.writelines(line)
            if line.strip().startswith(check_start):
                rewrite = not rewrite
            if line.strip().startswith(emergency_stop):
                if rewrite: 
                    rewrite = not rewrite
    print('Done...')
    sys.exit(0)


def confirm():
    try:
        print("[Destructive] Overwrite Secrets?")
        user_input = input("Continue? [y/N]: ").lower()
        if (user_input == 'y'):
            return True
        else:
            sys.exit(1)
    except:
        exit('\nAborting...')


def main():
    if confirm():
        if check():
            generate();

main()

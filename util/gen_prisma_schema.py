#!/bin/python3
from os import path,mkdir
from glob import glob
from datetime import datetime
from shutil import move
import sys

target_dir = path.abspath(path.join(path.dirname(__file__),"..","prisma/"))
schema_dir = path.abspath(path.join(target_dir, "schema/"))
schemas = schema_dir + "/*.schema.prisma"
now = str(datetime.now().timestamp()).split(".")[0]

def backup():
    try:
        original = target_dir + '/schema.prisma'
        backup_path = target_dir + '/backup/'
        if not path.exists(backup_path):
            mkdir(target_dir+'/backup/')
        if path.exists(original):
            move(original, backup_path + now + '.schema.prisma')
        return True
    except:
        exit("Something Went Wrong!")


def generate():
    final = open(target_dir+'/schema.prisma', "+w");
    final.write("// THIS IS A GENERATED FILE. DO NOT MODIFY HERE\n")
    for filename in glob(schemas):
        with open(filename, 'r') as f:
            for line in f:
                if line.split():
                    if not line.startswith('#'):
                        final.write(line) 
    print('Done...')
    # sys.exit(1)
    sys.exit(0)


def confirm():
    try:
        print("[Destructive] Overwrite prisma/schema.prisma")
        user_input = input("Continue? [y/N] ").lower()
        if (user_input == 'y'):
            return True
        else:
            exit(113)
    except:
        exit('\nAborting...')


def main():
    if confirm():
        if backup():
            generate();

main()

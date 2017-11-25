All files and directories, in a linux system, have permissions to limit their use usage to specific operations.

# Directory
A directory is a special file containing a set of references towards other files.

This set is said to be the content of the directory.

Note that these content define the file's names.

| Permission | Description | Numbers |
|------------|-------------|---------|
| Read       | Can see the content of the directory | 7,6,5,4 |
| Write      | Can add and remove content to the directory     | 7,6,3,2 |
| Execute    | Can access to the content of directory | 7,1 |

# Files
A file is set of datas. It can be totally empty.

| Permission | Description | Numbers |
|------------|-------------|---------|
| Read       | Can see the content | 7,6,5,4 |
| Write      | Can add and remove (modify) content  | 7,6,3,2 |
| Execute    | Can use the file as a program | 7,1 |


A file with no permission (0), can be deleted, renamed or moved. It only depends on the rights of the directory which contain the file.

# Rooms
Rooms are directories.

# Peoples
Peoples are files. The fact it shall always be executable is discussed.

# Items
Items are files.

# Commands

| Command | Description | Options | Args |
|------------|-------------|---------|--------|
| cat       | (concat streams) Can be used to show the content of a file |  | |
| ls      | List files in the directory (current or the one in args ) | | directory |
| cd      | Access a directory (the one in args ) | | (directory) |
| grep    | reveal the lines in a stream or a file that match a pattern ||pattern file|




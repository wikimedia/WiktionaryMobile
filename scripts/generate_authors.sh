#!/bin/bash

git log | grep ^Author: | sed 's/ <.*//; s/^Author: //' | LC_ALL='C' sort | uniq | LC_ALL='C' sort -df | grep -v unknown > ../assets/www/AUTHORS

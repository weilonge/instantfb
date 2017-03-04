#!/bin/bash

# In order to support RPi Cam [ http://elinux.org/RPi-Cam-Web-Interface ],
# Put this script (or its soft-link) in `/var/www/html/macros/` and assign the
# owner `www-data` to it.
# $ cp utils/start_img.sh /var/www/html/macros/
# $ chown www-data:www-data /var/www/html/macros/start_img.sh
# $ chmod +x /var/www/html/macros/start_img.sh
#
# In RPi Cam Control Panel, go to `Edit schedule settings` and fill `im` in
# `Motion Start`

# printf "start_img: `date`\n" >> /var/www/html/macros/img_testmacro.txt
printf '{"username":"username_1","message":"baby move!!! %s"}' "`date`" | socat - UNIX-CONNECT:/tmp/fb_api.sock
printf '{"username":"username_2","message":"baby move!!! %s"}' "`date`" | socat - UNIX-CONNECT:/tmp/fb_api.sock


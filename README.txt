This study consists of an initial survey, 4 cognitive tasks in a random order, and an ending screen.
More details coming soon as manuscript currently being written.

In the interest of Open Science, these materials are duly presented in their entirety. 
Please change the contact details, and participant information and consent sheets if running a replication.

To run:
1. Place the metacor folder in the top level of wwwroot (e.g. public_html) of your server space
2. Make a folder outside the wwwroot called 'meta_cor_data'
3. Use the following file permissions: Inside wwwroot: 701, outside wwwroot: directories 703 & files 704

Notes: 
If changing folder structure make note of following URLs and file paths:
    1. JavaScript: add another '([^\/]*\/)' to 'const path = loc.pathname.match(/(\/[^\/]*\/)([^\/]*\/)/ig)' as many times as the levels deep your files are located.
    2. PHP: 'file_put_contents("../../../meta_cor_data/$file_name.json", $data);' should point from script location to a folder outside your wwwroot and change '../../../' for how many levels deep your files are located
'End' has had links to SONA and Prolific removed, which can be used for automatic credit granting.
If you wish to host the task somwhere else, the folder with the PHP file may need a .htaccess folder (applies to Apache servers only):
    Header set Access-Control-Allow-Origin "[YOUR SERVER URL ORIGIN]"
    Header set Access-Control-Allow-Headers "Content-Type"

Try it out here: https://users.sussex.ac.uk/mel29/metacor/survey/survey.html
Note if accessing tasks directly, Gabor and Dots functions require the pixels-per-CM query string ?px_cm= to work e.g. https://users.sussex.ac.uk/mel29/metacor/dots/dots.html?px_cm=47, but errors will be thrown on data saving if doing so.

The actual study is currently live: https://users.sussex.ac.uk/mel29/survey/survey.html - please don't send data across if not taking part in the study!
I am working on making this approach as easily deployable as possible, please let me know if the above doesn't work for you.
Contact: m.lovell [at] sussex.ac.uk
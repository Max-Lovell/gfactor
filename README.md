# Metacognition g-factor study
This study consists of an initial survey, 4 cognitive tasks in a random order, and an ending screen. More details coming soon as manuscript currently being written.<br>
These materials are presented mostly in their entirety as a record of the associated study. Please change the contact details, and participant information and consent sheets if deploying them yourself.

To run:
1. Place the metacor folder in the top level of wwwroot (e.g. public_html) of your server space
2. Make a folder outside the wwwroot called 'meta_cor_data'
3. Use the following file permissions: Inside wwwroot: 701, outside wwwroot: directories 703 & files 704

Or host somewhere else:
* host with github pages for free, e.g.: https://max-lovell.github.io/gfactor/metacor/survey/survey.html
* However, if data is from outside the server where data is stored, the folder with the PHP file may need a .htaccess file as well (applies to Apache servers only):<br>
  `Header set Access-Control-Allow-Origin "[YOUR SERVER URL ORIGIN]"`<br>
  `Header set Access-Control-Allow-Headers "Content-Type"`
* working on a more accessible data storage solution. N=100 will give you ~0.06GB of data so lots of free trial options should work.

Notes:
* If changing folder structure make note of following URLs and file paths:
  1. JavaScript: add another '([^\/]*\/)' to 'const path = loc.pathname.match(/(\/[^\/]*\/)([^\/]*\/)/ig)' as many times as the levels deep your files are located.
  2. PHP: 'file_put_contents("../../../meta_cor_data/$file_name.json", $data);' should point from script location to a folder outside your wwwroot and change '../../../' for how many levels deep your files are located
* 'End' has had links to SONA and Prolific removed, which can be used for automatic credit granting.


Try it out here: https://users.sussex.ac.uk/mel29/metacor/survey/survey.html<br>
Note if accessing tasks directly, Gabor and Dots functions require the pixels-per-CM query string ?px_cm= to work e.g. dots.html?px_cm=47, but errors will be thrown on data saving if doing so.<br>
The actual study is currently live: https://users.sussex.ac.uk/mel29/survey/survey.html - please don't send data across if not taking part in the study!<br>

I am working on making this approach as easily deployable as possible, please let me know if the above doesn't work for you.<br>

Contact: m.lovell [at] sussex.ac.uk

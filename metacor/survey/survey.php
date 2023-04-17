<?php
//file_put_contents("globals.log", print_r($GLOBALS,true));
if ( $_SERVER['REQUEST_METHOD']=='GET' && realpath(__FILE__) == realpath( $_SERVER['SCRIPT_FILENAME'] ) ) {
    header( 'HTTP/1.0 403 Forbidden', TRUE, 403 );
    die( header( 'location: /error.php' ) );
} //exit if URL accessed directly

if($_SERVER['HTTP_ORIGIN'] == 'https://users.sussex.ac.uk') { //exit if not from uni qualtrics
    header('Access-Control-Allow-Origin: https://users.sussex.ac.uk'); 
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Origin, Content-Type, x-requested-with');
    header('Content-Type: application/json');

if(!empty($_POST)){exit;}
if(!empty($_GET)){exit;}
if(!empty($_FILES)){exit;} //https://st-g.de/2011/04/doing-filename-checks-securely-in-PHP

$post_data = json_decode(file_get_contents('php://input'), true);
if (JSON_ERROR_NONE !== json_last_error()){exit;} //https://stackoverflow.com/questions/48242848/how-to-parse-php-json-decode-data-to-jquery-ajax-request

$post_data = filter_var_array($post_data,[ //https://stackoverflow.com/questions/37533162/sanitize-json-with-php
    'file_name'    => FILTER_SANITIZE_STRING,
    'exp_data'     => ['filter' => FILTER_SANITIZE_STRING,'flags'=> FILTER_REQUIRE_ARRAY]
]);


if (isset($post_data['exp_data']) == true) {//https://www.w3schools.com/php/php_filter.asp
    $data = $post_data['exp_data'];
    $required_vars = array("age","nationality","gender","gender_text",
                            "hours","years","months","practice",
                            "TMS_q1","TMS_q2","TMS_q3","TMS_q4","TMS_q5","TMS_q6","TMS_q7",
                            "SSO_q1","SSO_q2","SSO_q3","SSO_q4","SSO_q5","SSO_q6","SSO_q7",
                            "SSO_q8","SSO_q9","SSO_q10","SSO_q11","SSO_q12","SSO_q13","SSO_q14",
                           "data_option","task_order","platform");

    foreach($data as $var => $val){
        if(!in_array($var, $required_vars, true)) {exit;};
    };

    foreach($required_vars as $req_var){
        if(is_null($data[$req_var])){exit;};
        if(empty($data[$req_var]) && $req_var!="gender_text" && $req_var!="practice" && $req_var!="hours" && $req_var!="years" && $req_var!="months"){exit;};
        if(!isset($data[$req_var]) && $req_var!="gender_text" && $req_var!="practice"){exit;};
        $data[$req_var] = trim($data[$req_var]);
        $data[$req_var] = stripslashes($data[$req_var]);
        $data[$req_var] = htmlspecialchars($data[$req_var]);
    };

    $args_san = array(
        'age' => FILTER_SANITIZE_NUMBER_INT,
        'nationality' => FILTER_SANITIZE_STRING,
        'gender' => FILTER_SANITIZE_STRING,
        'gender_text' => FILTER_SANITIZE_STRING,
        'hours' => FILTER_SANITIZE_NUMBER_INT,
        'years' => FILTER_SANITIZE_NUMBER_INT,
        'months' => FILTER_SANITIZE_NUMBER_INT,
        'practice' => FILTER_SANITIZE_STRING,
        'TMS_q1' => FILTER_SANITIZE_STRING,
        'TMS_q2' => FILTER_SANITIZE_STRING,
        'TMS_q3' => FILTER_SANITIZE_STRING,
        'TMS_q4' => FILTER_SANITIZE_STRING, 
        'TMS_q5' => FILTER_SANITIZE_STRING, 
        'TMS_q6' => FILTER_SANITIZE_STRING, 
        'TMS_q7' => FILTER_SANITIZE_STRING,
        'SSO_q1' => FILTER_SANITIZE_STRING,
        'SSO_q2' => FILTER_SANITIZE_STRING,
        'SSO_q3' => FILTER_SANITIZE_STRING,
        'SSO_q4' => FILTER_SANITIZE_STRING,
        'SSO_q5' => FILTER_SANITIZE_STRING,
        'SSO_q6' => FILTER_SANITIZE_STRING, 
        'SSO_q7' => FILTER_SANITIZE_STRING, 
        'SSO_q8' => FILTER_SANITIZE_STRING, 
        'SSO_q9' => FILTER_SANITIZE_STRING, 
        'SSO_q10' => FILTER_SANITIZE_STRING,
        'SSO_q11' => FILTER_SANITIZE_STRING,
        'SSO_q12' => FILTER_SANITIZE_STRING,
        'SSO_q13' => FILTER_SANITIZE_STRING,
        'SSO_q14' => FILTER_SANITIZE_STRING,
        'data_option' => FILTER_SANITIZE_STRING,
        'task_order' => FILTER_SANITIZE_STRING,
        'platform' => FILTER_SANITIZE_STRING
    );

    define("REGEXP_TMS", "/^((not_at_all)|(a_little)|(moderately)|(quite_a_bit)|(very_much))$/");
    define("REGEXP_SSO", "/^((never_or_very_rarely_true)|(rarely_true)|(sometimes_true)|(often_true)|(very_often_or_always_true))$/");
    define("REGEXP_NATIONALITY", "/^((Afghanistan)|(Åland Islands)|(Albania)|(Algeria)|(American Samoa)|(Andorra)|(Angola)|(Anguilla)|(Antarctica)|(Antigua and Barbuda)|(Argentina)|(Armenia)|(Aruba)|(Australia)|(Austria)|(Azerbaijan)|(Bahamas)|(Bahrain)|(Bangladesh)|(Barbados)|(Belarus)|(Belgium)|(Belize)|(Benin)|(Bermuda)|(Bhutan)|(Bolivia, Plurinational State of)|(Bonaire, Sint Eustatius and Saba)|(Bosnia and Herzegovina)|(Botswana)|(Bouvet Island)|(Brazil)|(British Indian Ocean Territory)|(Brunei Darussalam)|(Bulgaria)|(Burkina Faso)|(Burundi)|(Cambodia)|(Cameroon)|(Canada)|(Cape Verde)|(Cayman Islands)|(Central African Republic)|(Chad)|(Chile)|(China)|(Christmas Island)|(Cocos \(Keeling\) Islands)|(Colombia)|(Comoros)|(Congo)|(Congo, the Democratic Republic of the)|(Cook Islands)|(Costa Rica)|(Côte d'Ivoire)|(Croatia)|(Cuba)|(Curaçao)|(Cyprus)|(Czech Republic)|(Denmark)|(Djibouti)|(Dominica)|(Dominican Republic)|(Ecuador)|(Egypt)|(El Salvador)|(Equatorial Guinea)|(Eritrea)|(Estonia)|(Ethiopia)|(Falkland Islands \(Malvinas\))|(Faroe Islands)|(Fiji)|(Finland)|(France)|(French Guiana)|(French Polynesia)|(French Southern Territories)|(Gabon)|(Gambia)|(Georgia)|(Germany)|(Ghana)|(Gibraltar)|(Greece)|(Greenland)|(Grenada)|(Guadeloupe)|(Guam)|(Guatemala)|(Guernsey)|(Guinea)|(Guinea-Bissau)|(Guyana)|(Haiti)|(Heard Island and McDonald Islands)|(Holy See \(Vatican City State\))|(Honduras)|(Hong Kong)|(Hungary)|(Iceland)|(India)|(Indonesia)|(Iran, Islamic Republic of)|(Iraq)|(Ireland)|(Isle of Man)|(Israel)|(Italy)|(Jamaica)|(Japan)|(Jersey)|(Jordan)|(Kazakhstan)|(Kenya)|(Kiribati)|(Korea, Democratic People's Republic of)|(Korea, Republic of)|(Kuwait)|(Kyrgyzstan)|(Lao People's Democratic Republic)|(Latvia)|(Lebanon)|(Lesotho)|(Liberia)|(Libya)|(Liechtenstein)|(Lithuania)|(Luxembourg)|(Macao)|(Macedonia, the former Yugoslav Republic of)|(Madagascar)|(Malawi)|(Malaysia)|(Maldives)|(Mali)|(Malta)|(Marshall Islands)|(Martinique)|(Mauritania)|(Mauritius)|(Mayotte)|(Mexico)|(Micronesia, Federated States of)|(Moldova, Republic of)|(Monaco)|(Mongolia)|(Montenegro)|(Montserrat)|(Morocco)|(Mozambique)|(Myanmar)|(Namibia)|(Nauru)|(Nepal)|(Netherlands)|(New Caledonia)|(New Zealand)|(Nicaragua)|(Niger)|(Nigeria)|(Niue)|(Norfolk Island)|(Northern Mariana Islands)|(Norway)|(Oman)|(Pakistan)|(Palau)|(Palestinian Territory, Occupied)|(Panama)|(Papua New Guinea)|(Paraguay)|(Peru)|(Philippines)|(Pitcairn)|(Poland)|(Portugal)|(Puerto Rico)|(Qatar)|(Réunion)|(Romania)|(Russian Federation)|(Rwanda)|(Saint Barthélemy)|(Saint Helena, Ascension and Tristan da Cunha)|(Saint Kitts and Nevis)|(Saint Lucia)|(Saint Martin \(French part\))|(Saint Pierre and Miquelon)|(Saint Vincent and the Grenadines)|(Samoa)|(San Marino)|(Sao Tome and Principe)|(Saudi Arabia)|(Senegal)|(Serbia)|(Seychelles)|(Sierra Leone)|(Singapore)|(Sint Maarten \(Dutch part\))|(Slovakia)|(Slovenia)|(Solomon Islands)|(Somalia)|(South Africa)|(South Georgia and the South Sandwich Islands)|(South Sudan)|(Spain)|(Sri Lanka)|(Sudan)|(Suriname)|(Svalbard and Jan Mayen)|(Swaziland)|(Sweden)|(Switzerland)|(Syrian Arab Republic)|(Taiwan)|(Tajikistan)|(Tanzania, United Republic of)|(Thailand)|(Timor-Leste)|(Togo)|(Tokelau)|(Tonga)|(Trinidad and Tobago)|(Tunisia)|(Turkey)|(Turkmenistan)|(Turks and Caicos Islands)|(Tuvalu)|(Uganda)|(Ukraine)|(United Arab Emirates)|(United Kingdom)|(United States)|(United States Minor Outlying Islands)|(Uruguay)|(Uzbekistan)|(Vanuatu)|(Venezuela, Bolivarian Republic of)|(Viet Nam)|(Virgin Islands, British)|(Virgin Islands, U\.S\.)|(Wallis and Futuna)|(Western Sahara)|(Yemen)|(Zambia)|(Zimbabwe))$/");
    $args_val = array(
        'age'         => FILTER_VALIDATE_INT,
        'nationality' => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array('regexp' => REGEXP_NATIONALITY)),
        'gender'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array('regexp'=>'/^((male)|(female)|(non_binary)|(other)|(describe)|(not_say))$/')),
        'gender_text' => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array('regexp'=>"/^$|^[\w\s\)\(\.]+]*$/i")),
        'hours'       => FILTER_VALIDATE_INT,
        'years'       => FILTER_VALIDATE_INT,
        'months'      => FILTER_VALIDATE_INT,
        'practice'    => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array('regexp'=>"/^$|^[\w\s\)\(\.]+]*$/i")),
        'TMS_q1'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)),
        'TMS_q2'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)),
        'TMS_q3'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)),
        'TMS_q4'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)), 
        'TMS_q5'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)), 
        'TMS_q6'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)), 
        'TMS_q7'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_TMS)),
        'SSO_q1'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q2'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q3'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q4'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q5'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q6'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)), 
        'SSO_q7'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)), 
        'SSO_q8'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)), 
        'SSO_q9'      => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)), 
        'SSO_q10'     => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q11'     => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q12'     => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q13'     => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'SSO_q14'     => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => REGEXP_SSO)),
        'data_option' => FILTER_VALIDATE_BOOLEAN,
        'task_order'  => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp" => "/^(gabor_|dots_|breath_|span_){4}end$/")), //note: does allow repeats but good as can be without using back references and look forwards
        'platform'    => array('filter' => FILTER_VALIDATE_REGEXP, 'options'=>array("regexp"=>"/^(prolific|sona|none)$/"))
    );

    $data = filter_var_array($data,$args_san);
    $data = filter_var_array($data,$args_val);
    $data['user_agent'] = filter_var($_SERVER['HTTP_USER_AGENT'], FILTER_SANITIZE_STRING);
    $data = json_encode($data);
} else {exit;}

if (isset($post_data['file_name']) == true) {
    $file_name = $post_data['file_name'];
    $file_name = filter_var($file_name, FILTER_SANITIZE_STRING);
    $file_name = filter_var($file_name, FILTER_VALIDATE_REGEXP, array('options'=>array('regexp'=>'/^([0-9]{5,6}|[a-z0-9]{24})\_survey$/')));
} else {exit;}

file_put_contents("../../../meta_cor_data/$file_name.json", $data); //https://stackoverflow.com/questions/43519007/usage-of-http-raw-post-data
} else { exit; }
?>
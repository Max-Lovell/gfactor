// SETUP SETTINGS -----------------
//Get Prolific and SONA IDs
//prolific is 24 alphanumeric characters, sona is 5 numbers
function getQueryVariable(variable){ //https://css-tricks.com/snippets/javascript/get-url-variables/
    const vars = window.location.search.substring(1).split("&")
    const vars_l = vars.length
    let pair
    for (let i=0; i<vars_l; i++) {
            pair = vars[i].split("=")
            if(pair[0] === variable){return pair[1]}
    }
    return(false)
}

let sbj_id = getQueryVariable("sbj_id") 
if(!sbj_id){ sbj_id = Math.floor(Math.random()*900000) + 100000 } //random 6 digit number
let platform =  getQueryVariable("platform") 
if(!platform){ platform = 'none' }

const loc = window.location
const origin = loc.origin
const path = loc.pathname.match(/(\/[^\/]*\/)([^\/]*\/)/ig)
const url_start = origin+path
let subj_URL =''
let task_order = ["dots","gabor","span","breath"]

;(function () { //IIFE (everything we only need once at the beginning)
    //remove people on mobile and tablets
    window.mobileAndTabletCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      };
    const mobileCheck = window.mobileAndTabletCheck()
    if(mobileCheck){
        document.getElementById("intro").innerHTML = 'This experiment is not available on mobile due to screen size restrictions. Please return on tablet or computer.'
        document.getElementById("continue").hidden = true
        return
    }
    
    //Subject specific URL and task order
    let currentIndex = task_order.length //Fisher-Yates (aka Knuth) Shuffle.
    let randomIndex = 0
    while (currentIndex != 0) { // While there remain elements to shuffle
      randomIndex = Math.floor(Math.random() * currentIndex)// Pick remaining element
      currentIndex--
      ;[task_order[currentIndex], task_order[randomIndex]] = [task_order[randomIndex], task_order[currentIndex]] // swap with current element.
    }
    task_order.push('end')
    const task_order_str = encodeURIComponent(JSON.stringify(task_order));
    subj_URL = url_start+task_order[0]+'/'+task_order[0]+'.html?task_order='+task_order_str+'&sbj_id='+sbj_id+'&platform='+platform
})();

// NATIONALITY DATALIST ------------------
//https://www.freeformatter.com/iso-country-list-html-select.html
//https://www.jotform.com/blog/html5-datalists-what-you-need-to-know-78024/
//global for validation later
const nation_list = document.getElementById("nationalities")
const nationalities = ["Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan",
                        "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia, Plurinational State of","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi",
                        "Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, the Democratic Republic of the","Cook Islands","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Curaçao","Cyprus","Czech Republic",
                        "Denmark","Djibouti","Dominica","Dominican Republic",
                        "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia",
                        "Falkland Islands (Malvinas)","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories",
                        "Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana",
                        "Haiti","Heard Island and McDonald Islands","Holy See (Vatican City State)","Honduras","Hong Kong","Hungary",
                        "Iceland","India","Indonesia","Iran, Islamic Republic of","Iraq","Ireland","Isle of Man","Israel","Italy",
                        "Jamaica","Japan","Jersey","Jordan",
                        "Kazakhstan","Kenya","Kiribati","Korea, Democratic People's Republic of","Korea, Republic of","Kuwait","Kyrgyzstan",
                        "Lao People's Democratic Republic","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
                        "Macao","Macedonia, the former Yugoslav Republic of","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia, Federated States of","Moldova, Republic of","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar",
                        "Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","Northern Mariana Islands","Norway",
                        "Oman","Pakistan","Palau","Palestinian Territory, Occupied","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico",
                        "Qatar","Réunion","Romania","Russian Federation","Rwanda",
                        "Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Kitts and Nevis","Saint Lucia","Saint Martin (French part)","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten (Dutch part)","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Swaziland","Sweden","Switzerland","Syrian Arab Republic",
                        "Taiwan","Tajikistan","Tanzania, United Republic of","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu",
                        "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay","Uzbekistan",
                        "Vanuatu","Venezuela, Bolivarian Republic of","Viet Nam","Virgin Islands, British","Virgin Islands, U.S.",
                        "Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"]

;(function () {
    //nationalities
    for(let i=0;i<nationalities.length;i++){
        let nat_op = document.createElement("option");
        nat_op.value = nationalities[i]
        nation_list.appendChild(nat_op)
    }
})();

// LIKERT SCALES ------------------
;(function () {
    //LIKERT SCALES
    const TMS_prompt = `We are interested in your day-to-day experiences over the last week. 
                        Below is a list of things that people sometimes experience. Please read each statement. 
                        Please indicate the extent to which you agree with each statement. 
                        In other words, how well does the statement describe your experience. 
                        There are no “right” or “wrong” answers, so please answer in a way that reflects your own experiences in the last week.`
    const TMS_questions = [
        "1.	I experience myself as separate from my changing thoughts and feelings",
        "2. I am more concerned with being open to my experiences than controlling or changing them.",
        "3. I experience my thoughts more as events in my mind than as a necessarily accurate reflection of the way things 'really' are.",
        "4.	I am receptive to observing unpleasant thoughts and feelings without interfering with them.",
        "5.	I am more invested in just watching my experiences as they arise, than in figuring out what they could mean.",
        "6.	I approach each experience by trying to accept it, no matter whether it is pleasant or unpleasant.",
        "7.	I am aware of my thoughts and feelings without overidentifying with them."]
    const TMS_options = ['Not at all','A little','Moderately','Quite a bit','Very much']
    
    const SSO_prompt = `We would like you to interpret the following questions in a slightly nuanced way. 
                        The idea is this: when you notice something in the outside world, for example, the sky, you might think of something in the outside world: “the sky is blue”. 
                        However, at other times you might become aware of yourself seeing that the sky is blue, and you might think “I see that the sky is blue”. 
                        In the first one we can say you are aware of the world around you, and in the second example, you would be aware of perceiving the world around you, namely the effect the world has on your senses. 
                        Take a moment to consider the difference. Please answer the following questions with respect to the last week:`
    const SSO_questions = [
        "1. When I'm walking, I notice my body movements.",
        "2.	When I'm walking, I deliberately notice the sensations of my body moving.",
        "3.	When I take a shower or a bath, I stay alert to the water on my body.",
        "4.	When I take a shower or a bath, I stay alert to the sensations of water on my body.",
        "5.	I notice how foods and drinks affect my body.",
        "6.	I notice how foods and drinks affect my bodily sensations.",
        "7.	I pay attention to how the external world affects my body, such as the wind in my hair or sun on my face.",
        "8.	I pay attention to sensations, such as the wind in my hair or sun on my face.",
        "9.	I pay attention to sounds in the world, such as clocks ticking, birds chirping, or cars passing.",
        "10. I pay attention to hearing sounds, such as clocks ticking, birds chirping, or cars passing.",
        "11. I notice the smells and aromas of things around me.",
        "12. I notice the smelling of aromas.",
        "13. I notice such things in nature as colours, shapes, textures, or patterns of light and shadow.",
        "14. I notice seeing visual elements in art or nature, such as colours, shapes, textures, or patterns of light and shadow."]
    const SSO_options = ["Never or very rarely true","Rarely true","Sometimes true","Often true","Very often or always true"]
    
    const scales = [["TMS",TMS_prompt,TMS_questions,TMS_options],
                    ["SSO",SSO_prompt,SSO_questions,SSO_options]]
    const likerts = document.getElementById("likerts")

    //create likerts
    for(let i=0;i<scales.length;i++){
        const sc_name = scales[i][0]
        //container
        let fieldset = document.createElement("fieldset")
        let legend = document.createElement("legend")
        legend.innerHTML = 'Survey '+(i+1)
        fieldset.appendChild(legend)
        //prompt
        let prompt = document.createElement("p")
        prompt.innerHTML = scales[i][1]
        fieldset.appendChild(prompt)
        //scale
        let scale = document.createElement("div")
        scale.id = sc_name
        scale.className = "scale"
        const questions = scales[i][2]
        const options = scales[i][3]
        for(let q=0; q<questions.length; q++){ //loop through questions
            if(q===0 || q===7){ //add options row on top and every 7 rows
                let top_left = document.createElement("span");
                scale.appendChild(top_left)
                for(o in options){
                    let o_el = document.createElement("span");
                    o_el.innerHTML = options[o]
                    o_el.style.textAlign = 'center';
                    scale.appendChild(o_el)
                }
            }
            let question = document.createElement("span"); //add question in first column
            question.id = sc_name+"_q"+(q+1)+"_question"
            question.className = sc_name+"_q"+(q+1)
            question.innerHTML = questions[q]
            question.style.justifySelf = 'start';
            scale.appendChild(question)
            for (let o=0; o<options.length; o++) { //loop through options
                let option = document.createElement("input");
                let option_name = options[o].replace(/(^\w|\s\w)/g, firstCharOfWord => firstCharOfWord.toLowerCase()) //https://stackoverflow.com/questions/69585722/how-do-i-convert-lowercase-and-underscores-to-proper-case-and-spaces-in-es6-reac
                option_name = option_name.replaceAll(' ', '_')
                option.type = "radio"
                option.id = sc_name+"_q"+(q+1)+"_"+option_name
                option.className = sc_name+"_q"+(q+1)
                option.name = sc_name+"_q"+(q+1)
                option.value = option_name
                option.required = true //https://stackoverflow.com/questions/8287779/how-to-use-the-required-attribute-with-a-radio-input-field
                scale.appendChild(option)
            }
        }
        fieldset.appendChild(scale)
        likerts.appendChild(fieldset)
    }
})();

// PARTICIPANT INFO -------------------
const main = document.getElementById("main")
const continue_button = document.getElementById("continue")
const consent = document.getElementById("consent")
const survey = document.getElementById("survey")
const age_consent = document.getElementById("age_consent")
const declaration = document.getElementById("declaration")
const consent_warning = document.getElementById("consent_warning")
continue_button.addEventListener("click", continueListener, true);

function continueListener(){
    if(continue_button.style.cursor==='not-allowed'){
        if(consent.style.display===''){
            if(declaration.checked===false && age_consent.checked===false){
                consent_warning.style.display='block'
            }
        }
    } else { //move to next slide
        const children = main.children
        //if(children[4].style.display==='block'){
        //    const px_cm = ((box.clientWidth/8.56)+(box.clientHeight/5.398))/2 //https://myaurochs.com/blogs/news/whats-a-credit-cards-size
        //    window.location.replace(subj_URL+'&px_cm='+px_cm)
        //}
        
        for(let c=0;c<4;c++){
            if(children[c].style.display===''){
                children[c].style.display='none'
                const next = children[c].nextElementSibling
                next.hidden=false
                next.style.display=''
                if(next.id==="consent"){
                    continue_button.style.opacity = '0.6'
                    continue_button.style.cursor = 'not-allowed'
                } else if(next.id==="survey"){
                    continue_button.style.display='none'
                }
                scroll(0,0)
                break
            }
        }
    }
}

//validate consent form
age_consent.addEventListener('change',validateConsent,true)
declaration.addEventListener('change',validateConsent,true)

function validateConsent(){
    if(declaration.checked===true && age_consent.checked===true){
        consent_warning.style.display='none'
        continue_button.style.opacity = '1'
        continue_button.style.cursor = 'pointer'
    } if(declaration.checked===false || age_consent.checked===false){
        consent_warning.style.display='block'
        continue_button.style.opacity = '0.6'
        continue_button.style.cursor = 'not-allowed'
    }
}

// FORM HANDLER ----------------
const submit_form = document.getElementById("submit")
submit_form.addEventListener("click",checkForm,true)

function checkForm(){
    //nationalities dropdown
    const nationality = document.getElementById("nationality")
    if(!nationalities.includes(nationality.value)){
        nationality.setCustomValidity('Please select an option from the list')
    } else {nationality.setCustomValidity('')}
    nationality.reportValidity()

    //free text inputs
    const alphanumeric = /^$|^[\w\s\)\(\.]+]*$/i;
    const free_text = ["gender_text","practice"]
    for(let i=0;i<free_text.length;i++){
        let text_el = document.getElementById(free_text[i])
        if(!alphanumeric.test(text_el.value)){
            text_el.setCustomValidity('For security, this box is restricted to the alphanumeric characters, parentheses, full-stops, and underscores. Click elsewhere to hide this message.')
        } else {text_el.setCustomValidity('')}
        text_el.reportValidity()
    }

    //date input
    const time_med = ["years","months","hours"]
    for(let i=0;i<time_med.length;i++){ 
        let time_el = document.getElementById(time_med[i])
        if(time_el.value.length === 0){ time_el.value = 0 }
    }
    //CONSOLE LOGGING----------------------------------
        //let form_data = new FormData(document.getElementById('survey_form'))
        //let p_data = {};
        //form_data.forEach(function(value, key){
        //    p_data[key] = value;
        //});
        //console.log(p_data)
    //##################################################
}

const form = document.getElementById('survey_form');
form.addEventListener('submit', formSubmit, true); // https://stackoverflow.com/questions/1263852/prevent-form-redirect-or-refresh-on-submit

function formSubmit(e){ //form.addEventListener('formdata', (e) => {})
    e.preventDefault()
    let form_data = new FormData(e.target)
    form_data.append("data_option", document.getElementById('data').checked)
    form_data.append("task_order", task_order.join("_")) //needs to be json_decode() in the PHP
    form_data.append("platform", platform)
    //form_data.append("user_agent",navigator.userAgent) use PHP instead as contained in post request
    let p_data = {};
    form_data.forEach(function(value, key){
        p_data[key] = value;
    }); // because let p_data=Object.fromEntries(form_data.entries()) has backwards compatibility issues on old iOS
    saveData(p_data,resizerLoad)
}

function saveData(p_data,next_task){
    const json_data = JSON.stringify({
            file_name: sbj_id + "_survey", 
            exp_data: p_data
        })
    //document.getElementById("likerts").innerHTML=json_data;
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        next_task(); //move on to next task
    };
    xhr.open('POST', url_start+'survey/survey.php/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(json_data);
}

// PIXEL/CM ------------------------------------- wrap in own function.
const resizer = document.getElementById("resizer")
const box = document.getElementById("box")
const continue_resize = document.getElementById("continue_resize")
continue_resize.addEventListener('click',resizeButton,false)

function resizerLoad(){
    survey.style.display='none'
    const resize = document.getElementById("resize")
    resize.hidden=false
    resize.style.display=''
    box.style.width = box.clientWidth
    box.style.height = box.clientHeight
    resizer.addEventListener('mousedown', registerResizer, false)
    resizer.addEventListener('touchstart', handleResize, false)
}

function handleResize(e){
    e.preventDefault();
    if(e.type==='touchstart'){ 
        e = e.changedTouches[0] 
        resizer.addEventListener('touchmove', handleResize, false);
    } else if(e.type==='touchmove'){
        e = e.changedTouches[0]
    }
    const box_location = box.getBoundingClientRect();
    box.style.width = (e.pageX - box_location.x) + 'px';
    box.style.height = (e.pageY - box_location.y) + 'px';
    if(e.pageX >= window.innerWidth){ box.style.width = (window.innerWidth-1)+'px'}
    if(e.pageY >= window.innerHeight){ box.style.height = (window.innerHeight-1)+'px' }
}

function registerResizer(){ //mouse
    window.addEventListener('mousemove', handleResize, false);
    window.addEventListener('mouseup', unregisterResizer, false);
}

function unregisterResizer(){ //remove mouse
    window.removeEventListener('mousemove', handleResize, false);
    window.removeEventListener('mouseup', unregisterResizer, false);
}

function resizeButton(){
    const px_cm = ((box.clientWidth/8.56)+(box.clientHeight/5.398))/2 //https://myaurochs.com/blogs/news/whats-a-credit-cards-size
    window.location.replace(subj_URL+'&px_cm='+px_cm)
}
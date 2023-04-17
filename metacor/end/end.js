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

const end_button = document.getElementById("end_button")
const survey_platform = getQueryVariable("platform")
end_button.innerHTML = 'Click here to log your study completion on ' + survey_platform.toUpperCase()

const sbj_id = getQueryVariable("sbj_id")
let url;

if(survey_platform==="sona"){
    url = '[SONA URL]&survey_code='+sbj_id
} else if(survey_platform==="prolific"){
    url = '[PROLIFIC URL]'
} else {
    end_button.hidden = true
}

end_button.addEventListener('click',redirect,true)

function redirect(){
    window.location.assign(url)
}

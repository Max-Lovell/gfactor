//SETUP -------------------------------------------------------------------------------
// dom elements
const text_disp = document.getElementById("text_disp")
const encoding_disp = document.getElementById("encoding_disp")
const stim = document.getElementById("stim_cont") //STIM---
const l_stim = document.getElementById("l_stim")
const m_stim = document.getElementById("m_stim")
const r_stim = document.getElementById("r_stim")
const left = document.getElementById("left")
const right = document.getElementById("right")
const conf = document.getElementById('conf_cont')
const conf_sl = document.getElementById('conf_sl')
const conf_val = document.getElementById('conf_val')
const conf_b = document.getElementById('conf_b')

// experiment settings
let task_variant = "YN" // 2AFC, YN
let valid_resps = ['Y','N']
let span = 8 //span length
const n_trial = 50
const n_block = 5
const n_prac = 20
let trial_order = trialOrder()

// init vars
let trial_n = 0
let breaker = false
let instructions = false
let correct = []
const p_data = []
let start_time = 0

// begin exp
document.addEventListener('keydown',continueListener,true) //begins experiment on pressing spacebar
document.addEventListener('click',continueListener,true)

//HELPER FUNCTIONS ------------------------------------------------------------------------
function continueListener(e){
    if(e instanceof KeyboardEvent && !(e.key===' '||e.code==='Space'||e.keyCode===32)){ return 
    } else {
        document.removeEventListener('keydown',continueListener,true)
        document.removeEventListener('click',continueListener,true)
        runTrial()
    }
}

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

// trial order
function trialOrder(){
    let tr_or = [];
    //randomise trial order
    const total = (n_trial+n_prac)-5
    const trials_half = Math.ceil((total)/2) //cieling makes sure there's enough with odd numbers of trials
    for(let i=0;i<total;i++){
        if(i<trials_half){tr_or.push('present') //if 2AFC then present=first
        } else { tr_or.push('absent') }
    }
    let currentIndex = tr_or.length //Fisher-Yates (aka Knuth) Shuffle.
    let randomIndex = 0
    while (currentIndex != 0) { // While there remain elements to shuffle
      randomIndex = Math.floor(Math.random() * currentIndex)// Pick remaining element
      currentIndex--
      ;[tr_or[currentIndex], tr_or[randomIndex]] = [tr_or[randomIndex], tr_or[currentIndex]] // swap with current element. destructuring syntax.
    }
    tr_or.unshift('present','present','absent','absent','present') //5 practice trials
    return tr_or
}

//STIMULI CREATION -----------------------------------------------------------------------------
function staircase(){ //change task difficult based on performance
    const back1 = correct[correct.length-1]
    let back2 = false
    const last_correct_count = correct.slice().reverse().findIndex(correct_trial => correct_trial === false); //copy array, reverse it, find first ocurrence. => passes index and tests
    if( (trial_n>1 && last_correct_count===-1 && trial_n%2===0) || (last_correct_count > 0 && last_correct_count%2 === 0) ){ //no incorrect (-1) and even trial number OR even correct trials since last incorrect
        back2 = correct[correct.length-2] 
    }
    if(back1===false){ span--
        if(trial_n<11){ span-- } //change 2 digits on the first 10 trials.
    } else if(back1 && back2){ span++
        if(trial_n<11){ span++ }
    }
    if(span<2){ span=2 } //set lower bound
}

// T1 TASK -----------------------------------------------------------------------------
function displayEncoding(){
    text_disp.style.display = 'none'
    conf.style.display = "none"
    encoding_disp.style.display = "block"
    //get stim
    let encoder = ''
    for (let i=0; i<span; i++) {
        encoder += Math.floor(Math.random() * 10).toString()
    }
    let i=0
    displayLetter(encoder,i,encoder.length)
}

function displayLetter(encoder,i,len){
    encoding_disp.innerHTML = encoder[i]
    i++
    if(i<len){
        setTimeout(function() {stimBlinker(encoder,i,len)}, 500) //for when two letters in a row
    } else { setTimeout(function() {askResponse(encoder)}, 500) }
}

function stimBlinker(encoder,i,len){
    encoding_disp.innerHTML = ''
    setTimeout(function() {displayLetter(encoder,i,len)}, 10)
}

function askResponse(encoder){
    encoding_disp.style.display = 'none'
    //create target and distractor stim 
    const rep_idx = Math.floor(Math.random() * encoder.length) //get index of number to replace
    const numbers = '0123456789'.replace(encoder[rep_idx],'') //remove that number from possible replacements to avoid duplicates
    const rep_dig = numbers[Math.floor(Math.random() * numbers.length)] //replace digit with new one
    const distractor = encoder.substring(0, rep_idx) + rep_dig + encoder.substring(rep_idx + 1); //combine into one
    //display stim
    if(task_variant === "YN"){
        if(trial_order[trial_n-1]==="present"){ m_stim.innerHTML = encoder
        } else { m_stim.innerHTML = distractor }
        left.addEventListener('click',respList,true)
        right.addEventListener('click',respList,true)
    } else {
        if(trial_order[trial_n-1]==="present"){ 
            l_stim.innerHTML = encoder
            r_stim.innerHTML = distractor
        } else {
            l_stim.innerHTML = distractor
            r_stim.innerHTML = encoder 
        }
        l_stim.addEventListener('click',respList,true)
        r_stim.addEventListener('click',respList,true)
    }
    stim.style.display = 'block'
    //listen for response
    document.addEventListener('keydown',respList,true)
    start_time = performance.now()
    p_data.push({
        'trial_n': trial_n,
        'span': span,
        'encoder': encoder,
        'distractor': distractor,
        'target': trial_order[trial_n-1]
    })
}

function respList(e){
    let response = '' 
    if(e instanceof KeyboardEvent){
        const key_press = e.key.toUpperCase()
        if(key_press===valid_resps[0]){ response="present" //"present" in 2AFC trials refers to the left stim
        } else if(key_press===valid_resps[1]){ response="absent" //if trial_order[x]==="absent" then first stim was absent so right would be correct
        } else { return }
    } else { 
        if(e.target.id === 'left' || e.target.id === "l_stim"){ response = "present"
        } else  if(e.target.id === 'right' || e.target.id === "r_stim"){ response = "absent"}
    }
    
    if(response != ''){
        document.removeEventListener('keydown',respList,true)
        if(task_variant==="YN"){
            left.removeEventListener('click',respList,true)
            right.removeEventListener('click',respList,true)
        } else {
            l_stim.removeEventListener('click',respList,true)
            r_stim.removeEventListener('click',respList,true)
        }
        stim.style.display = 'none'
        const correct_t = response===trial_order[trial_n-1]
        correct.push(correct_t) //just easier and quicker than getting out of the object
        p_data[trial_n-1].response = response
        p_data[trial_n-1].rt = e.timeStamp - start_time
        p_data[trial_n-1].correct = correct_t
        //console.log(p_data[trial_n-1])
        //move on
        if(correct.length>n_prac){ getConfidence()
        } else { //feedback
            p_data[trial_n-1].confidence = -1
            let fdbk
            if(correct_t){ fdbk = 'Correct!'
            } else { fdbk = 'Incorrect'}
            text_disp.innerHTML = fdbk
            text_disp.style.display = "block"
            setTimeout(runTrial,300)
        }
    }
}

//T2 task-----------------------
function getConfidence(){
    stim.style.display = 'none'// show/hide pages
    conf.style.display = 'block'
    conf_sl.value = 1 //reset conf values
    conf_val.innerHTML = '1'
    document.addEventListener('keydown',confidenceKey,true)//listen for input
    conf_sl.addEventListener('input', sliderChange,true)
    conf_b.addEventListener('click', confSubmit, true)
}

// event listeners
function sliderChange(){
    conf_val.innerHTML = conf_sl.value
}

function confidenceKey(e){
    e.preventDefault()
    //slider values based on number keys
    if(['1','2','3','4','5'].includes(e.key)){
        const slider_val = Number(e.key)
        conf_sl.value = slider_val
        conf_val.innerHTML = slider_val
    //enter to continue
    } else if(e.key==='ArrowRight' && conf_sl.value<5){
        conf_val.innerHTML = ++conf_sl.value
    }  else if(e.key==='ArrowLeft' && conf_sl.value>1){
        conf_val.innerHTML = --conf_sl.value
    } else if(e.code === 'Enter'){ confSubmit() }
}

function confSubmit(){
    document.removeEventListener('keydown',confidenceKey,true)
    conf_sl.removeEventListener('input', sliderChange,true)
    conf_b.removeEventListener('click', confSubmit, true)
    conf.style.display = 'none';
    p_data[trial_n-1].confidence = conf_sl.value
    runTrial()
}

// EXPERIMENT FUNCTIONS  -----------------------------------------------------------------------------
function trialNumber(instr_cb){ // must be a better way to do this? e.g. resolve promises on even listeners
    if(correct.length===n_trial+n_prac){ // try this in future: https://stackoverflow.com/questions/35718645/resolving-a-promise-with-eventlistener
        if(task_variant==="YN"){ //switch task 
            task_variant="2AFC"
            valid_resps = ["E","I"]
            let new_trials = trialOrder()
            trial_order.push.apply(trial_order,new_trials)
            span = 8 //reset span length
            correct = [] //resets staircasing
            instructions=true
            //instructions screen
            text_disp.innerHTML= 'This version of the task is nearly the same, except your task is to decide which of 2 numbers presented is the same as the previous sequence. '+
            'For example, if you are shown 12345 and then asked to choose between 12365 and 12345, the correct answer would be the second option.<br><br>'+
            'These options are presented side by side, and your task is to indicate if the left or right option is correct.<br><br>'+
            'You can click on them, or press the \'E\' key to choose the left option, or the \'I\' key for the option on the right. '+
            'As before, the first '+n_prac+' trials are practice trials with feedback, after which there are '+n_trial+' trials with confidence ratings, split into  '+n_block+' blocks.<br><br>'+
            'Please press spacebar or click/press anywhere to begin'
            //stim display
            document.getElementById("stim_instr").innerHTML = 'Which of these are the sequence of numbers previously displayed?'
            m_stim.innerHTML = '|'
            l_stim.classList.add("stimhover")
            r_stim.classList.add("stimhover")
            document.getElementById("input_instr").innerHTML = 'Press E (left) or I (right) or click the correct number to continue.'
            document.getElementById("buttons").style.display = 'none'
        } else if(task_variant === "2AFC"){  //end task
            //close listeners
            document.removeEventListener('keydown',continueListener,true)
            document.removeEventListener('click',continueListener,true)
            //present end task screen
            const task_order_str = getQueryVariable("task_order") 
            const task_order = JSON.parse(decodeURIComponent(task_order_str))
            const next_task = task_order.findIndex((element) => element === 'span')+1
            let end_delay;
            if(task_order[next_task]==='end'){
                end_delay = 'The experiment is now over, you will be automatically forwarded to the final debriefing screen.' 
            } else { end_delay = 'This task is over. You will be forwarded to the next task automatically. If you are not forwarded please contact the experimenter on m.lovell@sussex.ac.uk.' }
            text_disp.innerHTML = end_delay
            instructions=true //forces return on runTrial function.
            //SAVE DATA AND CREATE LINK
            const sbj_id = getQueryVariable("sbj_id")
            const px_cm = getQueryVariable("px_cm")
            const platform = getQueryVariable("platform")
            const loc = window.location
            const origin = loc.origin
            const path = loc.pathname.match(/(\/[^\/]*\/)([^\/]*\/)/ig)
            const url_start = origin+path
            const link = url_start+task_order[next_task]+'/'+task_order[next_task]+'.html?task_order='+task_order_str+'&sbj_id='+sbj_id+'&px_cm='+px_cm+'&platform='+platform
            saveData(sbj_id,url_start,()=>{endScreen(link)})
        }
    } else if((correct.length-n_prac)%(n_trial/n_block)===0 && correct.length>n_prac && correct.length<n_trial+n_prac && breaker===true){ //
        const block_num = (correct.length-n_prac)/(n_trial/n_block)
        text_disp.innerHTML= 'You have completed '+block_num+' out of '+n_block+' blocks of trials.<br><br>Feel free to take a break, and press spacebar or click anywhere to continue.'  
        instructions=true
    } else if(correct.length===n_prac && breaker===true){
        text_disp.innerHTML= "The task proper will now begin. We won't provide feedback on your responses, and instead will ask for your confidence in your response. <br><br> Press spacebar or click/touch anywhere to begin."
        instructions=true
    }
    if(instructions===true){
        breaker=false //allows code to bypass the break screen without increasing the trial counter. could just decrease trial counter in function?
        text_disp.style.fontSize = "4vmin"
        conf.style.display = "none"
        text_disp.style.display = "block"
        document.addEventListener('keydown',continueListener,true)
        document.addEventListener('click',continueListener,true)
    }
    instr_cb()
}

function runTrial(){
    trialNumber(()=>{ //check if anything extra needs to be done on this trial (instructions, switch task variant, etc.)
        if(instructions===true){
            instructions=false
            return //exit if instruction or break screen needs to be presented, and skip once spacebar is pressed
        }
        staircase()
        breaker = true
        trial_n++
        displayEncoding()
    })
}

function saveData(sbj_id,url_start,next_task){
    const json_data = JSON.stringify({
            file_name: sbj_id + "_span", 
            exp_data: p_data
        })
    const xhr = new XMLHttpRequest()
    xhr.onload = function() { 
        next_task() 
    } //move on to next task
    xhr.open('POST', url_start+'span/span.php', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(json_data)
}

function endScreen(link){
    setTimeout(function() {window.location.replace(link)}, 3000)
}
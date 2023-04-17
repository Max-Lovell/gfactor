//original task: https://els-jbs-prod-cdn.jbs.elsevierhealth.com/cms/attachment/87a8ce41-01da-4aeb-8628-b4719986de9f/gr2.jpg
//SETUP ------------------------------------------------------------------
//GLOBALS
// dom elements
const text_display = document.getElementById('text_display')
const fix_cross = document.getElementById('fix_cross')
const stim_container = document.getElementById('stim_container')
const conf = document.getElementById('conf_cont')
const conf_sl = document.getElementById('conf_sl')
const conf_val = document.getElementById('conf_val')
const conf_b = document.getElementById('conf_b')
const left = document.getElementById('left')
const right = document.getElementById('right')
const lctx = left.getContext('2d', { willReadFrequently: true })
const rctx = right.getContext('2d', { willReadFrequently: true })

// experiment settings
const n_trial = 100 //number of experimental trials
const n_prac = 20 //number of practice trials
const n_block = 5 //split tasks into equal blocks
let trial_order = []

// init experimental vars
let end_prac = false
let instructions = false
let breaker = false
let start_time = 0
let trial_n = 0
const p_data = [] //participant data
const correct = [] //array of correct trials for speed
let n_dots = 4.25

// stim
const px_cm = getQueryVariable('px_cm')
const stim_size = Math.ceil((6*px_cm)/25)*25 //needs to fit 25 cells inside exactly to avoid ailisaing. https://stackoverflow.com/questions/4308989/are-the-decimal-places-in-a-css-width-respected
const cell_size = stim_size/25
const xy_co = []

// IIFE - everything only needed once at the beggining
;(function () {
    //stim
    //change HTML *NOT* CSS, which will stretch/compress canvas: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#sizing_the_canvas_using_css_versus_html
    left.height  = stim_size 
    left.width   = stim_size
    right.height = stim_size
    right.width  = stim_size
    const stim_grid = document.getElementById('stim_grid')
    stim_grid.style.columnGap = (1*px_cm)+'px'
    //center fixation cross - https://stackoverflow.com/questions/30637577/how-to-obtain-clientwidth-clientheight-before-div-is-visible
    stim_container.style.opacity = 0
    fix_cross.style.opacity = 0
    stim_container.style.display = 'block'
    fix_cross.style.display = 'block'
    fix_cross.style.height = stim_grid.clientHeight+'px' //CHANGE TO HTML?
    fix_cross.style.width = stim_grid.clientWidth+'px'
    fix_cross.style.top = stim_grid.getBoundingClientRect().top+'px'
    stim_container.style.display = 'none'
    fix_cross.style.display = 'none'
    stim_container.style.opacity = 1
    fix_cross.style.opacity = 1
    //dot colour
    lctx.fillStyle = 'white' //must be done after size change
    rctx.fillStyle = 'white'
    //coordinate grid
    for (let x=0; x<stim_size; x+=cell_size){
        for (let y=0; y<stim_size; y+=cell_size){
            xy_co.push([x,y])
        }
    }

    //randomise trial order
    const total = n_trial+n_prac
    const trials_half = Math.ceil((total)/2) //cieling makes sure there's enough with odd numbers of trials
    for(let i=0;i<total;i++){
        if(i<trials_half){trial_order.push('left')
        } else { trial_order.push('right') }
    }
    let currentIndex = trial_order.length //Fisher-Yates (aka Knuth) Shuffle.
    let randomIndex = 0
    while (currentIndex != 0) { // While there remain elements to shuffle
      randomIndex = Math.floor(Math.random() * currentIndex)// Pick remaining element
      currentIndex--
      ;[trial_order[currentIndex], trial_order[randomIndex]] = [trial_order[randomIndex], trial_order[currentIndex]] // swap with current element.
    }

    // start experiment-
    document.addEventListener('keydown',continueListener,true) //appending to document ignores first interaction - could use window
    document.addEventListener('click',continueListener,true)
})()


// HELPER FUNCTIONS ---------------------------------------------------
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

function continueListener(e){
    if(e instanceof KeyboardEvent && !(e.key===' '||e.code==='Space'||e.keyCode===32)){ return } 
    document.removeEventListener('keydown',continueListener,true)
    document.removeEventListener('click',continueListener,true)
    runTrial()
}

//STIM DISPLAY --------------------------------------------------------------------
// dots 
function fixationCross(){
    text_display.style.display = 'none'
    fix_cross.style.display = 'block'
    setTimeout(displayStim,1000)
}

function displayStim(){
    //console.time('stim display time')
    //console.log(trial_order[trial_n-1])
    fix_cross.style.display = 'none';
    stim_container.style.display = 'block';
    if(trial_order[trial_n-1]==='left'){ 
        drawDots(Math.round(Math.exp(n_dots)),0) //var dots_req; dots_req = requestAnimationFrame(function(){drawDots(0, 200)}) //actually slower here
    } else { drawDots(0,Math.round(Math.exp(n_dots))) }
}


//STIM CREATION --------------------------------------------------------------------
function staircase(){
    //change step size
    let step_size;
    if (correct.length<7){ step_size = 0.4;
    } else if (trial_n>6 && trial_n<12){ step_size = 0.2
    } else { step_size = 0.1 }
    //get correct on last 2 trials
    const back1 = correct[correct.length-1] //https://stackoverflow.com/questions/7306669/how-to-get-all-properties-values-of-a-javascript-object-without-knowing-the-key
    let back2 = false //check for 2 correct responses in a row below; else pretend two trials ago was false anyway, so that intensity isn't changed. 
    const last_correct_count = correct.slice().reverse().findIndex(correct_trial => correct_trial === false); //copy array, reverse it, find first ocurrence. => passes index and tests
    if( (last_correct_count === -1 && trial_n%2 === 0 && trial_n > 1) || (last_correct_count > 0 && last_correct_count%2 === 0) ){ //no incorrect (-1) and even trial number OR even correct trials since last incorrect
        back2 = correct[correct.length-2]
    }
    //change difficulty
    if(back1 === false && trial_n > 1){ n_dots +=step_size //reduce difficulty
    } else if(back1 && back2){ n_dots -= step_size } //increase difficulty by reducing intensity
    //limits on number of dots
    if (n_dots < 0){ n_dots = 0 //reset if out of bounds
    } else if (n_dots > 5.743){ n_dots = 5.743 } //exp(5.743)=311.999, so box would be full
}

function drawDots(l_dots=0, r_dots=0, iteration=0){
    const dot_size = cell_size/5 //move to global? or is local actually faster?
    const arr = [[lctx,l_dots],[rctx,r_dots]]
    let ctx, dots;
    for(let ci=0; ci<2; ci++){
        ctx = arr[ci][0]
        ctx.clearRect(0, 0, stim_size, stim_size)
        dots = 312+arr[ci][1]
        //select random coordinate without replacement; comptible with IE, best to try in browser (see dots_test.js for variations) as tests are inconsistent https://jsbench.me/s6l5rztqvr/2
        let co_idxs=[] //preallocate for speed?
        let i=-1; while(++i<625){ co_idxs.push(i) } //fastest IR compatible method https://stackoverflow.com/a/16901629/7705626 OR Array.from(Array(625).keys())
        for(let i=0;i<=dots;i++){
            let ran = Math.floor(Math.random() * (co_idxs.length-1)) //faster than the array shuffle function
            let idx = co_idxs[ran]
            ctx.beginPath()
            ctx.arc(xy_co[idx][0]+(cell_size/2), xy_co[idx][1]+(cell_size/2), dot_size, 0, Math.PI*2)
            ctx.fill()
            co_idxs.splice(ran,1) //remove random dot location to avoid duplicates
        }
    }
    if(++iteration<5){ setTimeout(function(){drawDots(l_dots, r_dots, iteration)}, 148) //setTimeout(function(){ dots_req=requestAnimationFrame(function(){ drawDots(l_dots, r_dots) }) }, 145) //actually slower
    } else { setTimeout(getResponse, 148) }
} //cancelAnimationFrame(dots_req)}


//TYPE-1 TASK --------------------------------------------------------------------
function getResponse(){
    //console.timeEnd('stim display time')
    lctx.clearRect(0, 0, stim_size, stim_size)
    rctx.clearRect(0, 0, stim_size, stim_size)
    document.addEventListener('keydown',t1Task, true)
    left.addEventListener('click', t1Task, true);
    right.addEventListener('click', t1Task, true);
    start_time = performance.now()
}

// event listener
function t1Task(e){
    let response = ''
    if(e instanceof KeyboardEvent){
        const key_pressed = e.key.toLowerCase() //capslock can mess with this otherwise
        if(key_pressed==='e'){ response = 'left'
        } else if(key_pressed==='i'){ response = 'right'
        } else{ return }
    } else if (e.target.id === 'left' || e.target.id === 'right'){ 
        response = e.target.id
    } else { return }

    if(response !== ''){
        //if okay response remove event listeners
        document.removeEventListener('keydown',t1Task, true)
        left.removeEventListener('click', t1Task, true);
        right.removeEventListener('click', t1Task, true);
        //store data
        const correct_t = response===trial_order[trial_n-1]
        correct.push(correct_t) //just easier and quicker than getting out of the object
        p_data.push({
            'trial_n': trial_n,
            'n_dots': n_dots,
            'target':trial_order[trial_n-1],
            'response':response,
            'rt': e.timeStamp - start_time,
            'correct': correct_t
        })
        
        //give feedback
        if(trial_n>n_prac){ 
            document.getElementById(response).style.background = 'blue';
            setTimeout(getConfidence,100)
        } else { //feedback
            p_data[trial_n-1].confidence = -1
            let fdbk
            if(correct_t){ fdbk = 'limegreen'
            } else { fdbk = 'red'}
            document.getElementById(response).style.background = fdbk;
            setTimeout(runTrial,300)
        }
    }
}


//TYPE-2 TASK --------------------------------------------------------------------
function getConfidence(){
    stim_container.style.display = 'none'// show/hide pages
    conf.style.display = 'block'
    conf_sl.value = 1 //reset conf values
    //conf_sl.focus() handled explicitly below
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


// TRIAL RUNNER -------
function trialNumber(i_callback){ // must be a better way to do this? e.g. resolve promises on even listeners
    left.style.background = 'black';
    right.style.background = 'black';
    if(trial_n===n_prac && end_prac===false){
        text_display.innerHTML= 'This is the end of the practice trials. '+
        'In the experimental trials you will not be provided with any feedback and will be asked to rate your confidence in your response instead.<br><br>'+
        'There are '+n_trial+' trials of this task, split into '+n_block+' blocks of '+n_trial/n_block+' trials each.<br><br>' +
        'Press spacebar or click anywhere to begin.'
        end_prac = true ; instructions = true
    } else if((trial_n-n_prac)%(n_trial/n_block)===0 && trial_n>n_prac && trial_n<n_trial+n_prac && breaker===true){
        text_display.innerHTML= 'You have completed '+((trial_n-n_prac)/(n_trial/n_block))+' out of '+n_block+' blocks of trials.<br><br>Feel free to take a break, and press spacebar or click anywhere to continue.'
        breaker = false ; instructions = true //allows code to bypass the break screen without increasing the trial counter. could just decrease trial counter in function?
    } else if(trial_n===n_trial+n_prac){ //end task
        //close listeners
        document.removeEventListener('keydown',continueListener,true)
        document.removeEventListener('click',continueListener,true)
        //present end task screen
        const task_order_str = getQueryVariable("task_order") 
        const task_order = JSON.parse(decodeURIComponent(task_order_str))
        const next_task = task_order.findIndex((element) => element === 'dots')+1
        let end_delay;
        if(task_order[next_task]==='end'){
            end_delay = 'The experiment is now over, you will be automatically forwarded to the final debriefing screen.' 
        } else { end_delay = 'This task is over. You will be forwarded to the next task automatically. If you are not forwarded please contact the experimenter on m.lovell@sussex.ac.uk.' }
        text_display.innerHTML = end_delay
        //SAVE DATA AND CREATE LINK
        const platform = getQueryVariable("platform")
        const sbj_id = getQueryVariable('sbj_id')
        const loc = window.location
        const origin = loc.origin
        const path = loc.pathname.match(/(\/[^\/]*\/)/ig)
        const url_start = origin+path
        const link = url_start+task_order[next_task]+'/'+task_order[next_task]+'.html?task_order='+task_order_str+'&sbj_id='+sbj_id+'&px_cm='+px_cm+'&platform='+platform
        saveData(sbj_id,url_start,()=>{endScreen(link)})
    }
    if(instructions){
        document.addEventListener('keydown',continueListener,true)
        document.addEventListener('click',continueListener,true)
        text_display.style.display = 'block'
    }
    i_callback()
}

function runTrial(){
    stim_container.style.display = 'none'
    conf.style.display = 'none'
    trialNumber(()=>{ //check if anything extra needs to be done on this trial (instructions, switch task variant, etc.)
        if(instructions){
            instructions=false //done to allow the trial runner to interrupt first and then allow through next time without changing trial number
            return //exit if instruction or break screen needs to be presented, and skip once spacebar is pressed
        }
        staircase()
        breaker = true
        trial_n++
        fixationCross()
    })
}

function saveData(sbj_id,url_start,next_task){
    const json_data = JSON.stringify({
            file_name: sbj_id + '_dots', 
            exp_data: p_data
        })
    const xhr = new XMLHttpRequest()
    xhr.onload = function() {
        next_task() //move on to next task
    }
    xhr.open('POST', url_start+'dots/dots.php', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(json_data)
}

function endScreen(link){
    setTimeout(function() {window.location.replace(link)}, 3000)
}

// NOTES ------------------------------------------------------
//on using RequestAnimationFrame over setTimeout (appeared slower in my testing):
    //https://stackoverflow.com/questions/6685396/execute-the-setinterval-function-without-delay-the-first-time 
    //https://medium.com/trabe/implementing-settimeout-using-requestanimationframe-20cc2f6e6b5d
    //http://www.javascriptkit.com/javatutors/requestanimationframe.shtml
//measure performance of timing methods:
    //function ArrayAvg(myArray) {
    //    var i = 0, summ = 0, ArrayLen = myArray.length;
    //    while (i < ArrayLen) {summ = summ + myArray[i++];}
    //    return summ / ArrayLen;
    //}
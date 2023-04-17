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

//Globals----------------
const timer_display = document.getElementById('timer')
const timer_text = document.getElementById('timer_text')
const key_presses = document.getElementById('key_presses')
const ini_button = document.getElementById('ini_button')
const arrows_grid = document.getElementById('arrows_grid')

let ini_time = 0 //time start button is clicked
const p_data = [] //stores participant trial data in JSON
const key_times = [] // stores key press timings since last input for ease
let fdbk = '' // feedback string for button presses
let conf = '' // stores most recent confidence press regardless of data
let count = 0 //stores breath count for practice feedback
const arrows = ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','reset'] //input element Ids //https://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters

//Audio-----------
// Outcome tones
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext({latencyHint: 'interactive', sampleRate: 44100}); //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext
    //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext#properties check these to get info on users
const tone = makeTone(234,.2)

function makeTone(tone, seconds){ // https://stackoverflow.com/questions/34708980/generate-sine-wave-and-play-it-in-the-browser
    const volume = 0.5
    let wave_points = []
    const sampleFreq = audioCtx.sampleRate / tone
    for (let i = 0; i < audioCtx.sampleRate * seconds; i++) {
        wave_points[i] = Math.sin(i / (sampleFreq / (Math.PI * 2))) * volume
    }
    let buf = new Float32Array(wave_points.length)
        for (var i = 0; i < wave_points.length; i++) buf[i] = wave_points[i]
    const buffer = audioCtx.createBuffer(1, buf.length, audioCtx.sampleRate)
        buffer.copyToChannel(buf, 0)
    return buffer
}

function playTone(buffer){
    //for binaural sound: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createStereoPanner
    let source = audioCtx.createBufferSource() //for better timing: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    source.buffer = buffer
    source.connect(audioCtx.destination)
    source.start(0)
}

function incorrect(target){
    playTone(tone)
    document.getElementById(target).classList.remove("animate")
    void document.getElementById(target).offsetWidth
    document.getElementById(target).classList.add("animate")
    key_presses.style.color = 'red'
}

//Clock----------------
function startTimer() { //when 'start button' is clicked
    ini_time = performance.now()
    ini_button.disabled = true //only allow one click
    //TIMER
    let timer_length = 0;
    if(timer_text.innerHTML === 'practice'){
        timer_length = 2 //practice length
    } else {timer_length = 15} //minutes for experimental task
    let total_sec = (timer_length*60)-1 //-1 so first second reduces timer
    let timer_var = setInterval(function(){
        let mins = parseInt(total_sec / 60, 10)
        let secs = parseInt(total_sec % 60, 10)
        mins = mins < 10 ? '0' + mins : mins
        secs = secs < 10 ? '0' + secs : secs
        timer_display.innerHTML = mins + ':' + secs

        if (--total_sec < 0){ //timer hits 0, clear listeners and loop, setup or end exp trials
            clearInterval(timer_var)
            let arr_l = arrows.length
            for(let i=0; i<arr_l; i++){ document.getElementById(arrows[i]).style.color = 'black' } //resets everything to black if held on target and timer ends
            
            if(timer_text.innerHTML === 'practice'){ //end prac, set up exp
                key_presses.innerHTML = '';
                ini_button.disabled = false;
                timer_text.innerHTML = 'task';
                document.getElementById('button_text').innerHTML = 'experiment';
                timer_display.innerHTML = '15:00';
                p_data.length = 0
            } else if(timer_text.innerHTML === 'task'){ //end exp, save, forward; console.table(keys_data)
                //present end task screen
                const task_order_str = getQueryVariable("task_order") 
                const task_order = JSON.parse(decodeURIComponent(task_order_str))
                const next_task = task_order.findIndex((element) => element === 'breath')+1
                let end_delay;
                if(task_order[next_task]==='end'){
                    end_delay = 'The experiment is now over, you will be automatically forwarded to the final debriefing screen.' 
                } else { end_delay = 'This task is over. You will be forwarded to the next task automatically. If you are not forwarded please contact the experimenter on m.lovell@sussex.ac.uk.' }
                const container = document.getElementById('container')
                container.classList.add('centred');
                container.innerHTML = end_delay
                //construct link and forward after delay
                const sbj_id = getQueryVariable("sbj_id")
                const platform = getQueryVariable("platform")
                const px_cm = getQueryVariable("px_cm")
                const loc = window.location
                const origin = loc.origin
                const path = loc.pathname.match(/(\/[^\/]*\/)([^\/]*\/)/ig)
                const url_start = origin+path
                const link = url_start+task_order[next_task]+'/'+task_order[next_task]+'.html?task_order='+task_order_str+'&sbj_id='+sbj_id+'&px_cm='+px_cm+'&platform='+platform
                saveData(sbj_id,url_start,()=>{endScreen(link)})
            }
        }
    }, 1000)
    //put these outside the function (i.e. the line below) to turn on practice arrow keys until the timer starts
    document.addEventListener('keydown', keyListener) //listen for key presses
    document.addEventListener('keyup', colourKeys)
    //note might be better to add mouse and touch event listeners to the arrows themselves: https://stackoverflow.com/questions/12824549/should-all-jquery-events-be-bound-to-document
    //likely not a realistic concern for this specific program, unlikely to get many clicks in other places during the task, and 20 event listeners could actually be slower.
    arrows_grid.addEventListener('mousedown',keyListener)
    arrows_grid.addEventListener('mouseup', colourKeys)
    arrows_grid.addEventListener('touchstart', keyListener, {passive:false});
    arrows_grid.addEventListener('touchend', colourKeys, {passive:false});
}

//User input----------------
function keyListener(e){
    //get target arrow and handle clicks/touches
    let target = ''
    if(e.type==="keydown"){
        if(e.repeat) { return } //stops holding the key down making repeat characters
        if(e.key===' '){ target = 'reset'
        } else { target = e.key }
    } else if(e.type==="touchstart"||e.type==="mousedown"){
        target = e.target.id
    }

    // handle arrow interactions
    if(arrows.includes(target) && ini_button.disabled === true) { //https://stackoverflow.com/a/44213036/7705626
        e.preventDefault() //disable arrow key scrolling etc
        let arrow_col = 'red'
        if(target==="ArrowUp" || target==="ArrowDown"){ count++ }

        //errors
        if(p_data.length!==0 && (target==='ArrowUp'||target==='ArrowDown') && p_data[p_data.length-1].conf==='no_conf'){ // if no confidence for last breath
            incorrect(target)
            key_presses.innerHTML = 'Please provide a confidence rating for your previous breath.'
            count-- //only relevant for practice trials.
        } else if(timer_text.innerHTML==='practice' && ((target==="ArrowUp" && count>8) || (target==="ArrowDown" && count!==9))){ // if incorrect breath press
            incorrect(target)
            key_presses.innerHTML = 'Incorrect breath sequence: Needs 8 up presses followed up 1 down press. Please start counting from 1 again.'
            count = 0
            fdbk=''
            conf=''
            p_data.length = 0
        } else if((p_data.length===0 || p_data[p_data.length-1].br==='reset') && (target==="ArrowLeft" || target==="ArrowRight")){ // if confidence is first press in general or after reset, require preceeding breath
            incorrect(target)
            key_presses.innerHTML = 'Needs breath before confidence.'

        //if valid
        } else {
            //reaction times
            key_times.push(e.timeStamp) //may return getTime.now() level of accuracy on some browsers
            let reaction_time = 0
            if(p_data.length !== 0){
                reaction_time = e.timeStamp - key_times[key_times.length-2] //rt - timing of last key press
            } else { reaction_time = e.timeStamp - ini_time } //on the first time

            //store data
            conf_chng = '' // used to inform participants they have changed a confidence rating for the current breath
            if(target==='reset'){
                p_data.push({
                    'br': target,
                    'br_rt': reaction_time,
                    'conf': target, 
                    'conf_rt': -1 //-1 = reset, -2 = missing. Floats allow for passing PHP checks in future.
                })
                //feedback
                fdbk = 'Sequence reset: please start counting from 1 again.'
                count = 0
            } else if(target==='ArrowUp'||target==='ArrowDown'){
                p_data.push({
                    'br': target,
                    'br_rt': reaction_time,
                    'conf': 'no_conf', 
                    'conf_rt': -2 //needs to be float to pass PHP checks, incase trial ends before conf is recorded on last press.
                })
            } else if(p_data[p_data.length-1].conf !== target){
                if(p_data[p_data.length-1].conf!=='no_conf'){ conf_chng = '<br><br><i>Confindence rating for current breath has been changed.<i>'}
                p_data[p_data.length-1].conf = target
                p_data[p_data.length-1].conf_rt = reaction_time
                //feedback
                if(target==='ArrowLeft'){ conf = 'Unconfident'
                } else if(target==='ArrowRight'){ conf = 'Confident' }
            }

            //give feedback
            key_presses.style.color = 'black'
            let conf_str=''
            if(target!=='reset'){ 
                conf_str = ': '+conf+'. ' 
                arrow_col = 'blue'
            }
            if(timer_text.innerHTML==='practice'){
                arrow_col = 'green'
                let br_str = 'Breath ' + count
                if(target==='ArrowUp' || target==='ArrowDown'){
                    if(count===1){ //reset feedback string if first breath
                        fdbk = br_str
                    } else { //store last confidence rating in feedback
                        fdbk += conf_str + br_str 
                        if(target==='ArrowDown' && count===9){ 
                            count = 0
                        }
                    }
                    conf_str = ''
                }
            } else {
                if(target==='ArrowUp'){ 
                    conf_str = ''
                    fdbk = 'Breath 1-8'
                } else if(target==='ArrowDown'){ 
                    conf_str = ''
                    fdbk = 'Breath 9'
                }
            }
            // feedback
            key_presses.innerHTML = fdbk + conf_str + conf_chng
        }
        colourKeys(target,arrow_col)
    }
}

function colourKeys(e, arrow_col='black'){
    let target = e
    if(e instanceof KeyboardEvent){
        if(e.key===' '){ target = 'reset'
        } else { target = e.key } 
    } else if(e instanceof TouchEvent || e instanceof MouseEvent){
        target = e.target.id
    }
    if(arrows.includes(target)){
        document.getElementById(target).style.color = arrow_col
    } //note off-target MouseUp won't reset colour - not implemented to minimise stack for timing accuracy, but see end of timer section above
        //also e.g. if user switches tab/program before key up then colour not reset
}

//Data----------------
function saveData(sbj_id,url_start,next_task){
    let json_data = JSON.stringify({
            file_name: sbj_id + "_breath", 
            exp_data: p_data
        })
    let xhr = new XMLHttpRequest()
    xhr.onload = function() { next_task() } //move on to next task
    xhr.open('POST', url_start+'breath/breath.php', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(json_data)
}

function endScreen(link){
    setTimeout(function() {window.location.replace(link)}, 3000)
}
//START----------
ini_button.addEventListener("click", startTimer);
//arrows_grid.addEventListener("contextmenu", function (e) { e.preventDefault(); }, false); //stops touchscreen holding making right-click dropdown

function iso226(phon){
    /*
    Generates an Equal Loudness Contour as described in ISO 226
    Usage:  [SPL FREQ] = ISO226(PHON);
    
             PHON is the phon value in dB SPL that you want the equal
               loudness curve to represent. (1phon = 1dB @ 1kHz)
             SPL is the Sound Pressure Level amplitude returned for
               each of the 29 frequencies evaluated by ISO226.
             FREQ is the returned vector of frequencies that ISO226
               evaluates to generate the contour.

    Desc:   This function will return the equal loudness contour for
             your desired phon level.  The frequencies evaulated in this
             function only span from 20Hz - 12.5kHz, and only 29 selective
             frequencies are covered.  This is the limitation of the ISO
             standard.

             In addition the valid phon range should be 0 - 90 dB SPL.
             Values outside this range do not have experimental values
             and their contours should be treated as inaccurate.

             If more samples are required you should be able to easily
             interpolate these values using spline().

    Author:    Jeff Tackett  03/01/05
    Ported by: Daniel Bedoya 08/02/21
    */
    const freqList = [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 
                     1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500]; // third octave bands

    const alpha    = [0.532, 0.506, 0.480, 0.455, 0.432, 0.409, 0.387, 0.367, 0.349, 0.330, 0.315,
                      0.301, 0.288, 0.276, 0.267, 0.259, 0.253, 0.250, 0.246, 0.244, 0.243, 0.243,
                      0.243, 0.242, 0.242, 0.245, 0.254, 0.271, 0.301]; // exponent for loudness perception

    const lu       = [-31.6, -27.2, -23.0, -19.1, -15.9, -13.0, -10.3, -8.1, -6.2, -4.5, -3.1,
                       -2.0,  -1.1,  -0.4,   0.0,   0.3,   0.5,   0.0, -2.7, -4.1, -1.0,  1.7,
                        2.5,   1.2,  -2.1,  -7.1, -11.2, -10.7,  -3.1]; // magnitude linear transfer function normalized @ 1KHz

    const tf       = [78.5, 68.7, 59.5, 51.1, 44.0, 37.5, 31.5, 26.5, 22.1, 17.9, 14.4,
                      11.4,  8.6,  6.2,  4.4,  3.0,  2.2,  2.4,  3.5,  1.7, -1.3, -4.2,
                      -6.0, -5.4, -1.5,  6.0, 12.6, 13.9, 12.3]; // threshold of hearing

    // Error Trapping
    if (phon < 0 || phon > 90) {
        console.log(`Phon value ${phon} is out of bounds`);
        var Lp = NaN
        var af = NaN
        }
    else{
        // Deriving sound pressure level from loudness level (iso226 sect 4.1) [Ln = phon]
        var af = tf.map((tfi, idx) => 4.47e-3 * (10**(0.025*phon) - 1.15) + (0.4*10**( ( (tfi + lu[idx])/10) - 9) )**alpha[idx] );
        var Lp = af.map((afi, idx) => ((10/alpha[idx]) * Math.log10(afi)) - lu[idx] + 94 );
    }
    return {freqList:freqList, Af:af, SPL:Lp};
}

function iso226Norm(spl){
    // Return SPL values scaled to unit length
    var maxSPL  = Math.max(...spl);
    var isoNorm = spl.map(item => item/maxSPL );
    return isoNorm
}

function getPa(spl){
    // Return peak sound pressure [Pa] from SPL [dB]
    var pPeak = spl.map(x => 10**(x/20) * 2e-5 * Math.sqrt(2) );
    return pPeak
}

function gainFactor(f, freqList, isoNorm){
    // Find index of f in frequency vector and return its corresponding gain factor
    var idx     = freqList.indexOf(f)
    var gFactor = isoNorm[idx]
    return gFactor 
}

function getGain(f, phon=50){
    // Get normalized gain ISO226 factor for frequency f [Hz] at phon
    var isoCurve = iso226(phon)
    // var isoNorm  = iso226Norm(isoCurve.SPL)
    var pPeak  = getPa(isoCurve.SPL)
    var gFactor  = gainFactor(f, isoCurve.freqList, pPeak)
    return gFactor
}

function gain_A_weighting(f){
    // Apply inverse A weighting gain to a given frequency
    // IEC 61672-1:2013 norm
    let fRef, a, b, c, d1, d2, d, rAf, gain;
    fRef = 1000;
    a    = f**4 * 12194**2;
    b    = f**2 + 20.6**2;
    c    = f**2 + 12194**2;
    d1   = f**2 + 107.7**2;
    d2   = f**2 + 737.9**2;
    d    = Math.sqrt(d1*d2);
    rAf  = a/(b*c*d);
    gain = 1-rAf;
    return gain;
}

function shuffle(array){
    // Shuffle elements inside an array with Fisher–Yates method
    // Source: https://bost.ocks.org/mike/shuffle/
    let m = array.length, t, i;
    // While there remain elements to shuffle
    while (m){
        // Pick a remaining element
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function createToneArray(freqList){
    // Shuffle, sample first 6 and concatenate with mandatory frequencies
    let shuffledFreqs  = shuffle(freqList);
    let shuffledShort  = shuffledFreqs.slice(0,6);
    let toneArray      = shuffledShort.concat(mandFreq);
    return toneArray;
}

function randomList(arrayLength){
    // Create a random boolean array of x length
    var boolArray = [];
    for(let i= 0; i<arrayLength; i++){
        boolArray.push(Math.random() < 0.5) // 50% probability of being true
    }
    return boolArray;
}

function createBooleanConditions(){
    // Create 6 random boolean conditions, then concatenate with [true, true]
    var boolArray = randomList(6);
    boolArray     = boolArray.concat([true, true])
    return boolArray;
}

function randomizeTrial(toneArray, boolArray){
    // Create array of Frequencies that will be played
    var idx = shuffle([...Array(8).keys()]);
    var N   = boolArray.length;
    var trialToneArray = [];
    var trialBoolArray = [];
    for (let i = 0; i<N; i++){
        let j = idx[i];
        trialToneArray.push(toneArray[j]);
        trialBoolArray.push(boolArray[j]);
    }
    return {tone:trialToneArray, bool:trialBoolArray};
}

function createTrial(freqList){
    // Get list of frequencies/condition for a given trial
    var toneArray  = createToneArray(freqList);
    var boolArray  = createBooleanConditions();
    var trialArray = randomizeTrial(toneArray, boolArray);
    return {tone:trialArray.tone, bool:trialArray.bool};
}

function playTone(f, duration, startTime, gainValue=0.0){
    // Play a pure tone at frequency f [Hz] for 750 ms
    osc        = context.createOscillator(); // Create sound source
    osc.type            = "sine";            // Sine wave
    osc.frequency.value = f;                 // Frequency in Hertz
    gainNode   = context.createGain();       // Create gain node
    // gFactor    = gain_A_weighting(f)
    gFactor    = getGain(f);
    gainNode.gain.setValueAtTime(0, startTime); // Set gain node to gFactor - gainValue
    osc.connect(gainNode);                   // Connect sound source to gain node
    gainNode.connect(context.destination);   // Connect gain node to output
    
    osc.start(startTime);                    // Play sound source instantly
    gainNode.gain.linearRampToValueAtTime(gFactor, startTime + 0.1) // set 10ms fade-in
    gainNode.gain.setTargetAtTime(0, startTime + duration, 0.05)    // set 5ms fade-out
    
    osc.stop(startTime + duration + 0.2);     // Stop after specified duration
    console.log('Frequency: ', f, 'Gain: ', gFactor);
}

function playSilence(duration, startTime){
    // Gererate silence
    silence = context.createBufferSource();
    silence.connect(context.destination);
    silence.start(startTime)
    silence.stop(startTime + duration) // Stop after specified duration
}

function runTest(){
    if (context.state === 'suspended'){
        context.resume();
    }

    var trialArray  = createTrial(freqList) // Create object with trial arrays
    var toneArray   = trialArray.tone        // Get shuffled 8 tone array
    var boolArray   = trialArray.bool        // Get shuffled 8 boolean array
    var currentTime = context.currentTime;   // Initialize time
    var count       = boolArray.filter(Boolean).length; // Count correct answers

    console.log(`There are ${count} tones`);

    for(let i= 0; i<8; i++){
    if (boolArray[i] == true){
        console.log(i, 'Tone:')
        playTone(toneArray[i], toneDuration, currentTime);     // play tone
        playSilence(silenceDuration, currentTime+toneDuration); // wait
    } else if (boolArray[i] == false){
        console.log(i, 'Silence...')
        playSilence(toneDuration,    currentTime);              // substitute tone by silence
        playSilence(silenceDuration, currentTime+toneDuration); // wait
    }
    
    currentTime += toneDuration + silenceDuration             // Update clock    
    }
    setTimeout(function(){
        answerField.style.display = 'block'; // Show answer field
    }, 8000);
    validateButton.addEventListener('click', function(){
        var userAnswer = document.getElementById('userAnswer');
        answerField.style.display = 'none'; // Hide answer field
        resultsField.style.display = 'block';
        console.log('count', count)
        console.log('user', userAnswer.value)
        if (userAnswer.value == count){
            testResults.innerHTML = "Correct!"
        }
        else{
            testResults.innerHTML = "Incorrect"
        }
    }, false);
    // return {tones:toneArray, bool:boolArray, count:count};
}

const startButton  = document.getElementById('StartHearingTest');
var answerField    = document.getElementById('answerField');
var resultsField   = document.getElementById('resultsField');
var validateButton = document.getElementById('validateButton');
var testResults    = document.getElementById('testResults');
var context    = new AudioContext(); // Create audio container
var freqList   = [80,100,125,160,200,250,315,400,500,630,
                  800,1000,1250,1600,2000,2500,3150,4000,5000,6300,
                  8000];          // 3rd octave bands for ISO226 compatibility
var mandFreq        = [63,10000]; // mandatory frequencies (63 instead of 55)
var toneDuration    = 0.750;      // Pure tone playback duration in seconds
var silenceDuration = 0.250;      // Silence between tones in seconds

// AUDIO TEST
startButton.addEventListener('click', runTest, false)


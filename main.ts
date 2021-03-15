let num_pixels = 150
let mode = 0
let num_modes = 5
let strip = neopixel.create(DigitalPin.P0, num_pixels, NeoPixelMode.RGB)
let min = 1
let max = 360
radio.setGroup(7)
radio.onReceivedValue(function (name: string, value: number) {
    set_mode(value)  
})
class Wave {
    cycle_count: number
    speed_index: number
    speed_count: number
    display_length: number
    width:number
    magnitude:number
    
    constructor(display_length:number, speed_index:number, width:number, magnitude:number){
        this.display_length = display_length
        this.speed_index = speed_index
        this.width = width 
        this.magnitude = magnitude 
        this.cycle_count = num_pixels // start high so we can move waves backwards
        this.speed_count = 0
    }

    strength(index:number):number {
        return 0 
    }

    hue_shift(index:number):number {
        return 0 
    }

    move(direction: number): void{
        this.speed_count++
        if (this.speed_count >= this.speed_index) {       
            this.cycle_count += direction
            this.speed_count = 0       
        }
    }
}

class Wave_1 extends Wave {
    strength(index:number):number{
        let real_index = (index + this.cycle_count)% this.display_length
        let scale = 4 * this.magnitude
        if (real_index <=(this.width/3)){
            return real_index * scale
        }
        else if (real_index < this.width){
            return (this.width/2 - (real_index/2)) * scale
        } else{
            return 0
        }
    }
}

class Wave_2 extends Wave {
    hue_shift(index:number):number{
        let real_index = (index+this.cycle_count) % this.width
        if (real_index <(this.width/2)){
            return real_index * this.magnitude;
        } else {
            return (this.width -real_index) * this.magnitude
        }
    }
}

class Wave_3 extends Wave {
    hue_shift(index:number):number{
         let real_index = (this.cycle_count-index) % this.width
        if (real_index <(this.width/2)){
            return real_index * this.magnitude;
        } else {
            return (this.width- (real_index)) * this.magnitude
        }
    }
}

function show_leds(display_length:number, waves:Wave[]):void {
    for (let index=0; index<display_length; index++){
        let strength = 4
        let hue = 240
        for (let wave_index=0;wave_index<waves.length;wave_index++){
            let new_strength = waves[wave_index].strength(index)
            strength = Math.max(strength, new_strength)
            hue = hue + waves[wave_index].hue_shift(index)
        }
        strip.setPixelColor(index, neopixel.hsl(hue,255, strength ))
    }
    strip.show()
}

function move_waves(waves:Wave[]): void {
    for (let wave_index=0;wave_index<waves.length;wave_index++){
        waves[wave_index].move(1)
    }
}

let waves = [
    new Wave_1(120,1,30,1.5), 
    new Wave_1(150,2,40,1.2), 
    new Wave_1(500,3,50,1),
    new Wave_2(70,5,11,-2), 
    new Wave_3(110,4,9,-2)
]

let rainbow_hue = 0

function show_fire_leds(display_length:number, waves:Wave[]):void {
    for (let index=0; index<display_length; index++){
        let strength = 4
        let hue = 0
        for (let wave_index=0;wave_index<waves.length;wave_index++){
            let new_strength = waves[wave_index].strength(num_pixels-index)
            strength = Math.max(strength, new_strength)
            hue = hue + waves[wave_index].hue_shift(num_pixels-index)
        }
        strip.setPixelColor(index, neopixel.hsl(hue,255, strength ))
    }
    strip.show()
}

let fire_waves = [
    new Wave_1(120,1,30,1.5), 
    new Wave_1(150,2,40,1.2), 
    new Wave_1(500,3,50,1),
]

let grass_wind = 0

class GrassWave extends Wave {
    strength(index:number):number{
        let real_index = (index + this.cycle_count)% this.width+5
        let scale = 4 * this.magnitude



        if (real_index <=(this.width/2)){
            return real_index * scale
        }
        else if (real_index < this.width){
            return (this.width - (real_index)) * scale
        } else{
            return 0
        }
    }
}
let grass_waves = [
    new GrassWave(150, 2, 40, 1.5),
]

function show_grass_leds(display_length:number, waves:Wave[]):void {
    for (let index=0; index<display_length; index++){
        let strength = 4
        let hue = 135
        for (let wave_index=0;wave_index<waves.length;wave_index++){
            let new_strength = waves[wave_index].strength(index)
            strength = Math.max(strength, new_strength)
            //hue = hue + waves[wave_index].hue_shift(index)
        }
        strip.setPixelColor(index, neopixel.hsl(hue,255, strength ))
    }
    strip.show()
}
function move_grass(wind:number, waves:Wave[]): number {
    let direction = 0
    let wind_minimum = 20
    if(wind >wind_minimum*2) {
        direction = 2
        wind = wind -1
    } else if (wind >0) {
        direction = 1
        wind = wind -1
    } else if (wind == 0) {
        direction = 1
        while (Math.abs(wind)<wind_minimum) {
             wind = randint(-2*wind_minimum, 2*wind_minimum)
        }
    } else if (wind > -wind_minimum*2 ) {
        direction = -1
        wind = wind +1
    } else {
        direction = -2
        wind = wind +1
    }
    for (let wave_index=0;wave_index<waves.length;wave_index++){
        waves[wave_index].move(direction)
    }
    return wind
}


basic.forever(function () {
    switch(mode) {
    case 0:
        show_leds(num_pixels, waves)
        move_waves(waves)
        break;
    case 1:
        strip.showRainbow(rainbow_hue, (rainbow_hue+359)%360)
        rainbow_hue = (rainbow_hue + 1)%360
        break;
    
    case 2:
        show_fire_leds(num_pixels, fire_waves)
        move_waves(fire_waves)
        break
    case 3:
        strip.setPixelColor(0, neopixel.hsl(270, 255, input.soundLevel()+3))
        strip.shift()
        strip.show()
        break
    case 4:
        show_grass_leds(num_pixels, grass_waves)
        strip.show()
        grass_wind = move_grass(grass_wind, grass_waves)
        break
    }
})

input.onButtonPressed(Button.A, function () {
    set_mode(mode+1)
})

let mode_strings = [
    "Waves",
    "Rainbow",
    "Fire",
    "Volume",
    "Grass",
]

function set_mode(new_mode:number){
    if (mode != new_mode) {
        mode = (new_mode) % num_modes
        radio.sendValue("mode", mode)
        //basic.showString(mode_strings[mode])
    }
}
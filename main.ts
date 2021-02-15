let strip = neopixel.create(DigitalPin.P0, 60, NeoPixelMode.RGB)
let min = 1
let max = 360

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
        this.cycle_count = 0
        this.speed_count = 0
    }

    strength(index:number):number {
        return 0 //(index + this.cycle_count) % this.display_length
    }

    hue_shift(index:number):number {
        return 0 //(index + this.cycle_count) % this.display_length
    }

    move(): void{
        this.speed_count++
        if (this.speed_count >= this.speed_index) {       
            this.cycle_count += 1
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
        let real_index = (index+this.cycle_count) % this.display_length
        return (real_index%this.width)*2;
    }
}

class Wave_3 extends Wave {
    hue_shift(index:number):number{
        let real_index = (this.cycle_count - index) % this.display_length
        return(real_index %this.width) *2
    }
}
function show_leds(display_length:number, waves:Wave[]):void {
    for (let index=0; index<display_length; index++){
        let strength = 2
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
        waves[wave_index].move()
    }
}

let waves = [new Wave_1(120,1,30,2), new Wave_1(150,2,40,2), new Wave_1(500,3,45,1),new Wave_2(70,5,11,2), new Wave_3(110,4,9,2)]

basic.forever(function () {
    show_leds(60, waves)
    move_waves(waves)
})


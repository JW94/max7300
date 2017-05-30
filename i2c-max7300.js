'use strict';

var i2c = require('i2c');

var max7300aax = function(device, address) 
{
    this.device = device;
    this.address = address;
    this.lock = false;
    this.wire = new i2c(this.address,{device: this.device});
}


max7300aax.prototype.getModeMax7300 = function(callback)
{
    this.wire.readBytes(0x04,1, function(err,data)
        {
            if(!err)
            {
                for (var i = 0; i<data.length; i++) {
                    if (isNaN(parseInt(data[i]))) 
                    {
                        data[i] = 0;
                    }
                }
                callback(data[0]);
            }
            else
            {
                callback(err);
            }
    });
}

max7300aax.prototype.setModeMax7300 = function(mode,callback)
{
    this.wire.writeBytes(0x04,[mode , 0], function(err)
    {
        if(err)
        {
            callback(err);
        }
    });
}

max7300aax.prototype.getConfigPinMax7300 = function(int_pin,callback)
{
    var cmd = "";
    var tempConfig = "";
    var parsedConfig = "";
    var latestConfig = "";
    var int_port= "";
    if(int_pin >= 0 && int_pin < 4)
    {
        int_port = 0;
    }
    else if(int_pin >= 4 && int_pin < 8)
    {
        int_port = 1;
        int_pin = int_pin - 4;
    }
    else if(int_pin >= 8 && int_pin < 12)
    {
        int_port = 2;
        int_pin = int_pin - 8;
    }
    else if(int_pin >= 12 && int_pin < 16)
    {
        int_port = 3;
        int_pin = int_pin - 12;
    }
    else if(int_pin >= 16 && int_pin < 20)
    {
        int_port = 4;
        int_pin = int_pin - 16;
    }
    else if(int_pin >= 20 && int_pin < 24)
    {
        int_port = 5;
        int_pin = int_pin - 20;
    }
    
    switch(int_port)
    {
        case 0:
            cmd = 0x09;
            break;
        case 1:
            cmd = 0x0A;
            break;
        case 2:
            cmd = 0x0B;
            break;
        case 3:
            cmd = 0x0C;
            break;
        case 4:
            cmd = 0x0D;
            break;
        case 5:
            cmd = 0x0E;
            break;
    }
    this.wire.readBytes(cmd,1, function(err,data)
        {
            for (var i = 0; i<data.length; i++) {
                if (isNaN(parseInt(data[i]))) 
                {
                    data[i] = 0;
                }
            }
            latestConfig = data[0];
            for(i=0; i<4; i++)
            {
                // Look whether 1 or 2 at the two last bits
                tempConfig = latestConfig&3;
                // Write 0 or 1 in the last bit of new var
                switch (tempConfig) {
                    case 1:
                        parsedConfig = parsedConfig | 128;
                        break;
                    case 2:
                        parsedConfig = parsedConfig | 0;
                        break;
                    default:
                        //parsedConfig = 255;
                }
                // don't divide the last round
                if(i<3)
                {
                    // Make the last digit free for new val
                    parsedConfig = parsedConfig / 2;
                    // Shift var for new case
                    latestConfig = latestConfig / 4;
                }
            }
            // actually /16 is unecessary but it's running ;) therefore no change now
            // I expected that i need a 8bit variable but 4 bit is only needed
            if((parsedConfig/16) & Math.pow(2,int_pin))
            {
                data[0] = true;
            }
            else
            {
                data[0] = false;
            }
            callback(data[0]);
    });
}

max7300aax.prototype.setConfigPinMax7300 = function(int_pin,state,callback)
{
    var self = this;
    var port = "";
    var int_port= "";
    var int_pin_temp = int_pin;
    var i2cCon;
    if(int_pin >= 0 && int_pin < 4)
    {
        int_port = 0;
    }
    else if(int_pin >= 4 && int_pin < 8)
    {
        int_port = 1;
        int_pin = int_pin - 4;
    }
    else if(int_pin >= 8 && int_pin < 12)
    {
        int_port = 2;
        int_pin = int_pin - 8;
    }
    else if(int_pin >= 12 && int_pin < 16)
    {
        int_port = 3;
        int_pin = int_pin - 12;
    }
    else if(int_pin >= 16 && int_pin < 20)
    {
        int_port = 4;
        int_pin = int_pin - 16;
    }
    else if(int_pin >= 20 && int_pin < 24)
    {
        int_port = 5;
        int_pin = int_pin - 20;
    }
    
    switch(int_port)
    {
        case 0:
            port = 0x09;
            break;
        case 1:
            port = 0x0A;
            break;
        case 2:
            port = 0x0B;
            break;
        case 3:
            port = 0x0C;
            break;
        case 4:
            port = 0x0D;
            break;
        case 5:
            port = 0x0E;
            break;
    }
    i2cCon = this.wire;
    var _locked = setInterval(function()
    {
        if(!self.lock)
        {
            self.lock = true;
            i2cCon.readBytes(port,1, function(err,data)
            {
                for (var i = 0; i<data.length; i++) 
                {
                    if (isNaN(parseInt(data[i]))) 
                    {
                        data[i] = 0;
                    }
                }
                var latestConfig = data[0]
                latestConfig = latestConfig& ~(3 << (int_pin*2));
                if(state)
                {
                    latestConfig = latestConfig | (1 << 2*int_pin);
                }
                else
                {
                    latestConfig = latestConfig | (2 << 2*int_pin);
                }
                i2cCon.writeBytes(port,[latestConfig], function(err)
                {
                    callback(err);
                });
            });
            clearInterval(_locked);
            setTimeout(function()
            {
                self.lock = false;
            },10);
        }
    }, 100);
}

max7300aax.prototype.getStateMax7300 = function(int_pin,callback)
{
    var cmd = "";
    var int_port= "";
    if(int_pin >= 0 && int_pin < 8)
    {
        int_port = 0;
    }
    else if(int_pin >= 8 && int_pin < 16)
    {
        int_port = 1;
        int_pin = int_pin - 8;
    }
    else if(int_pin >= 16 && int_pin < 24)
    {
        int_port = 2;
        int_pin = int_pin - 16;
    }
    switch(int_port)
    {
        case 0:
            cmd = 0x44;
            break;
        case 1:
            cmd = 0x4C;
            break;
        case 2:
            cmd = 0x54;
            break;
    }
    this.wire.readBytes(cmd,1, function(err,data)
    {
        var state = 0;
        for (var i = 0; i<data.length; i++) {
            if (isNaN(parseInt(data[i]))) 
            {
                data[i] = 0;
            }
        }

        state = data[0] & Math.pow(2,int_pin);
        if(state !== 0)
        {
            data[0] = true;
        }
        else
        {
            data[0] = false;
        }
        callback(data[0]);
    });
}

max7300aax.prototype.setStatePinMax7300 = function(int_pin,state,callback)
{
    var self = this;
    var port = "";
    var int_port="";
    var int_pin_temp = int_pin;
    var i2cCon;
    if(int_pin >= 0 && int_pin < 8)
    {
        int_port = 0;
    }
    else if(int_pin >= 8 && int_pin < 16)
    {
        int_port = 1;
        int_pin = int_pin - 8;
    }
    else if(int_pin >= 16 && int_pin < 24)
    {
        int_port = 2;
        int_pin = int_pin - 16;
    }
    switch(int_port)
    {
        case 0:
            port = 0x44;
            break;
        case 1:
            port = 0x4C;
            break;
        case 2:
            port = 0x54;
            break;
    }
    i2cCon = self.wire;
    var _locked = setInterval(function()
    {
        if(!self.lock)
        {
            self.lock = true;
            i2cCon.readBytes(port,1, function(err,data)
            {
                for (var i = 0; i<data.length; i++) 
                {
                    if (isNaN(parseInt(data[i]))) 
                    {
                        data[i] = 0;
                    }
                }
                if(state)
                {
                    data[0]  |= (1 << int_pin);
                }
                else
                {
                    data[0]  &= ~(1 << int_pin);
                }
                i2cCon.writeBytes(port,[data[0]], function(err)
                {
                    callback(err);
                });
            });
            clearInterval(_locked);
            setTimeout(function()
            {
                self.lock = false;
            },10);
        }
    }, 100);
}

// Some tests
// var max = new max7300('/dev/i2c-2', 0x40);

// // max.getModeMax7300(function(data)
// // {
    // // console.log(data);
// // });

// var inter = setInterval(function()
// {
    // console.log(max.lock);
// },70);

 // max.getConfigPinMax7300(0,function(data)
// {
    // // returns the config of pins
    // // 0: p4p7
    // // 1: p8p11
    // // 2: p12p15
    // // 3: p16p19
    // // 4: p20p23
    // // 5: p24p27
    // console.log(data);
// });

 // max.setConfigPinMax7300(0,0,function(data)
// {
    // // returns the config of pins
    // // 0: p4p7
    // // 1: p8p11
    // // 2: p12p15
    // // 3: p16p19
    // // 4: p20p23
    // // 5: p24p27
    // console.log(data);
// });

// max.getStateMax7300(1,function(data)
// {
    // // returns the states of pins
    // // 0: p0.0
    // // 1: p0.1
    // // 2: p0.2....
    // console.log(data);
// });


// max.setStatePinMax7300(0,1,function(err)
// {
    // // returns the states of pins
    // // 0: p0.0
    // // 1: p0.1
    // // 2: p0.2....
    // console.log(err);
// });
// max.setStatePinMax7300(1,1,function(err)
// {
    // // returns the states of pins
    // // 0: p0.0
    // // 1: p0.1
    // // 2: p0.2....
    // console.log(err);
// });
// max.setStatePinMax7300(2,1,function(err)
// {
    // // returns the states of pins
    // // 0: p0.0
    // // 1: p0.1
    // // 2: p0.2....
    // console.log(err);
// });
// max.setStatePinMax7300(3,1,function(err)
// {
    // // returns the states of pins
    // // 0: p0.0
    // // 1: p0.1
    // // 2: p0.2....
    // console.log(err);
// });
// max.setStatePinMax7300(4,1,function(err)
// {
    // // returns the states of pins
    // // 0: p0.0
    // // 1: p0.1
    // // 2: p0.2....
    // console.log(err);
// });
module.exports = max7300aax;
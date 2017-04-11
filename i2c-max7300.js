var i2c = require('i2c');

var max7300 = function(device, address) 
{
	this.device = device;
	this.address = address;
	this.wire = new i2c(this.address,{device: this.device});
    var globalContext = this.context().global;
}


max7300.prototype.getModeMax7300 = function(callback)
{
    this.wire.readBytes(0x04,1, function(err,data)
        {
            for (var i = 0; i<data.length; i++) {
                if (isNaN(parseInt(data[i]))) 
                {
                    data[i] = 0;
                }			
            }
            callback(data[0]);
    });
}

max7300.prototype.getConfigMax7300 = function(int_port,callback)
{
    var cmd = "";
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
            callback(data[0]);
    });
}

max7300.prototype.getStateMax7300 = function(int_port,callback)
{
    var cmd = "";
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
            for (var i = 0; i<data.length; i++) {
                if (isNaN(parseInt(data[i]))) 
                {
                    data[i] = 0;
                }
            }
            callback(data[0]);
    });
}

max7300.prototype.test = function(callback)
{
    callback("Hallo");
}

// Some tests
// var max = new max7300('/dev/i2c-2', 0x40);

// max.getModeMax7300(function(data)
// {
    // console.log(data);
// });

// max.getConfigMax7300(0,function(data)
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

// max.getStateMax7300(0,function(data)
// {
    // // returns the config of pins
    // // 0: p0
    // // 1: p1
    // // 2: p2
    // console.log(data);
// });


module.exports = max7300;
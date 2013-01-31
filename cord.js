var LampCord = function(settings) {
	var self = this;
	self.settings = settings;
	self.r = Raphael("holder", 900, 800);
	self.el_progress = 0.5;
	self.locations = [];
	self.velocities = [];
	for (var i=0; i<self.settings.guide.length; ++i) {
		self.locations.push([self.settings.guide[i][0], self.settings.guide[i][1]]);
		self.velocities.push([0, 0]);
	}
	self.shades = [];
	self.n_shades = 10;
	for (var i=0; i<self.n_shades; ++i) {
	    var shade = self.r.path();
	    var x = i/(self.n_shades-1);
	    var c = (120 + 100 * Math.sin(x * Math.PI / 2)).toFixed();
	    var w = 2 + 8 * (1 - x);
	    shade.attr({
	        'stroke-width': w,
	        'stroke': "rgb(" + c + "," + c + "," + c + ")"
	    });
	    self.shades.push(shade);
	}
	self.bulb = self.r.rect(-50, -100, 100, 200, 10);
	self.el = self.r.path();
	self.el.attr({
	    'stroke-width': "2px",
//	    'stroke-linecap': "round",
	    'stroke': '#ffa'
	});
	self.run_loop = setInterval(function() {
		self.move_cord();
		self.draw_cord();
	}, 0);
};

LampCord.prototype.move_cord = function() {
	var self = this;
	var speed = self.settings.movement.speed;
	for (var i=0; i<self.settings.guide.length; ++i) {
		for (var j=0; j<2; ++j) {
			self.velocities[i][j] += (self.settings.guide[i][j] - self.locations[i][j]) * speed;
			self.velocities[i][j] += (Math.random()-0.5) * speed * self.settings.movement.randomness;
			self.velocities[i][j] *= 1.0 - speed * self.settings.movement.damping;
			self.locations[i][j] += self.velocities[i][j];
		}
	}
	self.el_progress = window.pageYOffset / (document.height -  window.innerHeight);
};

LampCord.prototype.draw_cord = function() {
	var self = this;
	var cord_path = self.get_path(self.locations);
	for (var i=0; i<self.n_shades; ++i) {
	    self.shades[i].attr('path', cord_path);
	}
	var last = self.locations.length-1;
	var dx = self.locations[last][0]-self.locations[last-1][0];
	var dy = self.locations[last][1]-self.locations[last-1][1];
	var angle = Math.atan(dx / -dy) * 180/Math.PI;
	if (dx < 0.0) {
		angle += 180;
	}
	self.bulb.attr('transform', 
			"T" + self.locations[last][0] + "," + self.locations[last][1] + 
			"R" + angle.toFixed(1) + 
			"t0,-100");
	self.bulb.attr('fill', (self.el_progress == 1.0)? "#ffa": "none");
    self.el.attr('path', self.shades[0].getSubpath(0, 
    		self.el_progress * self.shades[0].getTotalLength()));
};

LampCord.prototype.get_path = function(p) {
	var self = this;
	var path = "M" + p[0][0] + "," + p[0][1] + "C";
	path += p[1][0] + "," + p[1][1] + ",";
	var i;
	var last_control = p.length-2;
	for (i=1; i <= last_control; ++i) {
		path += 
			p[i][0].toFixed(1) + "," +
			p[i][1].toFixed(1) + ",";
		if (i < last_control) {
			path += 
				((p[i][0] + p[i+1][0]) / 2).toFixed(1) + "," +
				((p[i][1] + p[i+1][1]) / 2).toFixed(1) + "S";
		} else {
			path += 
				p[i+1][0].toFixed(1) + "," +
				p[i+1][1].toFixed(1);
		}
	}
	return path;
};


window.onload = function() {
	var g_lamp_cord = new LampCord({
		guide: [
		        [400, 100],
    			[500, 200],
				[400, 300],
				[500, 400],
				[400, 500]],
		movement: {
			speed: 0.001,
			damping: 1.0,
			randomness: 100.0
		}
	});
};
(function() {
  var canvas = document.getElementById('quakeCanvas');

  // Create our Planetary.js planet and set some initial values;
  // we use several custom plugins, defined at the bottom of the file
  var planet = planetaryjs.planet();
  planet.loadPlugin(autocenter({extraHeight: -120}));
  planet.loadPlugin(autoscale({extraHeight: -120}));
  planet.loadPlugin(planetaryjs.plugins.earth({
    topojson: { file:   '../static/world-110m.json' },
    oceans:   { fill:   '#001320' },
    land:     { fill:   '#06304e' },
    borders:  { stroke: '#001320' }
  }));
  planet.loadPlugin(planetaryjs.plugins.pings());
  planet.loadPlugin(planetaryjs.plugins.zoom({
    scaleExtent: [50, 5000]
  }));
  planet.loadPlugin(planetaryjs.plugins.drag({
    onDragStart: function() {
      this.plugins.autorotate.pause();
    },
    onDragEnd: function() {
      this.plugins.autorotate.resume();
    }
  }));
  planet.loadPlugin(autorotate(5));
  planet.projection.rotate([100, -10, 0]);
  planet.draw(canvas);

  var massDomain = [0, 100, 1000, 3000, 50000];

  // Color Scale
  var colors = d3.scale.pow()
    .clamp(true)
    .exponent(3)
    .domain(massDomain)
    .range(['white', 'yellow', 'orange', 'red', 'purple']);
  // Ping Size Scale
  var angles = d3.scale.pow()
    .clamp(true)
    .exponent(2)
    .domain([0, 10000])
    .range([4, 12]);

  // Ping Lifetime (miliseconds)
  var ttls = d3.scale.pow()
    .clamp(true)
    .exponent(3)
    .domain([0, 50000])
    .range([2000, 5000]);


d3.json('../static/Clean_Meteor_Data_NoArctic.json', function(err, data) {
    if (err) {
      alert("Problem loading the impact data.");
      return;
    }

    var index = 0;
    var jsonLength = Object.keys( data.year ).length;

    console.log(data["year"][0]);
    console.log(Object.keys( data.year ).length );


    var dataIterator = setInterval(function()
    { 
      if (index < jsonLength)
      {
        planet.plugins.pings.add(data["reclong"][index], data["reclat"][index], {
              angle: angles(data["mass_grams"][index]),
              color: colors(data["mass_grams"][index]),
              ttl: ttls(data["mass_grams"][index])
            });
        updateDate();
        index += 1;
      }
      else
      {
        console.log("Finished iterating through data");
        clearInterval(dataIterator);
      }

    }
      , 60);

    var updateDate = function() {
      d3.select('#date').text("Year: " + moment(data["year"][index]).format("YYYY"));
    };

    // // A scale that maps a percentage of playback to a time
    // // from the data; for example, `50` would map to the halfway
    // // mark between the first and last items in our data array.
    var sliderToIndex = d3.scale.linear()
      .domain([0, 100])
      .range([0, jsonLength]);


    var paused = false;

    // Pause playback and update the time display
    // while scrubbing using the range input.
    d3.select('#slider')
      .on('change', function(d) {
        index = Math.round(sliderToIndex(d3.event.target.value));
        console.log("New Index: " + index)

      })
      .call(d3.behavior.drag()
        .on('dragstart', function() {
          paused = true;
        })
        .on('dragend', function() {
          paused = false;
        })
      );

  });



  // Plugin to resize the canvas to fill the window and to
  // automatically center the planet when the window size changes
  function autocenter(options) {
    options = options || {};
    var needsCentering = false;
    var globe = null;

    var resize = function() {
      var width  = window.innerWidth + (options.extraWidth || 0);
      var height = window.innerHeight + (options.extraHeight || 0);
      globe.canvas.width = width;
      globe.canvas.height = height;
      globe.projection.translate([width / 2, height / 2]);
    };

    return function(planet) {
      globe = planet;
      planet.onInit(function() {
        needsCentering = true;
        d3.select(window).on('resize', function() {
          needsCentering = true;
        });
      });

      planet.onDraw(function() {
        if (needsCentering) { resize(); needsCentering = false; }
      });
    };
  };

  // Plugin to automatically scale the planet's projection based
  // on the window size when the planet is initialized
  function autoscale(options) {
    options = options || {};
    return function(planet) {
      planet.onInit(function() {
        var width  = window.innerWidth + (options.extraWidth || 0);
        var height = window.innerHeight + (options.extraHeight || 0);
        planet.projection.scale(Math.min(width, height) / 2);
      });
    };
  };

  // Plugin to automatically rotate the globe around its vertical
  // axis a configured number of degrees every second.
  function autorotate(degPerSec) {
    return function(planet) {
      var lastTick = null;
      var paused = false;
      planet.plugins.autorotate = {
        pause:  function() { paused = true;  },
        resume: function() { paused = false; }
      };
      planet.onDraw(function() {
        if (paused || !lastTick) {
          lastTick = new Date();
        } else {
          var now = new Date();
          var delta = now - lastTick;
          var rotation = planet.projection.rotate();
          rotation[0] += degPerSec * delta / 1000;
          if (rotation[0] >= 180) rotation[0] -= 360;
          planet.projection.rotate(rotation);
          lastTick = now;
        }
      });
    };
  };
})();
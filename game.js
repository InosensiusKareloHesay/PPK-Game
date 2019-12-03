var game;
var count = 0;
var iterasi = 0;
var score = 0;

var gameOptions = {
    timeLimit: 10
}

window.onload = function() {
    game = new Phaser.Game(640, 960, Phaser.CANVAS);
    game.state.add("PlayGame",playGame);
    game.state.start("PlayGame");
}

var playGame = function(game){};

playGame.prototype = {
    preload:function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
        game.load.image("awal", "assets/sprites/lt1.png");
        game.load.image("tengah", "assets/sprites/lt2.png");
        game.load.image("atap", "assets/sprites/Aset/Build-3.png");
        game.load.image("ground", "assets/sprites/ground.png");
        game.load.image("sky", "assets/sprites/sky.png");
        game.load.image("crate", "assets/sprites/crate.png");
        game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.xml");
        this.iterasi =0;
    },
  	create: function(){
        var sky = game.add.image(0, 0, "sky");
        sky.width = game.width;
        this.cameraGroup = game.add.group();
        this.crateGroup = game.add.group();
        this.cameraGroup.add(this.crateGroup);
        game.physics.startSystem(Phaser.Physics.BOX2D);
        game.physics.box2d.gravity.y = 1500;
        this.canDrop = true;
        this.movingCrate = game.add.sprite(50, 80, "awal");
        this.movingCrate.anchor.set(0.5);
        var crateTween = game.add.tween(this.movingCrate).to({
        x: game.width - 50
        }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
        this.cameraGroup.add(this.movingCrate);
        var ground = game.add.sprite(game.width / 2, game.height, "ground");
        ground.y = game.height - ground.height / 2;
        console.log(ground.y);
        ground.preUpdate();
        game.physics.box2d.enable(ground);
        ground.body.friction = 0.8;
        ground.body.static = true;
        ground.body.setCollisionCategory(1);
        this.cameraGroup.add(ground)
        this.timeText = game.add.text(20, 20, "30", { fontSize : '50px', fill : '#000' });
        game.input.onDown.add(this.dropCrate, this);
        this.timer = 0;
        this.timerEvent = null;
	},
    dropCrate: function(){
        //if(this.canDrop && this.timer < gameOptions.timeLimit){
            if(this.timerEvent == null){
                this.timerEvent = game.time.events.loop(Phaser.Timer.SECOND, this.tick, this);
            }
            this.canDrop = false;
            this.movingCrate.alpha = 0;
            if(this.iterasi == 0){
                var fallingCrate = game.add.sprite(this.movingCrate.x, this.movingCrate.y, "awal");
            } else{
                var fallingCrate = game.add.sprite(this.movingCrate.x, this.movingCrate.y, "tengah");
            }
            this.iterasi++;
            fallingCrate.hit = false;
            game.physics.box2d.enable(fallingCrate);
            fallingCrate.body.friction = 0.8;
            this.crateGroup.add(fallingCrate);
            fallingCrate.preUpdate();
            fallingCrate.body.setCollisionCategory(1);
            fallingCrate.body.setCategoryContactCallback(1, function(b){
                this.canDrop = true;
                this.movingCrate.alpha = 1;
                this.movingCrate.loadTexture("tengah");
                this.movingCrate.preUpdate();
                b.setCategoryContactCallback(1);
                b.sprite.hit = true;
                this.getMaxHeight();
            }, this);
        //}
    },
    update: function(){
        this.crateGroup.forEach(function(i){
            if(i.y > game.height + i.height){
                if(!i.hit){
                    this.canDrop = true;
                    this.movingCrate.alpha = 1;
                    //this.movingCrate.sprite(this.movingCrate.x, this.movingCrate.y, "tengah");
                    this.movingCrate.preUpdate();
                    this.getMaxHeight();
                }
                i.destroy();
            }
        }, this);
    },
    scaleCamera: function(height){
        var moveTween = game.add.tween(this.cameraGroup).to({
            y: height * 130,
        }, 200, Phaser.Easing.Quadratic.IN, true);
        //this.movingCrate.kill();
        //iterasi++;
        //var scaleTween = game.add.tween(this.cameraGroup.scale).to({
        //    x: cameraScale,
        //    y: cameraScale,
        //}, 200, Phaser.Easing.Quadratic.IN, true);
        //this.scaleTween.onComplete.add(function(){
        //    this.canDrop = true;
        //    this.movingCrate.alpha = 1;
        //    this.movingCrate.preUpdate();
        //}, this)
    },
    getMaxHeight: function(){
        var maxHeight = 0;
        var height = 0;
        this.crateGroup.forEach(function(i){
            height = Math.round(Math.abs(792 - i.y) / i.height);
            maxHeight = Math.max(height, maxHeight); 
        }, this);
        //if(maxHeight >= 3){
        console.log(maxHeight);
        this.movingCrate.y = 792 - (maxHeight) * 130 - 690;
        var newHeight = game.height + 130 * maxHeight;
        var ratio = game.height / maxHeight;
        this.score = maxHeight;
        //this.cameraGroup.y = height * 130;
        this.scaleCamera(maxHeight);
        //} else {
        //    var newHeight = game.height + 150 * maxHeight;
        //    var ratio = game.height / newHeight;
        //    this.scaleCamera(ratio);
        //    count++;
        //}
    },
    tick: function(){
        this.timer++;
        this.timeText.text = (gameOptions.timeLimit - this.timer).toString()
        if(this.timer >= gameOptions.timeLimit){
            game.time.events.remove(this.timerEvent);
            game.time.events.add(Phaser.Timer.SECOND * 2, function(){
                this.removeEvent = game.time.events.loop(Phaser.Timer.SECOND / 4, this.removeCrate, this);
            }, this);
        }
    },
    removeCrate: function(){
        if(this.crateGroup.children.length > 0){
            this.crateGroup.getChildAt(0).destroy();
        }
        else{
            game.time.events.remove(this.removeEvent);
            game.add.sprite(this.movingCrate.x, this.movingCrate.y, "tengah");
            //this.movingCrate.destroy();
            this.timeText = game.add.text(400, 20, "Score : "+this.score.toString(), { fontSize : '50px', fill : '#000' });
        }
    }
}

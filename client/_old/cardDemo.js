function init(){
	window.onresize = function(){
		stage.canvas.width = window.innerWidth-300;
		stage.canvas.height = window.innerHeight;

		var wCenter = window.grid.getWeightedCenterCoords();
		window.grid.x = canvas.width/2-wCenter[0];
		window.grid.y = (canvas.height - C.grid.margin - C.grid.cardSize)/2-wCenter[1];
		console.log(wCenter);

		window.hand.x = C.grid.margin;
		window.hand.y = canvas.height - C.grid.margin - C.grid.cardSize;

		window.decks.x = canvas.width - C.grid.margin - C.grid.cardSize;
		window.decks.y = canvas.height - C.grid.margin - C.grid.cardSize;
		stage.update();
	};

	var canvas = document.getElementById("demoCanvas");
	//canvas.width = C.canvas.widthInCards*(C.grid.cardSize+C.grid.margin)+C.grid.margin;
	//canvas.height = C.canvas.heightInCards*(C.grid.cardSize+C.grid.margin)+C.grid.margin;

	window.stage = new createjs.Stage(canvas);
	stage.enableMouseOver();

	window.grid = new Grid();
	stage.addChild(window.grid);

	window.hand = new HandGroup();
	stage.addChild(window.hand);

	window.decks = new CardDecks([]);
	stage.addChild(decks);

	var cards = [
		["Glitter Shell","../art/glitter.jpeg","malefemale","unicorn",1,"replace"],
		["Fluttershy","../art/flutter.png","female","pegasus",0,"swap"],
		["Braeburn","../art/brae.png","male","earth",0,"draw"],
		["Fausticorn","../art/faust.png","female","alicorn",0,"newGoal"],
		["Gummy","../art/gummy.png","male",0,1,"search"],
		["Ripp","../art/ripp.jpg","male","pegasus",0,"copy"],
		["Eiro","../art/eiro.jpg","female","pegasus",0,"replace"],
		["Silvia","../art/silvia.png","female","pegasus",0,"swap"],
		["Coke","../art/coke.png","female","earth",0,"draw"],
		["camc0n","../art/camc0n.jpg","female","earth",0,"newGoal"]
	], ships = [
		["Kissing booth","../art/booth.png",""],
		["On the seas","../art/ship.png",""],
		["Ear nibbles","../art/ear.jpg",""],
		["Pony Hugs","../art/triple.png",""],
		["Married","../art/married.png",""],
		["Baby Pics","../art/babyPics.jpg",""],
		["Gay for dash","../art/gayForDashie.png",""]
	];

	var s = new StartCard("Give me money.png","../art/giveMoney","female","alicorn",0);
	window.grid.addPony(s,0,0);
	var i,c;
	for(i=0;i<ships.length;i++){
		c = new HandShipCard(ships[i][0],ships[i][1],ships[i][2]);
		decks.addCard(c,decks.RANDOM);
	}
	for(i=0;i<cards.length;i++){
		c = new PonyCard(cards[i][0],cards[i][1],cards[i][2],cards[i][3],cards[i][4],cards[i][5]);
		decks.addCard(c,decks.RANDOM);
	}
	hand.addCards(decks.drawCard("pony",4));
	hand.addCards(decks.drawCard("ship",3));

	window.onresize();
	stage.update();
}

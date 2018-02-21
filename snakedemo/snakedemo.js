let world
let hightscore
let lifescore
let generations
let genCounter = 0
let maxLength = 0
let maxMeanLength = 0
let maxLife = 0
let maxMeanLife = 0
let doDraw

function setup() {
	createCanvas(500, 500)
	createP('')
	doDraw = createCheckbox('Do draw', true)
	generations = createSpan('')
	createP('')
	highscore = createSpan('')
	createP('')
	lifescore = createSpan('')

	world = new World(10, 500)
}

function draw() {
	if (doDraw.checked()) {
		drawBoard()
		world.show()
	}
	update()
}

function drawBoard() {
	background(40)
}

function update() {
	if (world.done()) {
		updateStatistics()
		world.breed()
	} else {
		world.update()
	}
}

function updateStatistics() {
	let currentMaxLength = world.snakes.reduce((max, s) => Math.max(max, s.tail.length + 1), 0)
	let currentMeanLength = world.snakes.reduce((sum, s) => sum + s.tail.length + 1, 0) / world.snakes.length
	let currentMaxLife = world.snakes.reduce((max, s) => Math.max(max, s.lifetime), 0)
	let currentMeanLife = world.snakes.reduce((sum, s) => sum + s.lifetime, 0) / world.snakes.length

	maxLength = max(maxLength, currentMaxLength)
	maxMeanLength = max(maxMeanLength, currentMeanLength)
	maxLife = max(maxLife, currentMaxLife)
	maxMeanLife = max(maxMeanLife, currentMeanLife)

	generations.html('Generations: ' + (++genCounter))
	highscore.html(
		'Longest snake: ' + maxLength + ' (' + currentMaxLength + ')' +
		' mean: ' + maxMeanLength + ' (' + currentMeanLength + ')'
	)
	lifescore.html(
		'Longest life: ' + maxLife + ' (' + currentMaxLife + ')' +
		' mean: ' + maxMeanLife + ' (' + currentMeanLife + ')'
	)
}

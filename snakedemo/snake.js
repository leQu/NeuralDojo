class Snake {
    constructor(gridsize, brain, legend = 0) {
        this.head = createVector(width / 2, height / 2)
        this.tail = [
            this.head.copy().sub(1 * gridsize, 0),
            this.head.copy().sub(2 * gridsize, 0),
            this.head.copy().sub(3 * gridsize, 0)
        ]
        this.gridsize = gridsize
        this.eaten = []
        this.food = this.makeFood()
        this.alive = true
        this.leftToLive = 200
        this.lifetime = 0
        this.brain = brain
        this.legend = legend
        this.mutationrate = 0.01
    }

    update() {
        if (this.alive) {
            let dir = this.nextMove()

            this.alive = this.deathCheck(dir)
            if (this.alive) {
                this.lifetime++
                // do move
                let last = this.head
                for (let i = 0; i < this.tail.length; i++) {
                    let temp = this.tail[i]
                    this.tail[i] = last
                    last = temp
                }
                this.head = p5.Vector.add(this.head, dir)

                // check if eat
                if (this.head.equals(this.food.pos)) {
                    this.leftToLive += 100
                    this.tail.push(this.head.copy())
                    this.food.eaten = true
                    this.eaten.push(this.food)
                    this.food = this.makeFood()
                }
            }
        }
    }

    fitness() {
        return (this.tail.length + 1) * pow(this.lifetime, 2)
    }

    makeChild(partner) {
        let childBrain = this.brain.crossover(partner.brain)
        let mRate = (this.mutationrate + partner.mutationrate) / 2
        let child = new Snake(this.gridsize, childBrain.mutate(mRate))
        child.mutationrate = random() < mRate ? mRate * random(0.5, 1.5) : mRate
        return child
    }

    nextMove() {
        return this.brain.decideMove(this.look()).mult(this.gridsize)
    }

    look() {
        const directions = [
            createVector(-this.gridsize, 0),
            createVector(-this.gridsize, -this.gridsize),
            createVector(0, -this.gridsize),
            createVector(this.gridsize, -this.gridsize),
            createVector(this.gridsize, 0),
            createVector(this.gridsize, this.gridsize),
            createVector(0, this.gridsize),
            createVector(-this.gridsize, this.gridsize)
        ]
        const inDirection = v => {
            let result = [0, 0, 0]
            let p = this.head.copy()
            let d = 0
            while (true) {
                p.add(v)
                d++
                if (result[0] == 0 && this.food.pos.equals(p)) {
                    result[0] = 1
                }
                if (result[1] == 0 && this.onTail(p)) {
                    result[1] = 1 / d
                }
                if (result[2] == 0 && !this.onBoard(p)) {
                    result[2] = 1 / d
                    break
                }
            }
            return result
        }
        return directions.map(d => inDirection(d)).reduce((acc, v) => acc.concat(v), [])

    }

    deathCheck(dir) {
        // check if death is eminent
        let nextPos = p5.Vector.add(this.head, dir)
        if (--this.leftToLive < 0) {
            return false
        }
        if (!this.onBoard(nextPos)) {
            return false
        }
        if (this.onTail(nextPos)) {
            return false
        }
        return this.alive
    }

    onTail(p) {
        return this.tail.some(t => t.equals(p))
    }

    makeFood() {
        while (true) {
            let food = new Food(this.gridsize)
            if (!this.onTail(food.pos))
                return food
        }
    }

    onBoard(p) {
        const inConstrain = (val, lower, upper) => val >= lower && val < upper
        return inConstrain(p.x, 0, width) && inConstrain(p.y, 0, height)
    }

    show() {
        if (this.alive) {
            this.eaten.forEach(f => f.show())
        }
        stroke(0)
        this.alive ? fill(150, 100, 100) : fill(100)
        this.tail.forEach(t => rect(t.x + 1, t.y + 1, this.gridsize - 2, this.gridsize - 2))
        this.alive ? fill(255, 200, 200) : fill(255)
        rect(this.head.x, this.head.y, this.gridsize, this.gridsize)
        if (this.alive) {
            this.food.show()
        }
    }
}

class SnakeBrain {
    constructor() {
        this.brain = new NeuralNetwork(24, 18, 4)
    }

    decideMove(impressions) {
        let output = this.brain.predict(impressions)
        let maxOut = output.reduce((acc, o, i) => o < acc[0] ? acc : [o, i], [-1, -1])[1]
        switch (maxOut) {
            case 0: return createVector(-1, 0)
            case 1: return createVector(0, -1)
            case 2: return createVector(1, 0)
            case 3: return createVector(0, 1)
        }
    }

    crossover(other) {
        let childBrain = new SnakeBrain()
        let crossoverrate = Math.random()
        childBrain.weights_I2H = this.brain.weights_I2H.crossover(other.brain.weights_I2H, crossoverrate)
        childBrain.weights_H2H = this.brain.weights_H2H.crossover(other.brain.weights_H2H, crossoverrate)
        childBrain.weights_H2O = this.brain.weights_H2O.crossover(other.brain.weights_H2O, crossoverrate)
        return childBrain
    }

    mutate(mutationrate) {
        this.brain.weights_I2H = this.brain.weights_I2H.mutate(mutationrate)
        this.brain.weights_H2H = this.brain.weights_H2H.mutate(mutationrate)
        this.brain.weights_H2O = this.brain.weights_H2O.mutate(mutationrate)
        return this
    }
}

class Food {
    constructor(gridsize) {
        this.gridsize = gridsize
        this.eaten = false
        this.pos = createVector(
            (random(width / gridsize) | 0) * gridsize,
            (random(height / gridsize) | 0) * gridsize
        )
    }

    show() {

        if (this.eaten) {
            noFill()
            stroke(0, 200, 0)
        } else {
            fill(0, 200, 0)
            stroke(0)
        }
        let offset = 2
        rect(this.pos.x + offset, this.pos.y + offset,
            this.gridsize - 2 * offset, this.gridsize - 2 * offset)
    }
}
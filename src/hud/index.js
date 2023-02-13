import Phaser from "phaser"
export default class Hud extends Phaser.GameObjects.Container{
    constructor(scene, x, y){
        super(scene, x, y);

        scene.add.existing(this);

        const {rightTopCorner} = scene.config;
        this.containerWidth = 70;
        this.setPosition(rightTopCorner.x - this.containerWidth, rightTopCorner.y + 10);
        this.setScrollFactor(0);
        this.setupList();
        this.fontSize = 20;

    }

    setupList(){
        const scoreboard = this.createScoreBoard();

        const scoreboard2 = this.scene.add.text(0, 0, 'Hello', {fontSize: `${this.fontSize}px`, fill: '#fff'});

        this.add([scoreboard, scoreboard2]);

        let lineHeight = 0;
        this.list.forEach(item =>{
            item.setPosition(item.x, item.y + lineHeight);
            lineHeight += 20;
        })
    }

    createScoreBoard(){
        const scoreText = this.scene.add.text(0, 0, '0', {fontSize: `${this.fontSize}px`, fill: '#fff'});
        const scoreImage = this.scene.add.image(scoreText.width + 5, 0, 'diamond').setOrigin(0).setScale(1.3);

        const scoreboard = this.scene.add.container(0, 0, [scoreText, scoreImage]);
        scoreboard.setName('scoreboard');
        return scoreboard;
    }

    updateScoreboard(score){
        const [scoreText, scoreImage] = this.getByName('scoreboard').list;
        scoreText.setText(score);
        scoreImage.setX(scoreText.width + 5 );
    }
}
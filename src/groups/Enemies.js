import Phaser from "phaser";
import collidable from "../mixins/collidable";
import { ENEMY_TYPES } from "../types";

class Enemies extends Phaser.GameObjects.Group {
    constructor(scene){
        super(scene);

        Object.assign(this, collidable)
    }

    getProjectiles(){
        const projectiles = new Phaser.GameObjects.Group();
        this.getChildren().forEach(enemy => {
            enemy.projectiles && projectiles.addMultiple(enemy.projectiles.getChildren())
        })

        return projectiles;
    }

    getTypes(){
        return ENEMY_TYPES;
    }
}

export default Enemies;
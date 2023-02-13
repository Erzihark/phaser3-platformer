import Phaser from "phaser";
import Projectile from "./Projectile";
import { getTimeStamp } from "../utils/functions";

export default  class Projectiles extends Phaser.Physics.Arcade.Group {
    constructor(scene, key){
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 5, 
            active: false,
            visible: false,
            key: key,
            classType: Projectile
        })

        this.timeSinceLastShot = null;

    }

    fireProjectile(initiator, anim){
        const projectile = this.getFirstDead(false);

        if (!projectile) return;
        if (this.timeSinceLastShot && this.timeSinceLastShot + projectile.cooldown > getTimeStamp()) return;

        const center = initiator.getCenter();
        let centerX;

        if(initiator.lastDirection === Phaser.Physics.Arcade.FACING_RIGHT){
            projectile.speed = Math.abs(projectile.speed);
            projectile.setFlipX(false);
            centerX = center.x + 10;
        } else {
            projectile.speed = -Math.abs(projectile.speed);
            projectile.setFlipX(true);
            centerX = center.x - 10;

        }

        projectile.fire(centerX, center.y, anim);
        this.timeSinceLastShot = getTimeStamp();
    }

}


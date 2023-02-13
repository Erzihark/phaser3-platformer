import Phaser from "phaser";
import Collectable from "../collectables/Collectable";

export default class Collectables extends Phaser.Physics.Arcade.StaticGroup {
    constructor(scene){
        super(scene.physics.world, scene);

        this.createFromConfig({
            classType: Collectable,
            
        })
    }

    mapProperties(propertiesList){
        if(!propertiesList || propertiesList.length === 0) return {};
        return propertiesList.reduce((map, obj)=>{
            if(obj.hasOwnProperty('properties')){
                const props = obj.properties;
                props.forEach((prop)=>{
                    map[prop.name] = prop.value;
                })
            }
            return map;
        }, {})
    }

    addFromLayer(layer){
        const {score, type} = this.mapProperties(layer);
        layer.forEach( collectableO =>{
            const collectable = this.get(collectableO.x, collectableO.y, type);

            const props = this.mapProperties(collectableO.properties);
            collectable.score = props.score || score;
        });

        const a = this.getChildren()//.map(diamond => diamond.score);
    }
}